import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";

import { customError } from "../../error/custom_error.js";

import dotenv from "dotenv";
dotenv.config();
const { S3_MAIN_BUCKET_NAME } = process.env;

import { s3clientGeneral } from "../../service/s3/s3_client.js";
import { copyS3Obj } from "../../service/s3/s3_copy.js";

import {
	restoreFileToPrev,
	restoreDeletedFile,
	commitMetadata,
} from "../../model/db_ff_u.js";
import { updateSpaceUsedByUser } from "../../model/db_plan.js";
import {
	iterForParentId,
	findFileIdByPath,
	findDeletedFileIdByPath,
} from "../../service/path/iter.js";
import { restoreRecur } from "../../service/path/recur.js";

import {
	emitNewList,
	emitHistoryList,
	emitTrashList,
	emitUsage,
} from "../../service/sync/list.js";
import { getCurrentSizeByFileId, getSizeByFileIdAndVersion } from "../../model/db_ff_r.js";
// ===================================================================================
const restoreHistory = async (req, res, next) => {
	console.log("restoreHistory ", req.body);
	const { version, fileWholePath, parentPath } = req.body;
	const userId = req.session.user.id;
	const decodeFileWholePath = decodeURIComponent(fileWholePath);
	const decodeParentPath = decodeURIComponent(parentPath);

	// find the fileId by path
	const fileId = await findFileIdByPath(userId, decodeFileWholePath);
  // const fileId = -1;
	console.log("fileId: ", fileId);
	if (fileId === -1) {
		return next(customError.badRequest("No such key"));
	}

	// check capacity
  const targetSize = await getSizeByFileIdAndVersion(fileId, version);
  if (targetSize < 0) {
    return next(customError.badRequest("Cannot find record by this file id and version"));
  }
  const currentSize = await getCurrentSizeByFileId(fileId);
  if (currentSize < 0) {
    return next(customError.internalServerError());
  }
  console.log("targetSize: ", targetSize);
  console.log("currentSize: ", currentSize);

  const allocated = Number(req.session.user.allocated);
	const used = Number(req.session.user.used);
  if (used - currentSize + targetSize > allocated) {
		return next(customError.badRequest("Not enough space"));
	}

  // update DB
	const token = uuidv4();
	const now = DateTime.utc();
	const nowTime = now.toFormat("yyyy-MM-dd HH:mm:ss");
	const restore = await restoreFileToPrev(
		token,
		fileId,
		version,
		nowTime,
		userId
	);
	console.log("restore: ", restore); // new version
	if (!restore) {
		return next(customError.internalServerError());
	}

	// update S3 - copy this version file as new version file (S3)
	const newRecordInS3 = await copyS3Obj(
		s3clientGeneral,
		S3_MAIN_BUCKET_NAME,
		`user_${userId}/${fileWholePath}.v${version}`,
		`user_${userId}/${decodeFileWholePath}.v${restore.new_ver}`
	);
  // const newRecordInS3 = null;
	console.log("newRecordInS3: ", newRecordInS3);
	if (!newRecordInS3) {
		return next(customError.internalServerError());
	}

	// commit metadata
	const commit = await commitMetadata("done", token);
	if (!commit) {
		return next(customError.internalServerError());
	}

	// update usage of an user
	const currentUsed = await updateSpaceUsedByUser(userId, nowTime);
	if (currentUsed === -1) {
		return next(customError.internalServerError());
	}
	req.session.user.used = currentUsed;

	// emit new list
	const io = req.app.get("socketio");
	emitNewList(io, userId, decodeParentPath);
	emitHistoryList(io, userId, fileId);
	emitUsage(io, userId, req.session.user);

	return res.json({ msg: "ok" });
};

const restoreDeleted = async (req, res, next) => {
	console.log("restoreDeleted: ", req.body);
	const { restoreList } = req.body;
	const userId = req.session.user.id;

	// if it's folder -> find the children under deleted folder
	// if it's file -> find the deleted file by path
	const token = uuidv4();
	const now = DateTime.utc();
	const nowTime = now.toFormat("yyyy-MM-dd HH:mm:ss");
	for (let i = 0; i < restoreList.length; i++) {
		let key = restoreList[i];
		let encodeKey = encodeURIComponent(restoreList[i]);

		if (key.endsWith("/")) {
			// get parentId
			const folders = key.slice(0, key.length - 1).split("/");
			const parentId = await iterForParentId(userId, folders);
			console.log("parentId: ", parentId);
			if (parentId === -1) {
				return next(customError.badRequest("No such key"));
			}

			// update DB & S3
			const restoreRecurRes = await restoreRecur(
				parentId,
				key.replace(/\/$/, ""),
				nowTime,
				token,
				userId,
        req.session
			);
			console.log("restoreRecurRes: ", restoreRecurRes);
			if (!restoreRecurRes) {
				return next(customError.internalServerError());
			}
		} else {
			// get fileId
			const fileId = await findDeletedFileIdByPath(userId, key);
      // const fileId = -1;
			console.log("fileId: ", fileId);
			if (fileId === -1) {
				return next(customError.badRequest("No such key"));
			}

      // check capacity
      const currentSize = await getCurrentSizeByFileId(fileId);
      if (currentSize < 0) {
        return next(customError.internalServerError());
      }
      console.log("currentSize: ", currentSize);
      
      const allocated = Number(req.session.user.allocated);
      const used = Number(req.session.user.used);
      if (used + currentSize > allocated) {
        return next(customError.badRequest("Not enough space"));
      }

			// update DB
			const restoreDeleted = await restoreDeletedFile(
				token,
				fileId,
				nowTime,
				userId
			);
			console.log("restoreDeleted: ", restoreDeleted); // cur version & new version
			if (!restoreDeleted) {
				return next(customError.internalServerError());
			}

			// update S3
			const newRecordInS3 = await copyS3Obj(
				s3clientGeneral,
				S3_MAIN_BUCKET_NAME,
				`user_${userId}/${encodeKey}.v${restoreDeleted.cur_ver}`,
				`user_${userId}/${key}.v${restoreDeleted.new_ver}`
			);
			console.log("newRecordInS3: ", newRecordInS3);
			if (!newRecordInS3) {
				return next(customError.internalServerError());
			}
		}
	}

	const commit = await commitMetadata("done", token);
	if (!commit) {
		return next(customError.internalServerError());
	}

	// update usage of an user
	const currentUsed = await updateSpaceUsedByUser(userId, nowTime);
	if (currentUsed === -1) {
		return next(customError.internalServerError());
	}
	req.session.user.used = currentUsed;

	// emit new list
	const io = req.app.get("socketio");
	emitTrashList(io, userId);
	emitUsage(io, userId, req.session.user);

	return res.json({ msg: "ok" });
};

export { restoreHistory, restoreDeleted };
