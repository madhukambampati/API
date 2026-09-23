// Which market the app runs for. Canada is the default; EOS_REGION=IN switches to the India edition.
// The region decides the company currency, default location, visible countries, policy and prices.
export const REGION = (process.env.EOS_REGION || 'CA').toUpperCase() === 'IN' ? 'IN' : 'CA';

export const REGIONS = {
  CA: { currency: 'CAD', symbol: 'C$', locale: 'en-CA', countries: ['Canada'], defaultLocation: { country: 'Canada', state: 'Ontario', city: 'Toronto' } },
  IN: { currency: 'INR', symbol: '₹', locale: 'en-IN', countries: ['India', 'Canada', 'United Arab Emirates', 'Singapore', 'United Kingdom', 'United States'], defaultLocation: { country: 'India', state: 'Karnataka', city: 'Bengaluru' } },
};

export const R = REGIONS[REGION];
