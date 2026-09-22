import type { Request, Response } from "express";
import { verifyWhatsAppSignature } from "../../lib/whatsapp";
import * as whatsappService from "./whatsapp.service";
import type { WhatsAppWebhookPayload } from "./whatsapp.types";

export async function verifyWebhook(req: Request, res: Response) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    typeof token === "string" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    typeof challenge === "string"
  ) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Forbidden");
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const signatureHeader = Array.isArray(signature) ? signature[0] : signature;
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (appSecret) {
      if (!req.rawBody) return res.status(400).send("Raw body unavailable");

      const valid = verifyWhatsAppSignature(req.rawBody, signatureHeader, appSecret);
      if (!valid) return res.status(401).send("Invalid signature");
    }

    await whatsappService.processIncomingWebhook(req.body as WhatsAppWebhookPayload);
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(200).send("OK");
  }
}
