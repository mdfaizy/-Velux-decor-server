import { Request, Response } from "express";
import { Offer } from "../model/offer.model";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary";

// form is sent as multipart/form-data, so every value arrives as a string
const toBool = (v: any) => (v === undefined ? undefined : v === true || v === "true");
const toNumber = (v: any) => (v === undefined || v === "" ? undefined : Number(v));

const pickOfferFields = (body: any) => {
  const {
    text, title, link, linkLabel, isActive, order, startDate, endDate,
    showInBar, showOnHome, showOnProduct, category,
  } = body;
  return {
    text,
    title,
    link,
    linkLabel,
    isActive: toBool(isActive),
    order: toNumber(order),
    // empty string from the form means "no date" / "all categories"
    startDate: startDate || null,
    endDate: endDate || null,
    showInBar: toBool(showInBar),
    showOnHome: toBool(showOnHome),
    showOnProduct: toBool(showOnProduct),
    category: category || null,
  };
};

const uploadedImage = async (req: Request) => {
  const file = (req.files as any)?.image;
  return file ? await uploadImageToCloudinary(file) : "";
};

/* ================= PUBLIC: ACTIVE OFFERS ================= */
export const getActiveOffers = async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    })
      .sort({ order: 1, createdAt: -1 })
      .select("text title image link linkLabel endDate showInBar showOnHome showOnProduct category");

    res.status(200).json({ success: true, data: offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: GET ALL ================= */
export const getOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await Offer.find()
      .sort({ order: 1, createdAt: -1 })
      .populate("category", "name");
    res.status(200).json({ success: true, data: offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: CREATE ================= */
export const createOffer = async (req: Request, res: Response) => {
  try {
    if (!req.body.text?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Offer text is required" });
    }

    const image = await uploadedImage(req);
    const offer = await Offer.create({ ...pickOfferFields(req.body), image });
    res.status(201).json({ success: true, data: offer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: UPDATE ================= */
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const existing = await Offer.findById(req.params.id);

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    const updates: any = pickOfferFields(req.body);

    // new image replaces the old one; removeImage=true clears it
    const newImage = await uploadedImage(req);
    if (newImage || toBool(req.body.removeImage)) {
      if (existing.image) await deleteImageFromCloudinary(existing.image);
      updates.image = newImage;
    }

    const offer = await Offer.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: offer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: TOGGLE ACTIVE ================= */
export const toggleOfferStatus = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(200).json({ success: true, data: offer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: DELETE ================= */
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    if (offer.image) await deleteImageFromCloudinary(offer.image);

    res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
