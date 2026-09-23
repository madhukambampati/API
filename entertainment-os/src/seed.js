// Demo organisation (India): people, cost centers, policies and groups.
// Amounts are in INR. Venues, movies and events come from catalog.js.

export const CATEGORIES = {
  movies: { label: 'Movies', icon: 'film', blurb: 'Tickets, seats & showtimes' },
  events: { label: 'Events & live', icon: 'ticket', blurb: 'Music, sports, tech, comedy' },
  reservations: { label: 'Dining', icon: 'utensils', blurb: 'Tables for clients, teams, family' },
  pdr: { label: 'Private dining', icon: 'glass', blurb: 'PDRs & banquet halls' },
  catering: { label: 'Catering', icon: 'cloche', blurb: 'Office & offsite food' },
  gifting: { label: 'Gifting & merch', icon: 'gift', blurb: 'Diwali hampers, swag' },
  experiences: { label: 'Experiences', icon: 'compass', blurb: 'Offsites, walks, classes' },
};

export const FUNDING = {
  corporate: 'Company-paid (cost center)',
  reimbursable: 'Paid personally → expense report',
  personal: 'Personal (not reimbursed)',
  shared: 'Shared with family / friends (split)',
};

// Approval matrix used by the Policy agent. Thresholds are per booking total (INR).
export const POLICY = {
  currency: 'INR',
  autoApproveLimit: 20000,
  managerLimit: 200000,
  deptHeadLimit: 800000,
  // Above deptHeadLimit, Finance (CFO) signs off as well.
  perAttendeeCap: { movies: 1000, events: 25000, reservations: 4000, pdr: 5000, catering: 1500, gifting: 5000, experiences: 40000 },
  complianceCategories: ['events', 'gifting'], // client tickets & gifts need gift/entertainment review
  expenseRouting: {
    business: { team: 'Finance', label: 'Business / client entertainment' },
    morale: { team: 'HR', label: 'Team morale, celebrations & offsites' },
    wellbeing: { team: 'Benefits', label: 'Lifestyle & wellbeing allowance' },
  },
  reportSlaDays: 5,
};

const BLR = { country: 'India', state: 'Karnataka', city: 'Bengaluru' };
const BOM = { country: 'India', state: 'Maharashtra', city: 'Mumbai' };
const HYD = { country: 'India', state: 'Telangana', city: 'Hyderabad' };
const DEL = { country: 'India', state: 'Delhi', city: 'New Delhi' };

export function seed() {
  return {
    meta: { company: 'Northwind India Pvt. Ltd.', currency: 'INR', period: 'FY27 Q2 (Jul–Sep 2026)', seededAt: new Date().toISOString() },
    people: [
      { id: 'u-ananya', name: 'Ananya Iyer', title: 'Account Executive', dept: 'sales', managerId: 'u-rahul', employee: true, personalMonthly: 25000, stipendBalance: 60000, home: BLR },
      { id: 'u-rahul', name: 'Rahul Mehta', title: 'Sales Director', dept: 'sales', managerId: 'u-priya', employee: true, personalMonthly: 35000, stipendBalance: 60000, home: BOM },
      { id: 'u-priya', name: 'Priya Sharma', title: 'VP Sales (Dept Head)', dept: 'sales', managerId: 'u-vikram', employee: true, personalMonthly: 50000, stipendBalance: 75000, home: BOM },
      { id: 'u-arjun', name: 'Arjun Reddy', title: 'Product Manager', dept: 'product', managerId: 'u-kavya', employee: true, personalMonthly: 25000, stipendBalance: 60000, home: HYD },
      { id: 'u-kavya', name: 'Kavya Nair', title: 'Head of Product (Dept Head)', dept: 'product', managerId: 'u-vikram', employee: true, personalMonthly: 40000, stipendBalance: 75000, home: BLR },
      { id: 'u-vikram', name: 'Vikram Singh', title: 'CFO (Finance)', dept: 'finance', managerId: null, employee: true, personalMonthly: 50000, stipendBalance: 75000, home: DEL, roles: ['finance'] },
      { id: 'u-neha', name: 'Neha Gupta', title: 'HR Business Partner', dept: 'people', managerId: 'u-vikram', employee: true, personalMonthly: 25000, stipendBalance: 60000, home: BLR, roles: ['hr'] },
      { id: 'u-farhan', name: 'Farhan Qureshi', title: 'Benefits Lead', dept: 'people', managerId: 'u-vikram', employee: true, personalMonthly: 25000, stipendBalance: 60000, home: HYD, roles: ['benefits'] },
      { id: 'u-meera', name: 'Meera Joshi', title: 'Compliance Officer', dept: 'finance', managerId: 'u-vikram', employee: true, personalMonthly: 25000, stipendBalance: 60000, home: BOM, roles: ['compliance'] },
      // Family & friends — not employees, but they share costs through groups.
      { id: 'f-rohan', name: 'Rohan Iyer', title: 'Family (Ananya’s husband)', employee: false },
      { id: 'f-diya', name: 'Diya Iyer', title: 'Family (Ananya’s sister)', employee: false },
      { id: 'f-sneha', name: 'Sneha Kapoor', title: 'Friend', employee: false },
      { id: 'f-karthik', name: 'Karthik Rao', title: 'Friend', employee: false },
    ],
    departments: [
      { id: 'sales', name: 'Sales', costCenter: 'CC-4100', headId: 'u-priya', quarterlyBudget: 6000000 },
      { id: 'product', name: 'Product', costCenter: 'CC-5200', headId: 'u-kavya', quarterlyBudget: 2000000 },
      { id: 'people', name: 'People (HR & Benefits)', costCenter: 'CC-7100', headId: 'u-neha', quarterlyBudget: 3000000 },
      { id: 'finance', name: 'Finance', costCenter: 'CC-9000', headId: 'u-vikram', quarterlyBudget: 1000000 },
    ],
    groups: [
      { id: 'g-family', name: 'Iyer family', type: 'family', members: ['u-ananya', 'f-rohan', 'f-diya'] },
      { id: 'g-friends', name: 'Weekend gang', type: 'friends', members: ['u-ananya', 'u-arjun', 'f-sneha', 'f-karthik'] },
    ],
    bookings: [],
    seatBookings: {},
    groupExpenses: [],
    settlements: [],
    reports: [],
    activity: [],
    counters: { booking: 1000, report: 500, expense: 1, settlement: 1 },
  };
}
