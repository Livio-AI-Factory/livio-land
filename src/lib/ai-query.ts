// Natural-language query → structured filter parser for /listings/land.
// Powered by Claude Haiku 4.5. Used by the home-page + browse-page AI search
// bar: a buyer types "I need 100 MW in Texas with signed PPA, water rights,
// energized within 12 months" and we map it onto the existing filter shape
// the page already understands.
//
// Cost: ~$0.001 per call (~300 tokens in, 100 out). Safe to call on every
// search submit.

import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export type ParsedQuery = {
  // Subset of the filter shape /listings/land already understands. Anything
  // omitted means "no constraint."
  state?: string; // 2-letter code, uppercase
  minMW?: number;
  maxMW?: number;
  minAcres?: number;
  ppa?: "signed" | "in-negotiation" | "available" | "none";
  interconnection?: "study" | "facility-study" | "LGIA" | "energized";
  water?: "yes" | "limited" | "no" | "unknown";
  fiber?: "yes" | "near" | "no" | "unknown";
  deal?: "sale" | "lease" | "JV";
  maxPrice?: number; // dollars, total
  // Free-text rephrased version of the query that downstream relevance
  // scoring can use. The buyer's original prose, normalized.
  intent?: string;
};

const STATE_LIST =
  "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC";

const SYSTEM_PROMPT = `You are a query parser for a powered-land marketplace serving AI Data Center developers.

Given a buyer's natural-language description of the site they're looking for, extract a JSON object with any of these fields you can confidently infer (omit fields the user didn't mention):

- state: 2-letter US state code, uppercase. Resolve common references: "Texas"→TX, "the Dakotas"→pick one, "PJM"→VA or PA depending on context, "ERCOT"→TX. If multiple states are named, pick the most specific.
- minMW: minimum megawatts the buyer needs (number). "100 MW" → 100. "around 100" → 100. "100-150" → 100.
- maxMW: maximum megawatts (number). "100-150" → 150. "up to 200" → 200. Leave undefined if user only stated a target.
- minAcres: minimum acreage if mentioned (number).
- ppa: PPA status the buyer wants — one of "signed" | "in-negotiation" | "available" | "none". "PPA in hand"→signed. "PPA-ready"→signed. "no PPA"→none.
- interconnection: target stage — one of "study" | "facility-study" | "LGIA" | "energized". "LGIA executed"→LGIA. "energized today"→energized. "FS done"→facility-study.
- water: "yes" | "limited" | "no" | "unknown". "needs water rights"→yes. "water-light OK"→limited.
- fiber: "yes" | "near" | "no" | "unknown". "fiber on site"→yes. "fiber nearby"→near.
- deal: "sale" | "lease" | "JV". "ground lease"→lease. "joint venture"→JV. "outright purchase"→sale.
- maxPrice: maximum total purchase price in dollars (number). "$10M"→10000000. "under 5 million"→5000000.
- intent: a normalized one-sentence rephrasing of the buyer's intent for downstream relevance scoring. Stay close to the buyer's words; do not invent constraints they didn't state.

Valid US state codes: ${STATE_LIST}.

Return ONLY the JSON object, no surrounding markdown or explanation. If the input is too vague to parse anything, return {"intent": "<original input>"}.`;

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it in Railway → livio-land → Variables.",
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

/**
 * Parse a natural-language land query into structured filter constraints.
 * Falls back to {intent: <text>} on any error — the page still renders the
 * full unfiltered list, with the typed query surfaced as a "we couldn't
 * parse this" hint.
 */
export async function parseAiQuery(text: string): Promise<ParsedQuery> {
  const trimmed = text.trim();
  if (trimmed.length < 4) return {};
  if (trimmed.length > 1000) {
    // Cap absurd inputs — nobody is writing a 1000-char land query in good
    // faith, and we don't want to ship paragraphs of LLM tokens per search.
    return { intent: trimmed.slice(0, 1000) };
  }

  try {
    const response = await client().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: trimmed }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { intent: trimmed };

    // Strip any code fences the model might add despite our instructions.
    const raw = textBlock.text
      .trim()
      .replace(/^\`\`\`(?:json)?\s*/i, "")
      .replace(/\s*\`\`\`$/i, "");

    const parsed = JSON.parse(raw) as ParsedQuery;
    return cleanShape(parsed, trimmed);
  } catch (e) {
    console.error("[ai-query] parse failed:", e);
    return { intent: trimmed };
  }
}

function cleanShape(p: ParsedQuery, original: string): ParsedQuery {
  const out: ParsedQuery = {};
  if (typeof p.state === "string" && /^[A-Z]{2}$/.test(p.state)) out.state = p.state;
  if (typeof p.minMW === "number" && p.minMW > 0 && p.minMW < 100000) out.minMW = p.minMW;
  if (typeof p.maxMW === "number" && p.maxMW > 0 && p.maxMW < 100000) out.maxMW = p.maxMW;
  if (typeof p.minAcres === "number" && p.minAcres > 0 && p.minAcres < 1_000_000) out.minAcres = p.minAcres;
  if (p.ppa && ["signed", "in-negotiation", "available", "none"].includes(p.ppa)) out.ppa = p.ppa;
  if (p.interconnection && ["study", "facility-study", "LGIA", "energized"].includes(p.interconnection))
    out.interconnection = p.interconnection;
  if (p.water && ["yes", "limited", "no", "unknown"].includes(p.water)) out.water = p.water;
  if (p.fiber && ["yes", "near", "no", "unknown"].includes(p.fiber)) out.fiber = p.fiber;
  if (p.deal && ["sale", "lease", "JV"].includes(p.deal)) out.deal = p.deal;
  if (typeof p.maxPrice === "number" && p.maxPrice > 0) out.maxPrice = p.maxPrice;
  out.intent = typeof p.intent === "string" && p.intent.length > 0 ? p.intent : original;
  return out;
}

/**
 * Score a single listing 0-100 against the buyer's parsed query. Used to
 * order results when the buyer arrives via AI search. Pure rule-based — no
 * second LLM call per listing, since marketplaces with N listings would
 * otherwise blow up cost. The intent string is shown to the user as
 * context but is not used in the score.
 */
export function scoreListingAgainstQuery(
  listing: {
    state: string | null;
    availableMW: number;
    acres: number;
    ppaStatus: string | null;
    interconnectionStage: string | null;
    waterAvailable: string | null;
    fiberAvailable: string | null;
    pricingModel: string | null;
    askingPrice: number | null;
  },
  q: ParsedQuery,
): number {
  let score = 50; // neutral baseline

  // State match is the strongest signal — buyers usually pick a region first.
  if (q.state) {
    if (listing.state === q.state) score += 30;
    else score -= 15;
  }

  // MW band: hard target = best, near-target = OK, way off = bad.
  if (q.minMW && listing.availableMW < q.minMW) score -= 20;
  if (q.maxMW && listing.availableMW > q.maxMW) score -= 5; // oversize less bad than undersize
  if (q.minMW && listing.availableMW >= q.minMW && (!q.maxMW || listing.availableMW <= q.maxMW)) {
    score += 15;
  }

  if (q.minAcres) {
    if (listing.acres >= q.minAcres) score += 5;
    else score -= 10;
  }

  if (q.ppa) {
    if (listing.ppaStatus === q.ppa) score += 10;
    else if (q.ppa === "signed" && listing.ppaStatus === "in-negotiation") score += 3;
    else score -= 5;
  }

  if (q.interconnection) {
    const order: Record<string, number> = {
      study: 1,
      "facility-study": 2,
      LGIA: 3,
      energized: 4,
    };
    const want = order[q.interconnection];
    const have = listing.interconnectionStage ? order[listing.interconnectionStage] ?? 0 : 0;
    if (have >= want) score += 12;
    else score -= 8 * (want - have);
  }

  if (q.water) {
    if (listing.waterAvailable === q.water) score += 6;
    else if (q.water === "yes" && listing.waterAvailable === "limited") score += 2;
    else if (q.water === "yes" && (listing.waterAvailable === "no" || !listing.waterAvailable)) score -= 8;
  }

  if (q.fiber) {
    if (listing.fiberAvailable === q.fiber) score += 4;
    else if (q.fiber === "yes" && listing.fiberAvailable === "near") score += 1;
  }

  if (q.deal && listing.pricingModel === q.deal) score += 3;
  if (q.maxPrice && listing.askingPrice != null && listing.askingPrice > q.maxPrice) score -= 12;

  return Math.max(0, Math.min(100, score));
}
