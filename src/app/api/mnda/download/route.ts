// Streams the current MNDA as a plain-text download. Off-takers and
// landowners can grab a copy to read offline, share with counsel, or paste
// into Word for redlining. The file content is built from the same source
// of truth (src/content/mnda.ts) the on-screen render uses, so what they
// download is exactly what they sign.
//
// Why .txt and not .docx: zero new npm dependencies and Word/Pages/Docs
// can all open .txt and apply Track Changes from there. We can upgrade to
// generated .docx later if counsel asks for native track-change support.

import { NextResponse } from "next/server";
import {
  MNDA_TITLE,
  MNDA_INTRO,
  MNDA_SECTIONS,
  MNDA_VERSION,
  MNDA_DISCLOSING_PARTY,
} from "@/content/mnda";

export const dynamic = "force-static"; // content is build-time constant

export async function GET() {
  const lines: string[] = [];
  lines.push(MNDA_TITLE.toUpperCase());
  lines.push(`Version ${MNDA_VERSION}`);
  lines.push(`Between you and ${MNDA_DISCLOSING_PARTY.name}`);
  lines.push("");
  lines.push("=".repeat(72));
  lines.push("");
  lines.push(MNDA_INTRO);
  lines.push("");

  for (const section of MNDA_SECTIONS) {
    lines.push("");
    lines.push(section.heading.toUpperCase());
    lines.push("-".repeat(section.heading.length));
    lines.push("");
    lines.push(section.body);
    lines.push("");
  }

  lines.push("");
  lines.push("=".repeat(72));
  lines.push("");
  lines.push(`Signed for ${MNDA_DISCLOSING_PARTY.name}:`);
  lines.push(`${MNDA_DISCLOSING_PARTY.signer}, ${MNDA_DISCLOSING_PARTY.title}`);
  lines.push(MNDA_DISCLOSING_PARTY.address);
  lines.push("");
  lines.push("Signed for Counterparty:");
  lines.push("Name: ____________________________________");
  lines.push("Title: ___________________________________");
  lines.push("Company: _________________________________");
  lines.push("Email: ___________________________________");
  lines.push("Date: ____________________________________");
  lines.push("Signature: _______________________________");
  lines.push("");

  const body = lines.join("\n");
  const filename = `livio-mnda-${MNDA_VERSION}.txt`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Cache aggressively — the MNDA only changes when MNDA_VERSION bumps,
      // which forces a redeploy and a new URL surface.
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}
