import { Router } from "express";
import { requireAutomationToken } from "../../middleware/automation";
import * as controller from "./automation.controller";

const router = Router();

router.use(requireAutomationToken);

router.get("/upcoming-appointments", controller.upcomingAppointments);
router.get("/overdue-followups", controller.overdueFollowUps);
router.post("/log", controller.logExecution);
router.post("/log-error", controller.logError);

export default router;
