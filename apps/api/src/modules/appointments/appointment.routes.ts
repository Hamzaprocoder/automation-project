import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import * as controller from "./appointment.controller";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission("appointment:manage"), controller.list);
router.post("/", requirePermission("appointment:manage"), controller.create);
router.patch("/:id", requirePermission("appointment:manage"), controller.update);
router.delete("/:id", requirePermission("appointment:manage"), controller.remove);

export default router;
