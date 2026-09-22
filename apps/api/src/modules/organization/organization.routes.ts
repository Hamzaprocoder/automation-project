import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as controller from "./organization.controller";

const router = Router();
router.use(requireAuth);

router.get("/", controller.getOrganization);
router.patch("/", requireRole("OWNER", "ADMIN"), controller.updateOrganization);
router.get("/members", requireRole("OWNER", "ADMIN"), controller.listMembers);
router.post("/members/invite", requireRole("OWNER", "ADMIN"), controller.inviteMember);

export default router;
