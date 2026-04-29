// Sends an email via Resend if RESEND_API_KEY is set; otherwise logs and resolves.
// Set up: 1) sign up at resend.com (free 3k/month), 2) add RESEND_API_KEY to Railway env.
// Optionally verify a domain so FROM_EMAIL can be your own address.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || "Livio Land <onboarding@resend.dev>";
  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — would have sent:", {
      from,
      to: opts.to,
      subject: opts.subject,
    });
    return { ok: false, reason: "no-key" as const };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[email] Resend error", res.status, text);
      return { ok: false, reason: "http-error" as const, status: res.status };
    }
    return { ok: true as const };
  } catch (e) {
    console.error("[email] send threw", e);
    return { ok: false, reason: "exception" as const };
  }
}
