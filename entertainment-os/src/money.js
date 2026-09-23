// Company currency is INR; amounts are shown with Indian digit grouping (₹1,23,456).
export const CURRENCY = 'INR';

export function inr(n) {
  const v = Math.round(Number(n || 0) * 100) / 100;
  return `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export const round2 = (n) => Math.round(n * 100) / 100;

// "₹5,000", "rs 5000", "5k", "2.5 lakh", "1 crore" → number of rupees.
export function parseAmount(text) {
  const t = text.toLowerCase().replace(/,/g, '');
  const m =
    t.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*(k|l|lakh|lakhs|lac|cr|crore)?\b/) ||
    t.match(/(?:budget|under|upto|up to|max|within)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(k|l|lakh|lakhs|lac|cr|crore)?\b/) ||
    t.match(/\b(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|crore|cr)\b/);
  if (!m) return null;
  const unit = { k: 1e3, l: 1e5, lakh: 1e5, lakhs: 1e5, lac: 1e5, cr: 1e7, crore: 1e7 }[m[2]] || 1;
  return Number(m[1]) * unit;
}
