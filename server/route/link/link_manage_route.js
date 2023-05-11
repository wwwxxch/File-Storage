import express from "express";
const router = express.Router();

import { wrapAsync } from "../../util/util.js";

import {
	createLinkValid,
	revokeLinkValid,
	ValidCB,
} from "../../middleware/input_validator.js";
import {
	createLinkCheck,
	privateLink,
	publicLink,
	revokeLink,
	userSearch,
} from "../../controller/link/link_manage_controller.js";
import {authentication} from "../../middleware/auth_check.js";

// --------------------------------------------------------------------------------
router.post(
	"/create-link",
	authentication,
	createLinkValid,
	ValidCB,
	createLinkCheck,
	publicLink,
	privateLink
);

router.post(
	"/revoke-link",
	authentication,
	revokeLinkValid,
	ValidCB,
	revokeLink
);

router.get("/select-user", authentication, userSearch);

export { router as link_manage_route };
