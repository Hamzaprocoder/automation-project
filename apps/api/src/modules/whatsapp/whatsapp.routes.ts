import { Router } from "express";
import * as controller from "./whatsapp.controller";

const router = Router();

router.get("/", controller.verifyWebhook);
router.post("/", controller.handleWebhook);

export default router;
