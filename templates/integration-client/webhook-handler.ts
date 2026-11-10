import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(rawBody: Buffer, signatureHeader: string, timestampSec: number, secret: string, maxSkewSec = 300): boolean {
  const nowSec = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestampSec) || Math.abs(nowSec - timestampSec) > maxSkewSec) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(`${timestampSec}.`).update(rawBody).digest("hex");
  const providedBuf = Buffer.from(signatureHeader.replace(/^sha256=/, ""), "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  return providedBuf.length === expectedBuf.length && timingSafeEqual(providedBuf, expectedBuf);
}

