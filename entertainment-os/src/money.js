// Money in the company currency: C$ for the Canada edition, ₹ (Indian digit grouping) for India.
import { R, REGION } from './region.js';

export const CURRENCY = R.currency;

// Formats an amount in the company currency. (Named `inr` for history; it follows the region.)
export function inr(n) {
  const v = Math.round(Number(n || 0) * 100) / 100;
  if (REGION === 'IN') return `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  return `C$${v.toLocaleString('en-CA', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
}
export const fmt = inr;

export const round2 = (n) => Math.round(n * 100) / 100;

// "₹5,000", "rs 5000", "$250", "C$80", "5k", "2.5 lakh" → a number in the company currency.
export function parseAmount(text) {
  const t = text.toLowerCase().replace(/,/g, '');
  const m =
    t.match(/(?:₹|rs\.?|inr|c\$|cad|\$)\s*(\d+(?:\.\d+)?)\s*(k|l|lakh|lakhs|lac|cr|crore)?\b/) ||
    t.match(/(?:budget|under|upto|up to|max|within)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(k|l|lakh|lakhs|lac|cr|crore)?\b/) ||
    t.match(/\b(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|crore|cr)\b/);
  if (!m) return null;
  const unit = { k: 1e3, l: 1e5, lakh: 1e5, lakhs: 1e5, lac: 1e5, cr: 1e7, crore: 1e7 }[m[2]] || 1;
  return Number(m[1]) * unit;
}

// Convert between currencies using rates quoted as "1 INR = x CUR" (Frankfurter, base INR).
export function convert(amount, from, to, rates) {
  if (!amount || from === to) return amount;
  const r = (c) => (c === 'INR' ? 1 : rates?.[c]);
  const a = r(from);
  const b = r(to);
  return a && b ? (amount / a) * b : null;
}
