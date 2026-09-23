// Country → state → city. India first and complete (all states and union territories).
// The UI adds an "Other" choice at every level so any place can be typed in.
export const LOCATIONS = {
  India: {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur'],
    'Arunachal Pradesh': ['Itanagar', 'Tawang'],
    Assam: ['Guwahati', 'Dibrugarh', 'Silchar'],
    Bihar: ['Patna', 'Gaya', 'Bhagalpur'],
    Chhattisgarh: ['Raipur', 'Bilaspur', 'Bhilai'],
    Goa: ['Panaji', 'Margao', 'Vasco da Gama'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
    'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala'],
    Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad'],
    Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
    Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur'],
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
    Manipur: ['Imphal'],
    Meghalaya: ['Shillong'],
    Mizoram: ['Aizawl'],
    Nagaland: ['Kohima', 'Dimapur'],
    Odisha: ['Bhubaneswar', 'Cuttack', 'Puri'],
    Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali'],
    Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota'],
    Sikkim: ['Gangtok'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
    Telangana: ['Hyderabad', 'Warangal', 'Karimnagar'],
    Tripura: ['Agartala'],
    'Uttar Pradesh': ['Lucknow', 'Noida', 'Kanpur', 'Varanasi', 'Agra', 'Ghaziabad'],
    Uttarakhand: ['Dehradun', 'Rishikesh', 'Nainital'],
    'West Bengal': ['Kolkata', 'Siliguri', 'Durgapur', 'Darjeeling'],
    'Andaman and Nicobar Islands': ['Port Blair'],
    Chandigarh: ['Chandigarh'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Silvassa'],
    Delhi: ['New Delhi', 'Delhi'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu'],
    Ladakh: ['Leh'],
    Lakshadweep: ['Kavaratti'],
    Puducherry: ['Puducherry'],
  },
  Canada: {
    Alberta: ['Calgary', 'Edmonton', 'Banff', 'Red Deer'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Kelowna', 'Whistler'],
    Manitoba: ['Winnipeg', 'Brandon'],
    'New Brunswick': ['Moncton', 'Saint John', 'Fredericton'],
    'Newfoundland and Labrador': ["St. John's"],
    'Nova Scotia': ['Halifax', 'Sydney'],
    Ontario: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Waterloo', 'Niagara Falls'],
    'Prince Edward Island': ['Charlottetown'],
    Quebec: ['Montreal', 'Quebec City', 'Gatineau', 'Laval'],
    Saskatchewan: ['Saskatoon', 'Regina'],
    'Northwest Territories': ['Yellowknife'],
    Nunavut: ['Iqaluit'],
    Yukon: ['Whitehorse'],
  },
  'United Arab Emirates': { Dubai: ['Dubai'], 'Abu Dhabi': ['Abu Dhabi'] },
  Singapore: { Singapore: ['Singapore'] },
  'United Kingdom': { England: ['London', 'Manchester'], Scotland: ['Edinburgh'] },
  'United States': { California: ['San Francisco', 'Los Angeles'], 'New York': ['New York City'], Texas: ['Austin'] },
};

export const DEFAULT_LOCATION = { country: 'India', state: 'Karnataka', city: 'Bengaluru' };

// ISO code and local currency per country (used for live APIs and ₹ conversions).
export const COUNTRY_META = {
  India: { code: 'IN', currency: 'INR', symbol: '\u20b9' },
  Canada: { code: 'CA', currency: 'CAD', symbol: 'C$' },
  'United States': { code: 'US', currency: 'USD', symbol: 'US$' },
  'United Kingdom': { code: 'GB', currency: 'GBP', symbol: '\u00a3' },
  'United Arab Emirates': { code: 'AE', currency: 'AED', symbol: 'AED ' },
  Singapore: { code: 'SG', currency: 'SGD', symbol: 'S$' },
};

const METROS = new Set(['Mumbai', 'New Delhi', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Gurugram', 'Noida']);
const TIER2 = new Set(['Ahmedabad', 'Jaipur', 'Kochi', 'Lucknow', 'Chandigarh', 'Indore', 'Goa', 'Panaji', 'Coimbatore', 'Visakhapatnam', 'Bhubaneswar', 'Thane', 'Nagpur', 'Surat', 'Vadodara', 'Mysuru', 'Thiruvananthapuram', 'Guwahati', 'Bhopal', 'Udaipur']);

// Price multiplier vs a metro. Foreign cities are converted to ₹ at a premium.
export function priceTier(loc) {
  if (!loc || loc.country !== 'India') return 1.6;
  if (METROS.has(loc.city)) return 1;
  if (TIER2.has(loc.city)) return 0.8;
  return 0.7;
}

// Main language(s) by state — used to rank films in "Now showing".
export const STATE_LANGUAGES = {
  Karnataka: ['Kannada'], 'Tamil Nadu': ['Tamil'], Puducherry: ['Tamil'], Kerala: ['Malayalam'], Lakshadweep: ['Malayalam'],
  Telangana: ['Telugu'], 'Andhra Pradesh': ['Telugu'], 'West Bengal': ['Bengali'], Tripura: ['Bengali'],
  Maharashtra: ['Marathi', 'Hindi'], Gujarat: ['Gujarati', 'Hindi'], Punjab: ['Punjabi', 'Hindi'],
  Quebec: ['French'],
};

// A weekend-escape suggestion per state for team offsites.
export const NEARBY_ESCAPES = {
  Karnataka: 'Coorg coffee-estate retreat', Maharashtra: 'Lonavala hill retreat', Goa: 'Goa beach-house offsite', Kerala: 'Alleppey houseboat day',
  Rajasthan: 'Udaipur lakeside offsite', 'Tamil Nadu': 'Mahabalipuram beach retreat', Telangana: 'Ananthagiri Hills retreat', Delhi: 'Neemrana fort retreat',
  Haryana: 'Aravalli farm-stay offsite', 'Uttar Pradesh': 'Rishikesh riverside retreat', 'West Bengal': 'Darjeeling tea-estate retreat', 'Himachal Pradesh': 'Manali mountain camp',
  Uttarakhand: 'Rishikesh rafting & camp', Gujarat: 'Rann of Kutch tent city', Punjab: 'Anandpur Sahib farm retreat',
  Alberta: 'Banff mountain lodge retreat', 'British Columbia': 'Whistler mountain retreat', Ontario: 'Muskoka cottage offsite',
  Quebec: 'Mont-Tremblant resort offsite', 'Nova Scotia': 'Cabot Trail coastal retreat', Manitoba: 'Lake Winnipeg lodge retreat',
};

export function normaliseLocation(input = {}) {
  const country = String(input.country || DEFAULT_LOCATION.country).trim().slice(0, 60) || DEFAULT_LOCATION.country;
  const state = String(input.state || '').trim().slice(0, 60);
  const city = String(input.city || '').trim().slice(0, 60);
  if (!city) return { ...DEFAULT_LOCATION };
  return { country, state, city };
}

export function locationLabel(loc) {
  return [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
}

// Find a known city mentioned in free text ("dinner in Pune tomorrow").
// Names like London exist in two countries, so a match in `preferCountry` wins.
export function findCityInText(text, preferCountry) {
  const t = text.toLowerCase();
  const matches = [];
  for (const [country, states] of Object.entries(LOCATIONS)) {
    for (const [state, cities] of Object.entries(states)) {
      for (const city of cities) {
        const re = new RegExp(`\\b${city.toLowerCase().replace(/[.']/g, '.?').replace(/\s+/g, '\\s+')}\\b`);
        if (re.test(t)) matches.push({ country, state, city });
      }
    }
  }
  if (matches.length) return matches.find((m) => m.country === preferCountry) || matches[0];
  if (/\bbangalore\b/.test(t)) return { country: 'India', state: 'Karnataka', city: 'Bengaluru' };
  if (/\bbombay\b/.test(t)) return { country: 'India', state: 'Maharashtra', city: 'Mumbai' };
  if (/\bgurgaon\b/.test(t)) return { country: 'India', state: 'Haryana', city: 'Gurugram' };
  if (/\bgta\b/.test(t)) return { country: 'Canada', state: 'Ontario', city: 'Toronto' };
  return null;
}
