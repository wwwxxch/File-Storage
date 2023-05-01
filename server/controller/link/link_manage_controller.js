import { DateTime } from "luxon";
import dotenv from "dotenv";

dotenv.config();
const { NODE_ENV, LOCAL_HOST, PROD_HOST } = process.env;

let HOST;
if (NODE_ENV === "dev") {
	HOST = LOCAL_HOST;
} else if (NODE_ENV === "prod") {
	HOST = PROD_HOST;
}

import { customError } from "../../error/custom_error.js";

import { getMultipleUserId, getPossibleUser } from "../../model/db_user.js";
import {
	addUserToAcessList,
	changeLinkToPrivate,
	changeLinkToPublic,
	checkLinkByFFId,
	createPrivateLink,
	createPublicLink,
	deleteLinkByFFId,
} from "../../model/db_share.js";

import { shareTokenGenerator } from "../../service/share/token_gen.js";

import { emitShareNoti, emitLinksYouShared } from "../../service/sync/list.js";

// ============================================================
const createLinkCheck = async (req, res, next) => {
	console.log("createLinkCheck: ", req.body); // access & path
  const { targetId } = req.body;
	const userId = req.session.user.id;
	const shareStatus = await checkLinkByFFId(targetId, userId);
	console.log("shareStatus: ", shareStatus);
	if (!shareStatus) {
		return next(customError.badRequest("No such key"));
	}

	req.shareStatus = shareStatus;

	next();
};

const publicLink = async (req, res, next) => {
	if (req.body.access.type === "private") {
		return next();
	}
  const { targetId } = req.body;
  const { shareStatus } = req;
  const type = shareStatus.type;
	
  let token;
  if (!shareStatus.share_token) {
		// no link ->
		// update ff table with is_public = 1 & share_token
		token = shareTokenGenerator();
		const createLinkRes = await createPublicLink(targetId, token);
		console.log("createLinkRes: ", createLinkRes);

    if (!createLinkRes) {
      return next(customError.internalServerError());
    } else if (createLinkRes.affectedRows !== 1) {
      return next(customError.badRequest());
    }

	} else if (shareStatus.is_public === 1) {
		// public link -> return existed link
		token = shareStatus.share_token;

	} else if (shareStatus.is_public === 0) {
		// private link ->
		// delete records in share_link_perm & let ff.is_public = 1
		// return existed link
		const changeLinkRes = await changeLinkToPublic(targetId);
		console.log("changeLinkRes: ", changeLinkRes);
    
    if (!changeLinkRes) {
      return next(customError.internalServerError());
    }
		token = shareStatus.share_token;
	}

	const share_link =
		type === "folder" ? `${HOST}/view/fo/${token}` : `${HOST}/view/fi/${token}`;

	return res.json({ share_link });
};

const privateLink = async (req, res, next) => {
	const { access } = req.body;
  const uniqueSet = new Set(access.user);
  const uniqueEmails = [...uniqueSet];
  const userEmail = req.session.user.email;
  if (uniqueEmails.length === 0 || uniqueSet.has(userEmail)) {
    return next(customError.badRequest("Please enter at least one email."));
  }
  
  console.log("uniqueEmails: ", uniqueEmails);
  
	const userList = await getMultipleUserId("email", uniqueEmails, userEmail);
	console.log("userList: ", userList);
  if (!userList) {
    return next(customError.internalServerError());
  }

	if (userList.length === 0 || userList.length !== uniqueEmails.length) {
		return next(
			customError.badRequest("Some users do not exist. Please check again.")
		);
	}

  const { targetId } = req.body;
  const { shareStatus } = req;
  const type = shareStatus.type;
	
  let token;
	const now = DateTime.utc();
	const nowTime = now.toFormat("yyyy-MM-dd HH:mm:ss");
	if (!shareStatus.share_token) {
		// no link ->
		// link to user table find other users' id &
		// update ff table with share_token &
		// update share_link_perm table
		token = shareTokenGenerator();
		const createLinkRes = await createPrivateLink(
			targetId,
			token,
			nowTime,
			userList
		);
		console.log("createLinkRes: ", createLinkRes);

    if (!createLinkRes) {
      return next(customError.internalServerError());
    }

	} else if (shareStatus.is_public === 1) {
		// public link -> return existed link
		// link to user table find other users' id &
		// update ff table with is_public = 0 &
		// update share_link_perm table
		// return existed link
		const changeLinkRes = await changeLinkToPrivate(
			targetId,
			nowTime,
			userList
		);
		console.log("changeLinkRes: ", changeLinkRes);

    if (!changeLinkRes) {
      return next(customError.internalServerError());
    }

		token = shareStatus.share_token;
	} else if (shareStatus.is_public === 0) {
		// private link
		// link to user table find other users' id =>
		// check if this user is in share_link_perm table &
		// update share_link_perm table

    // TODO: add user ? - update instruction in FE?
		const grantAccess = await addUserToAcessList(targetId, nowTime, userList);
		console.log("grantAccess: ", grantAccess);
		token = shareStatus.share_token;
	}

	const share_link =
		type === "folder" ? `${HOST}/view/fo/${token}` : `${HOST}/view/fi/${token}`;

	// emit notification
	const io = req.app.get("socketio");
	for (let i = 0; i < userList.length; i++) {
		emitShareNoti(io, userList[i]);
	}

	return res.json({ share_link });
};

const revokeLink = async (req, res, next) => {
	console.log("revokeLink: ", req.body);
	const { ff_id } = req.body;
	const userId = req.session.user.id;

	const shareStatus = await checkLinkByFFId(ff_id, userId);
  // const shareStatus = null;
	console.log("shareStatus: ", shareStatus);

	if (!shareStatus) {
		return next(customError.badRequest("No such key"));
	}

	if (!shareStatus.share_token) {
		return next(customError.badRequest("No link to be revoked"));
	}

	const revokeLinkInDB = await deleteLinkByFFId(
		userId,
		ff_id,
		shareStatus.is_public
	);
	console.log("revokeLinkInDB: ", revokeLinkInDB);
	if (!revokeLinkInDB) {
		return next(customError.internalServerError());
	}

	// emit new link list
	const io = req.app.get("socketio");
	emitLinksYouShared(io, userId);
	return res.json({ msg: "ok" });
};

const userSearch = async (req, res, next) => {
	const { q } = req.query;
	if (!q) {
		return next(customError.badRequest("Query string is missing"));
	}
  const userEmail = req.session.user.email;
	const possibleEmail = await getPossibleUser(q, userEmail);
	return res.json({ list: possibleEmail });
};

export { createLinkCheck, publicLink, privateLink, revokeLink, userSearch };
