import { Response } from "express";
import { Broadcast } from "../model/broadcast.model";
import { Customer } from "../model/customer.model";
import { MessageLog } from "../model/messageLog.model";
import {
  isWhatsAppConfigured,
  listApprovedTemplates,
  messageIdOf,
  sendWhatsAppTemplate,
  whatsAppError,
} from "../config/whatsapp";
import { normalizePhone } from "../utils/phone";

const BATCH_SIZE = 20; // messages sent in parallel (Meta allows ~80/sec)
const BATCH_PAUSE_MS = 300;
const MAX_STORED_FAILURES = 50;

const STALE_AFTER_MS = 10 * 60 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// a broadcast with no progress for 10 min was cut off by a server restart
const markStaleBroadcasts = () =>
  Broadcast.updateMany(
    { status: "sending", updatedAt: { $lt: new Date(Date.now() - STALE_AFTER_MS) } },
    { status: "failed", completedAt: new Date() }
  );

// WhatsApp rejects template values with new lines, and empty values
const cleanParams = (params: any): string[] =>
  (Array.isArray(params) ? params : [])
    .map((p) => String(p ?? "").replace(/\s*\n\s*/g, " ").trim());

// "{{name}}" in any value → customer's first name
const personalise = (params: string[], name?: string) => {
  const firstName = name?.trim().split(/\s+/)[0] || "there";
  return params.map((p) => p.replace(/\{\{\s*name\s*\}\}/gi, firstName));
};

const readMessage = (body: any) => ({
  templateName: String(body.templateName || "").trim(),
  language: String(body.language || "en").trim(),
  params: cleanParams(body.params),
  headerImage: String(body.headerImage || "").trim() || undefined,
});

/* ================= STATUS ================= */
export const getWhatsAppStatus = async (_req: any, res: Response) => {
  try {
    const optedIn = await Customer.countDocuments({ whatsappOptIn: true });
    res.status(200).json({
      success: true,
      data: { configured: isWhatsAppConfigured(), optedIn },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= APPROVED TEMPLATES ================= */
export const getTemplates = async (_req: any, res: Response) => {
  if (!isWhatsAppConfigured() || !process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
    // page falls back to typing the template name
    return res.status(200).json({ success: true, data: null });
  }
  try {
    res.status(200).json({ success: true, data: await listApprovedTemplates() });
  } catch (error: any) {
    res.status(502).json({ success: false, message: whatsAppError(error) });
  }
};

/* ================= SEND TEST (one number) ================= */
export const sendTestMessage = async (req: any, res: Response) => {
  try {
    if (!isWhatsAppConfigured()) {
      return res
        .status(400)
        .json({ success: false, message: "WhatsApp is not connected yet" });
    }

    const message = readMessage(req.body);
    const to = normalizePhone(req.body.phone);

    if (!message.templateName || !to) {
      return res
        .status(400)
        .json({ success: false, message: "Template name and a valid phone are required" });
    }
    if (message.params.some((p) => !p)) {
      return res
        .status(400)
        .json({ success: false, message: "Fill in every template variable" });
    }

    const data = await sendWhatsAppTemplate({ ...message, to, params: personalise(message.params, "Test") });
    const wamid = messageIdOf(data);
    if (wamid) await MessageLog.create({ wamid, phone: to });

    // page polls /message/:wamid to show delivered / failed
    res.status(200).json({ success: true, message: "Test message sent", data: { wamid } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: whatsAppError(error) });
  }
};

/* ================= BACKGROUND SENDER ================= */
const runBroadcast = async (
  broadcastId: string,
  message: ReturnType<typeof readMessage>
) => {
  try {
    const cursor = Customer.find({ whatsappOptIn: true })
      .select("name phone")
      .lean()
      .cursor();

    let batch: { name?: string | null; phone: string }[] = [];

    const flush = async () => {
      const results = await Promise.allSettled(
        batch.map((c) =>
          sendWhatsAppTemplate({
            ...message,
            to: c.phone,
            params: personalise(message.params, c.name || undefined),
          })
        )
      );

      const failures = results
        .map((r, i) =>
          r.status === "rejected"
            ? { phone: batch[i].phone, error: whatsAppError(r.reason) }
            : null
        )
        .filter(Boolean);

      // remember message ids so the status webhook can update delivered / read
      const logs = results
        .map((r, i) =>
          r.status === "fulfilled" && messageIdOf(r.value)
            ? { wamid: messageIdOf(r.value), broadcast: broadcastId, phone: batch[i].phone }
            : null
        )
        .filter(Boolean);
      if (logs.length) await MessageLog.insertMany(logs, { ordered: false });

      await Broadcast.updateOne(
        { _id: broadcastId },
        {
          $inc: { sent: results.length - failures.length, failed: failures.length },
          $push: { failures: { $each: failures, $slice: MAX_STORED_FAILURES } },
        }
      );

      batch = [];
      await sleep(BATCH_PAUSE_MS);
    };

    for await (const customer of cursor) {
      batch.push(customer as any);
      if (batch.length >= BATCH_SIZE) await flush();
    }
    if (batch.length) await flush();

    await Broadcast.updateOne(
      { _id: broadcastId },
      { status: "completed", completedAt: new Date() }
    );
  } catch (error: any) {
    console.error("Broadcast failed:", error);
    await Broadcast.updateOne(
      { _id: broadcastId },
      { status: "failed", completedAt: new Date() }
    );
  }
};

/* ================= SEND TO ALL OPTED-IN ================= */
export const createBroadcast = async (req: any, res: Response) => {
  try {
    if (!isWhatsAppConfigured()) {
      return res
        .status(400)
        .json({ success: false, message: "WhatsApp is not connected yet" });
    }

    const message = readMessage(req.body);

    if (!message.templateName) {
      return res
        .status(400)
        .json({ success: false, message: "Template name is required" });
    }
    if (message.params.some((p) => !p)) {
      return res
        .status(400)
        .json({ success: false, message: "Fill in every template variable" });
    }

    await markStaleBroadcasts();
    if (await Broadcast.exists({ status: "sending" })) {
      return res.status(409).json({
        success: false,
        message: "Another broadcast is still sending. Wait for it to finish.",
      });
    }

    const total = await Customer.countDocuments({ whatsappOptIn: true });
    if (!total) {
      return res
        .status(400)
        .json({ success: false, message: "No opted-in customers to send to" });
    }

    const broadcast = await Broadcast.create({
      ...message,
      total,
      createdBy: req.user?._id,
    });

    // respond immediately; sending continues in the background
    res.status(202).json({ success: true, data: broadcast });

    runBroadcast(String(broadcast._id), message);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ONE MESSAGE'S STATUS ================= */
export const getMessageStatus = async (req: any, res: Response) => {
  try {
    const log = await MessageLog.findOne({ wamid: req.params.wamid }).select("status error");
    if (!log) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= HISTORY ================= */
export const getBroadcasts = async (_req: any, res: Response) => {
  try {
    await markStaleBroadcasts();
    const broadcasts = await Broadcast.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("createdBy", "name");
    res.status(200).json({ success: true, data: broadcasts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
