// Concierge agent: turns a free-text ask into a priced booking draft.
import { load, person } from '../store.js';
import { CATEGORIES } from '../seed.js';
import { parseWithClaude } from '../llm.js';

const KEYWORDS = [
  ['pdr', /private (dining|room)|\bpdr\b|buyout|banquet|event space/i],
  ['catering', /cater|(?:lunch|breakfast)\b[^\d]*\d{2,}\s*(?:people|guests|pax)|boxed|buffet/i],
  ['sports', /game|match|suite|tickets?|concert|warriors|giants|49ers|niners|live event|show/i],
  ['gifting', /gift|merch|swag|hamper|holiday box/i],
  ['experiences', /offsite|retreat|tour|experience|wine|spa|napa|trip|class/i],
  ['reservations', /dinner|lunch|brunch|table|reservation|restaurant|drinks/i],
];

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function iso(d) {
  return d.toISOString().slice(0, 10);
}

export function parseDate(text, now = new Date()) {
  const t = text.toLowerCase();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (/tonight|today/.test(t)) return iso(base);
  if (/tomorrow/.test(t)) return iso(new Date(base.getTime() + 86400000));
  const isoMatch = t.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const md = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/);
  if (md) {
    const month = MONTHS.indexOf(md[1]);
    let d = new Date(Date.UTC(base.getUTCFullYear(), month, Number(md[2])));
    if (d < base) d = new Date(Date.UTC(base.getUTCFullYear() + 1, month, Number(md[2])));
    return iso(d);
  }
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIdx = days.findIndex((d) => t.includes(d));
  if (dayIdx >= 0) {
    const diff = (dayIdx - base.getUTCDay() + 7) % 7 || 7;
    return iso(new Date(base.getTime() + diff * 86400000));
  }
  return iso(new Date(base.getTime() + 7 * 86400000)); // default: a week out
}

export function parseRuleBased(text, now = new Date()) {
  const t = text.toLowerCase();
  const category = (KEYWORDS.find(([, re]) => re.test(text)) || ['reservations'])[0];
  const sizeMatch = t.match(/\b(?:for|x)\s*(\d+)/) || t.match(/(\d+)\s*(?:people|guests|clients|pax|attendees|recipients|of us|friends|folks)/);
  let partySize = sizeMatch ? Number(sizeMatch[1]) : category === 'catering' ? 25 : 2;
  const budgetMatch = t.match(/\$\s?([\d,]+(?:\.\d+)?)\s*(k)?/);
  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) * (budgetMatch[2] ? 1000 : 1) : null;

  let groupType = null;
  if (/\bfamily\b|\bmy (?:wife|husband|partner|kids|parents|sister|brother|mom|dad)\b|\bkids\b/.test(t)) groupType = 'family';
  else if (/friends|buddies|crew|pals/.test(t)) groupType = 'friends';

  const clientFacing = /client|customer|prospect/.test(t);
  let funding = 'corporate';
  let purpose = clientFacing ? 'business' : 'morale';
  if (/reimburs|expense it|pay (it )?myself and|claim/.test(t)) {
    funding = 'reimbursable';
    purpose = clientFacing ? 'business' : /wellness|wellbeing|stipend|spa/.test(t) ? 'wellbeing' : 'morale';
  } else if (groupType && /split|share|splitwise|chip in|divide/.test(t)) {
    funding = 'shared';
    purpose = 'personal';
  } else if (groupType) {
    funding = 'shared';
    purpose = 'personal';
  } else if (/personal|my own|myself|on me/.test(t)) {
    funding = 'personal';
    purpose = 'personal';
  }
  if (/wellness|wellbeing|stipend/.test(t) && funding === 'corporate') {
    funding = 'reimbursable';
    purpose = 'wellbeing';
  }
  if (groupType && !sizeMatch) partySize = 0; // fill from group membership

  const title = text.trim().replace(/\s+/g, ' ').slice(0, 70);
  return { category, title, partySize, date: parseDate(text, now), funding, purpose, budget, groupType, clientFacing };
}

function pickVendor(category, budgetPerHead, text = '') {
  const options = load().catalog.filter((v) => v.category === category).sort((a, b) => b.perPerson - a.perPerson);
  if (!options.length) return { vendor: 'Concierge sourced vendor', perPerson: 100 };
  // Prefer a vendor the person named ("Giants", "Napa", "Quince").
  const words = text.toLowerCase().match(/[a-z]{4,}/g) || [];
  const named = options.find((v) => words.some((w) => `${v.vendor} ${v.city}`.toLowerCase().includes(w)));
  if (named && (!budgetPerHead || named.perPerson <= budgetPerHead)) return named;
  if (budgetPerHead) return options.find((v) => v.perPerson <= budgetPerHead) || options[options.length - 1];
  return options[0];
}

// Build a complete, priced draft the requester can review before committing.
export async function plan(text, requesterId, { now = new Date(), useLLM = true } = {}) {
  const requester = person(requesterId);
  if (!requester) throw new Error(`Unknown requester ${requesterId}`);
  const reasoning = [];
  let intent = useLLM ? await parseWithClaude(text, now.toISOString().slice(0, 10)) : null;
  if (intent) reasoning.push('Parsed request with Claude (structured output).');
  else {
    intent = parseRuleBased(text, now);
    reasoning.push('Parsed request with the built-in rule engine.');
  }

  let groupId = null;
  let attendees = [requesterId];
  if (intent.funding === 'shared' || intent.groupType) {
    const group = load().groups.find((g) => g.type === (intent.groupType || 'friends') && g.members.includes(requesterId));
    if (group) {
      groupId = group.id;
      attendees = [...group.members];
      if (!intent.partySize) intent.partySize = group.members.length;
      reasoning.push(`Matched ${group.type} group "${group.name}" (${group.members.length} members) for cost sharing.`);
    } else if (intent.funding === 'shared') {
      intent.funding = 'personal';
      reasoning.push('No matching group found — treating as a personal booking.');
    }
  }
  intent.partySize = Math.max(1, intent.partySize || 1);

  const perHeadBudget = intent.budget ? intent.budget / intent.partySize : null;
  const vendor = pickVendor(intent.category, perHeadBudget, text);
  const estimate = Math.round(vendor.perPerson * intent.partySize * 100) / 100;
  reasoning.push(`Selected ${vendor.vendor} at ~$${vendor.perPerson}/person × ${intent.partySize} = $${estimate.toLocaleString()}.`);
  if (intent.budget && estimate > intent.budget) reasoning.push(`Estimate exceeds the $${intent.budget} cap you gave — cheapest option chosen.`);
  reasoning.push(`Funding: ${intent.funding}; purpose: ${intent.purpose}.`);

  return {
    category: intent.category,
    categoryLabel: CATEGORIES[intent.category].label,
    title: intent.title,
    vendor: vendor.vendor,
    partySize: intent.partySize,
    date: intent.date,
    amount: estimate,
    funding: intent.funding,
    purpose: intent.purpose,
    clientFacing: Boolean(intent.clientFacing),
    groupId,
    attendees,
    requestedBy: requesterId,
    reasoning,
  };
}
