// Demo organisation: people, cost centers, policies, groups and a vendor catalog.
// Everything the agents reason over lives here so the flow is reproducible.

export const CATEGORIES = {
  reservations: { label: 'Reservations', icon: 'utensils', example: 'Client dinner for 4 · tonight' },
  pdr: { label: 'Private dining & events', icon: 'glass', example: 'Private room for 30 · Aug 5' },
  catering: { label: 'Catering', icon: 'cloche', example: 'Offsite lunch · 120 people' },
  sports: { label: 'Sports & live events', icon: 'ticket', example: 'Suite at the Warriors game' },
  gifting: { label: 'Gifting & merch', icon: 'gift', example: 'Holiday gifts · 40 clients' },
  experiences: { label: 'Experiences', icon: 'star', example: 'Team offsite · Napa' },
};

export const FUNDING = {
  corporate: 'Company-paid (cost center)',
  reimbursable: 'Paid personally → expense report',
  personal: 'Personal (not reimbursed)',
  shared: 'Shared with family / friends (split)',
};

// Approval matrix used by the Policy agent. Thresholds are per booking total (USD).
export const POLICY = {
  autoApproveLimit: 250,
  managerLimit: 2500,
  deptHeadLimit: 10000,
  // Above deptHeadLimit, Finance (CFO) signs off as well.
  perAttendeeCap: { reservations: 150, pdr: 175, catering: 60, sports: 600, gifting: 100, experiences: 900 },
  complianceCategories: ['sports', 'gifting'], // client gifts & tickets need gift/entertainment review
  expenseRouting: {
    // Where a personally-paid expense report is sent.
    business: { team: 'Finance', label: 'Business / client entertainment' },
    morale: { team: 'HR', label: 'Team morale, celebrations & offsites' },
    wellbeing: { team: 'Benefits', label: 'Lifestyle & wellbeing stipend' },
  },
  reportSlaDays: 5,
};

export function seed() {
  return {
    meta: { company: 'Northwind Partners', currency: 'USD', period: '2026-Q3', seededAt: new Date().toISOString() },
    people: [
      { id: 'u-maya', name: 'Maya Chen', title: 'Account Executive', dept: 'sales', managerId: 'u-raj', employee: true, personalMonthly: 600, stipendBalance: 1200 },
      { id: 'u-raj', name: 'Raj Patel', title: 'Sales Director', dept: 'sales', managerId: 'u-elena', employee: true, personalMonthly: 800, stipendBalance: 1500 },
      { id: 'u-elena', name: 'Elena Brooks', title: 'VP Sales (Dept Head)', dept: 'sales', managerId: 'u-sam', employee: true, personalMonthly: 1000, stipendBalance: 1500 },
      { id: 'u-leo', name: 'Leo Martins', title: 'Product Manager', dept: 'product', managerId: 'u-ana', employee: true, personalMonthly: 500, stipendBalance: 1200 },
      { id: 'u-ana', name: 'Ana Ruiz', title: 'Head of Product (Dept Head)', dept: 'product', managerId: 'u-sam', employee: true, personalMonthly: 900, stipendBalance: 1500 },
      { id: 'u-sam', name: 'Sam Okafor', title: 'CFO (Finance)', dept: 'finance', managerId: null, employee: true, personalMonthly: 1000, stipendBalance: 1500, roles: ['finance'] },
      { id: 'u-kim', name: 'Kim Nguyen', title: 'HR Business Partner', dept: 'people', managerId: 'u-sam', employee: true, personalMonthly: 500, stipendBalance: 1200, roles: ['hr'] },
      { id: 'u-omar', name: 'Omar Haddad', title: 'Benefits Lead', dept: 'people', managerId: 'u-sam', employee: true, personalMonthly: 500, stipendBalance: 1200, roles: ['benefits'] },
      { id: 'u-ivy', name: 'Ivy Walsh', title: 'Compliance Officer', dept: 'finance', managerId: 'u-sam', employee: true, personalMonthly: 500, stipendBalance: 1200, roles: ['compliance'] },
      // Family & friends — not employees, but they share costs through groups.
      { id: 'f-daniel', name: 'Daniel Chen', title: 'Family (Maya\'s partner)', employee: false },
      { id: 'f-lucy', name: 'Lucy Chen', title: 'Family (Maya\'s sister)', employee: false },
      { id: 'f-priya', name: 'Priya Shah', title: 'Friend', employee: false },
      { id: 'f-tom', name: 'Tom Becker', title: 'Friend', employee: false },
    ],
    departments: [
      { id: 'sales', name: 'Sales', costCenter: 'CC-4100', headId: 'u-elena', quarterlyBudget: 60000 },
      { id: 'product', name: 'Product', costCenter: 'CC-5200', headId: 'u-ana', quarterlyBudget: 25000 },
      { id: 'people', name: 'People (HR & Benefits)', costCenter: 'CC-7100', headId: 'u-kim', quarterlyBudget: 40000 },
      { id: 'finance', name: 'Finance', costCenter: 'CC-9000', headId: 'u-sam', quarterlyBudget: 15000 },
    ],
    groups: [
      { id: 'g-family', name: 'Chen family', type: 'family', members: ['u-maya', 'f-daniel', 'f-lucy'] },
      { id: 'g-friends', name: 'Weekend crew', type: 'friends', members: ['u-maya', 'u-leo', 'f-priya', 'f-tom'] },
    ],
    catalog: [
      { id: 'v-1', category: 'reservations', vendor: 'Quince', city: 'San Francisco', perPerson: 140 },
      { id: 'v-2', category: 'reservations', vendor: 'State Bird Provisions', city: 'San Francisco', perPerson: 85 },
      { id: 'v-3', category: 'pdr', vendor: 'The Morris — Private Room', city: 'San Francisco', perPerson: 150 },
      { id: 'v-4', category: 'catering', vendor: 'Bi-Rite Catering', city: 'San Francisco', perPerson: 38 },
      { id: 'v-5', category: 'sports', vendor: 'Chase Center — Warriors Suite', city: 'San Francisco', perPerson: 550 },
      { id: 'v-6', category: 'sports', vendor: 'Oracle Park — Giants Club Seats', city: 'San Francisco', perPerson: 180 },
      { id: 'v-7', category: 'gifting', vendor: 'Goldbelly Gift Boxes', city: 'Online', perPerson: 85 },
      { id: 'v-8', category: 'gifting', vendor: 'Branded Merch Co.', city: 'Online', perPerson: 45 },
      { id: 'v-9', category: 'experiences', vendor: 'Napa Valley Wine Retreat', city: 'Napa', perPerson: 450 },
      { id: 'v-10', category: 'experiences', vendor: 'Alcatraz Night Tour', city: 'San Francisco', perPerson: 65 },
    ],
    bookings: [],
    groupExpenses: [],
    settlements: [],
    reports: [],
    activity: [],
    counters: { booking: 1000, report: 500, expense: 1, settlement: 1 },
  };
}
