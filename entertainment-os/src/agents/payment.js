// Payment agent — a simulated payment gateway for the demo.
// It validates the payment details and returns a receipt, but never moves money
// and never receives card numbers (cards are "saved demo cards" identified by label only).
import { COUNTRY_META } from '../locations.js';
import { CURRENCY } from '../money.js';

const METHODS = {
  upi: { label: 'UPI', countries: ['India'] },
  card: { label: 'Credit / debit card', countries: null },
  netbanking: { label: 'Netbanking', countries: ['India'] },
  wallet: { label: 'Apple Pay / Google Pay', countries: null },
  interac: { label: 'Interac Online', countries: ['Canada'] },
};

export function methodsFor(country) {
  const order = country === 'Canada' ? ['card', 'interac', 'wallet'] : Object.keys(METHODS);
  return order
    .map((id) => [id, METHODS[id]])
    .filter(([, m]) => !m.countries || m.countries.includes(country))
    .map(([id, m]) => ({ id, label: m.label }));
}

export function authorize({ amount, method, upiId, country }) {
  const m = METHODS[method];
  if (!m || (m.countries && !m.countries.includes(country))) throw new Error('Choose a payment method available in this country');
  if (!(amount > 0)) throw new Error('Nothing to pay');
  if (method === 'upi' && !/^[\w.-]{2,64}@[a-zA-Z]{2,32}$/.test(String(upiId || '').trim())) throw new Error('Enter a UPI ID like name@okbank');
  if (method === 'interac' && !/^\S+@\S+\.\S+$|^\+?1?\d{10}$/.test(String(upiId || '').trim())) throw new Error('Enter the email or mobile number registered with Interac');
  const ref = `PAY-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const local = COUNTRY_META[country];
  return {
    ref,
    method,
    label: method === 'upi' ? `UPI (${String(upiId).trim()})` : method === 'interac' ? `Interac (${String(upiId).trim()})` : method === 'card' ? `${m.label} •••• 4242` : m.label,
    amount,
    currency: CURRENCY,
    localCurrency: local?.currency || null,
    status: 'captured',
    demo: true,
    at: new Date().toISOString(),
  };
}

// Company-paid bookings are charged to the cost center's corporate card instead.
export function companyCard(amount) {
  return { ref: `CORP-${Date.now().toString(36).toUpperCase()}`, method: 'company-card', label: 'Company card (cost center)', amount, currency: CURRENCY, status: 'charged on approval', demo: true, at: new Date().toISOString() };
}
