import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./dashboard.controller";

const router = Router();

router.use(requireAuth);

router.get("/overview", controller.overview);
router.get("/customer-growth", controller.customerGrowth);

export default router;
