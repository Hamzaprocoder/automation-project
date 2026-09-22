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

  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(received, "hex"),
    Buffer.from(expected, "hex"),
  );
}
