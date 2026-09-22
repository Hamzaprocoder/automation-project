import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import * as controller from "./analytics.controller";

const router = Router();

router.use(requireAuth);
router.use(requirePermission("analytics:view"));

router.get("/overview", controller.overview);
router.get("/revenue-series", controller.revenueSeries);
router.get("/customer-growth", controller.customerGrowth);

export default router;
