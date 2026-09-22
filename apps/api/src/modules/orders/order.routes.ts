import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import * as controller from "./order.controller";

const router = Router();
router.use(requireAuth);
router.get("/", requirePermission("order:manage"), controller.list);
router.get("/:id", requirePermission("order:manage"), controller.getById);
router.post("/", requirePermission("order:manage"), controller.create);
router.patch("/:id", requirePermission("order:manage"), controller.update);
router.delete("/:id", requirePermission("order:manage"), controller.remove);
export default router;
