import { Request, Response } from "express";
import { Customer } from "../model/customer.model";
import { normalizePhone } from "../utils/phone";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ================= USED BY CONTACT FORM ================= */
// Saves/updates the person as a customer. Never removes an existing opt-in.
export const upsertCustomerFromContact = async ({
  name, phone, email, whatsappOptIn,
}: { name?: string; phone?: string; email?: string; whatsappOptIn?: boolean }) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return;

  await Customer.updateOne(
    { phone: normalized },
    {
      $setOnInsert: { source: "contact" },
      $set: {
        ...(name && { name }),
        ...(email && { email }),
        ...(whatsappOptIn && { whatsappOptIn: true, optInAt: new Date() }),
      },
    },
    { upsert: true }
  );
};

/* ================= GET (paginated + search) ================= */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const search = String(req.query.search || "").trim();
    const optIn = String(req.query.optIn || "");

    const filter: any = {};
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
    }
    if (optIn === "yes") filter.whatsappOptIn = true;
    if (optIn === "no") filter.whatsappOptIn = false;

    const [customers, total, allCount, optedInCount] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Customer.countDocuments(filter),
      Customer.estimatedDocumentCount(),
      Customer.countDocuments({ whatsappOptIn: true }),
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      counts: { total: allCount, optedIn: optedInCount },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CREATE (manual) ================= */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, whatsappOptIn } = req.body;
    const normalized = normalizePhone(phone);

    if (!normalized) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid phone number" });
    }

    if (await Customer.exists({ phone: normalized })) {
      return res
        .status(409)
        .json({ success: false, message: "This number is already saved" });
    }

    const customer = await Customer.create({
      name,
      email,
      phone: normalized,
      source: "manual",
      whatsappOptIn: Boolean(whatsappOptIn),
      optInAt: whatsappOptIn ? new Date() : undefined,
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= BULK IMPORT ================= */
// body: { customers: [{ name, phone, email }], whatsappOptIn: boolean }
export const importCustomers = async (req: Request, res: Response) => {
  try {
    const rows = Array.isArray(req.body.customers) ? req.body.customers : [];
    const optIn = Boolean(req.body.whatsappOptIn);

    if (!rows.length || rows.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Send between 1 and 2000 customers per request",
      });
    }

    const seen = new Set<string>();
    let invalid = 0;
    const ops: any[] = [];

    for (const row of rows) {
      const phone = normalizePhone(row?.phone);
      if (!phone) { invalid++; continue; }
      if (seen.has(phone)) continue;
      seen.add(phone);

      ops.push({
        updateOne: {
          filter: { phone },
          update: {
            $setOnInsert: {
              source: "import",
              ...(row.name && { name: String(row.name).trim() }),
              ...(row.email && { email: String(row.email).trim().toLowerCase() }),
            },
            ...(optIn && { $set: { whatsappOptIn: true, optInAt: new Date() } }),
          },
          upsert: true,
        },
      });
    }

    const result = ops.length ? await Customer.bulkWrite(ops, { ordered: false }) : null;

    res.status(200).json({
      success: true,
      data: {
        added: result?.upsertedCount || 0,
        alreadySaved: ops.length - (result?.upsertedCount || 0),
        invalid,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE ================= */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, whatsappOptIn } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (whatsappOptIn !== undefined) {
      updates.whatsappOptIn = Boolean(whatsappOptIn);
      updates.optInAt = whatsappOptIn ? new Date() : null;
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, message: "Customer deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
