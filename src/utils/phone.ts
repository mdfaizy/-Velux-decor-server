/**
 * Normalise a phone number to WhatsApp format: country code + number, digits only.
 * "+91 98765 43210" / "098765 43210" / "9876543210" → "919876543210"
 * Returns null when the number can't be valid.
 */
export const normalizePhone = (raw: any, defaultCountryCode = "91"): string | null => {
  if (raw === undefined || raw === null) return null;

  let digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2); // 0091...
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1); // 098765...
  if (digits.length === 10) digits = defaultCountryCode + digits;

  return digits.length >= 11 && digits.length <= 15 ? digits : null;
};
