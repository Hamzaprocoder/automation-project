import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as controller from "./audit.controller";

const router = Router();

router.use(requireAuth);
router.get("/", requireRole("OWNER", "ADMIN"), controller.list);

export default router;
