// Optional Claude-powered intent parsing. If the SDK isn't installed or no
// credentials are configured, callers fall back to the deterministic parser.
const MODEL = process.env.EOS_MODEL || 'claude-opus-5';

let clientPromise = null;

async function getClient() {
  if (process.env.EOS_DISABLE_LLM === '1') return null;
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  if (!clientPromise) {
    clientPromise = import('@anthropic-ai/sdk')
      .then(({ default: Anthropic }) => new Anthropic())
      .catch(() => null);
  }
  return clientPromise;
}

const INTENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['category', 'title', 'partySize', 'date', 'funding', 'purpose', 'budget', 'groupType', 'clientFacing'],
  properties: {
    category: { type: 'string', enum: ['movies', 'events', 'reservations', 'pdr', 'catering', 'gifting', 'experiences'] },
    title: { type: 'string', description: 'Short booking title, e.g. "Client dinner for 4"' },
    partySize: { type: 'integer', description: 'Number of attendees or gift recipients' },
    date: { type: 'string', description: 'ISO date YYYY-MM-DD' },
    funding: { type: 'string', enum: ['corporate', 'reimbursable', 'personal', 'shared'] },
    purpose: { type: 'string', enum: ['business', 'morale', 'wellbeing', 'personal'] },
    budget: { type: ['number', 'null'], description: 'Explicit spend cap in Indian rupees (INR) if the user named one' },
    groupType: { type: ['string', 'null'], enum: ['family', 'friends', null] },
    clientFacing: { type: 'boolean' },
  },
};

const SYSTEM = `You are the Concierge agent inside an entertainment operating system for a company in India.
Categories: movies (cinema tickets), events (concerts, sports matches, tech conferences, comedy, theatre, food festivals), reservations (restaurant tables), pdr (private dining rooms/banquets), catering, gifting, experiences (offsites, walks, classes).
Turn a person's free-text request into a structured booking intent.
Funding rules: client or team work -> corporate. A movie or concert for yourself -> personal. "I'll pay and expense it" / "reimburse" -> reimbursable.
"with my family" or "with friends" and sharing costs -> shared (set groupType). Paying for yourself only -> personal.
Purpose: client entertainment -> business; team celebrations/offsites -> morale; personal wellbeing/leisure -> wellbeing or personal.
Resolve relative dates against today's date given in the request.`;

export async function parseWithClaude(text, today) {
  const client = await getClient();
  if (!client) return null;
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: INTENT_SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: `Today is ${today}.\nRequest: ${text}` }],
    });
    if (response.stop_reason !== 'end_turn') return null;
    const block = response.content.find((b) => b.type === 'text');
    return block ? JSON.parse(block.text) : null;
  } catch (err) {
    console.warn('[llm] falling back to rule-based parser:', err?.message || err);
    return null;
  }
}

export function llmEnabled() {
  return process.env.EOS_DISABLE_LLM !== '1' && Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}
