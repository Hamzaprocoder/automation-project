import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import * as controller from "./customer.controller";

const router = Router();
router.use(requireAuth);

router.get("/", requirePermission("customer:read"), controller.list);
router.get("/:id", requirePermission("customer:read"), controller.getById);
router.post("/", requirePermission("customer:create"), controller.create);
router.patch("/:id", requirePermission("customer:update"), controller.update);
router.delete("/:id", requirePermission("customer:delete"), controller.remove);

export default router;
