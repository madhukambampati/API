// Policy agent: decides who must approve a booking, in order.
import { load, person, dept } from '../store.js';
import { POLICY } from '../seed.js';

export function roleHolder(role) {
  return load().people.find((p) => (p.roles || []).includes(role));
}

// Pick an approver who isn't the requester; walk up the management chain if needed.
function notSelf(candidateId, requesterId) {
  let id = candidateId;
  const seen = new Set();
  while (id && id === requesterId && !seen.has(id)) {
    seen.add(id);
    id = person(id)?.managerId;
  }
  return id || roleHolder('finance').id;
}

function step(key, role, approverId, reason) {
  return { key, role, approverId, reason, status: 'pending', decidedAt: null, note: '' };
}

export function approvalChain(draft, budgetResult) {
  const requester = person(draft.requestedBy);
  const steps = [];
  const reasons = [];

  if (draft.funding !== 'corporate') {
    reasons.push(
      draft.funding === 'reimbursable'
        ? 'Paid personally — approvals happen on the expense report, not the booking.'
        : 'Personal / shared money — no company approval required.',
    );
    return { steps, reasons, autoApproved: true };
  }

  const amt = draft.amount;
  const perHead = amt / Math.max(1, draft.partySize);
  const cap = POLICY.perAttendeeCap[draft.category];
  const overCap = cap && perHead > cap;
  const overBudget = budgetResult?.status === 'over';
  const d = dept(requester.dept);

  if (amt > POLICY.autoApproveLimit || overCap || overBudget) {
    steps.push(step('manager', 'Manager', notSelf(requester.managerId, requester.id), `Spend $${amt.toLocaleString()} > $${POLICY.autoApproveLimit} auto-approve limit`));
  }
  if (amt > POLICY.managerLimit || overCap) {
    const head = notSelf(d.headId, requester.id);
    if (!steps.some((s) => s.approverId === head)) {
      steps.push(step('dept_head', 'Department head', head, overCap ? `$${Math.round(perHead)}/attendee exceeds $${cap} policy cap` : `Spend > $${POLICY.managerLimit.toLocaleString()}`));
    }
  }
  if (draft.clientFacing && POLICY.complianceCategories.includes(draft.category)) {
    steps.push(step('compliance', 'Compliance', roleHolder('compliance').id, 'Client tickets/gifts require gift & entertainment review'));
  }
  if (amt > POLICY.deptHeadLimit || overBudget) {
    const fin = notSelf(roleHolder('finance').id, requester.id);
    if (!steps.some((s) => s.approverId === fin)) {
      steps.push(step('finance', 'Finance (CFO)', fin, overBudget ? 'Exceeds department budget' : `Spend > $${POLICY.deptHeadLimit.toLocaleString()}`));
    }
  }

  if (!steps.length) reasons.push(`Within $${POLICY.autoApproveLimit} auto-approve limit and budget — approved by the Policy agent.`);
  else reasons.push(`${steps.length} approval step(s): ${steps.map((s) => s.role).join(' → ')}.`);
  return { steps, reasons, autoApproved: steps.length === 0 };
}

// Approval chain for a personally-paid expense report.
export function reportChain(report) {
  const owner = person(report.ownerId);
  const route = POLICY.expenseRouting[report.purpose] || POLICY.expenseRouting.business;
  const steps = [];
  if (report.purpose !== 'wellbeing') {
    steps.push(step('manager', 'Manager', notSelf(owner.managerId, owner.id), 'Manager confirms the spend was for work'));
  }
  const teamRole = route.team === 'Finance' ? 'finance' : route.team === 'HR' ? 'hr' : 'benefits';
  steps.push(step(teamRole, `${route.team} team`, notSelf(roleHolder(teamRole).id, owner.id), `${route.label} → ${route.team}`));
  return { steps, routeTo: route.team };
}
