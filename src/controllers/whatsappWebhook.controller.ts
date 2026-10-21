import crypto from "crypto";
import { Request, Response } from "express";
import { Broadcast } from "../model/broadcast.model";
import { MessageLog } from "../model/messageLog.model";

/* Meta WhatsApp webhook
   Needs in .env:
     WHATSAPP_VERIFY_TOKEN – any secret string, also typed into Meta's webhook settings
     WHATSAPP_APP_SECRET   – optional, App settings → Basic → App secret; when set,
                             requests without a valid Meta signature are rejected */

const STATUS_RANK: Record<string, number> = {
  accepted: 0,
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
};

const lowerStatuses = (status: string) =>
  Object.keys(STATUS_RANK).filter((s) => STATUS_RANK[s] < STATUS_RANK[status]);

const errorText = (errors: any[] | undefined) => {
  const e = errors?.[0];
  if (!e) return "Unknown error";
  return `${e.code}: ${e.error_data?.details || e.message || e.title}`;
};

/* ================= GET: Meta's one-time verification ================= */
export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    process.env.WHATSAPP_VERIFY_TOKEN &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    console.log("WhatsApp webhook verified ✅");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

const hasValidSignature = (req: any) => {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;

  const signature = String(req.headers["x-hub-signature-256"] || "");
  if (!signature || !req.rawBody) return false;

  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  return (
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
};

/* ================= POST: message status updates ================= */
export const receiveWebhook = async (req: any, res: Response) => {
  if (!hasValidSignature(req)) return res.sendStatus(401);

  // Meta retries unless it gets 200 quickly
  res.sendStatus(200);

  try {
    for (const entry of req.body?.entry || []) {
      for (const change of entry.changes || []) {
        for (const st of change.value?.statuses || []) {
          await applyStatus(st);
        }
      }
    }
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
  }
};

const applyStatus = async (st: any) => {
  const status = String(st.status || "");
  if (!(status in STATUS_RANK)) return;

  const error = status === "failed" ? errorText(st.errors) : undefined;
  console.log(
    `WhatsApp status: ${status} (…${String(st.recipient_id || "").slice(-2)})` +
      (error ? ` — ${error}` : "")
  );

  // only move forward (events can arrive out of order); returns the previous version
  const previous = await MessageLog.findOneAndUpdate(
    { wamid: String(st.id), status: { $in: lowerStatuses(status) as any[] } },
    { status: status as any, ...(error && { error }) },
    { returnDocument: "before" }
  ).lean();
  if (!previous?.broadcast) return;

  const wasDelivered = STATUS_RANK[previous.status] >= STATUS_RANK.delivered;
  const inc: Record<string, number> = {};
  const update: any = { $inc: inc };

  if (status === "delivered" || status === "read") {
    if (!wasDelivered) inc.delivered = 1;
    if (status === "read") inc.read = 1;
  }
  if (status === "failed") {
    // was counted as "sent" (accepted) when Meta took it
    inc.sent = -1;
    inc.failed = 1;
    update.$push = {
      failures: { $each: [{ phone: previous.phone, error }], $slice: 50 },
    };
  }

  if (Object.keys(inc).length) {
    await Broadcast.updateOne({ _id: previous.broadcast }, update);
  }
};
