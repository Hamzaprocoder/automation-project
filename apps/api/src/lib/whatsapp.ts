import crypto from "node:crypto";

export function verifyWhatsAppSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader || !appSecret) return false;
  if (!signatureHeader.startsWith("sha256=")) return false;

  const received = signatureHeader.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(received, "hex"),
    Buffer.from(expected, "hex"),
  );
}

/**
 * Send a text message through the official Meta WhatsApp Cloud API.
 */
export async function sendWhatsAppTextMessage(params: {
  to: string;
  message: string;
  phoneNumberId: string;
  accessToken: string;
}) {
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION ?? "v19.0";
  const url = `https://graph.facebook.com/${apiVersion}/${params.phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: params.to,
      type: "text",
      text: {
        preview_url: false,
        body: params.message,
      },
    }),
  });

  const data = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    console.error("WhatsApp send error:", data);
    throw new Error(data.error?.message ?? "Failed to send WhatsApp message");
  }

  return data;
}
