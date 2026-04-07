import { NextResponse } from "next/server";
import type { LeadItem } from "@/lib/manager/types";
import { readManagerState, writeManagerState } from "@/lib/manager/persist";
import { analyzeLead } from "@/lib/manager/lead-analysis";
import { rateLimit } from "@/lib/rate-limit";
import { escapeHtml, sanitizeEmail, sanitizeString, sanitizeUrl } from "@/lib/sanitize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Rate limit: 5 submissions per 10 minutes per IP
  const rl = await rateLimit(`contact:${ip}`, 5, 600);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Honeypot: bots fill hidden fields, humans don't
  if (b._hp && String(b._hp).length > 0) {
    // Silently succeed — don't reveal bot detection
    return NextResponse.json({ ok: true });
  }

  // Timing check: form must be open for at least 3 seconds
  const loadedAt = Number(b._t) || 0;
  if (loadedAt > 0 && Date.now() - loadedAt < 3000) {
    return NextResponse.json({ error: "Submission rejected." }, { status: 400 });
  }

  // Sanitize all inputs
  const name = sanitizeString(b.name, 100);
  const email = sanitizeEmail(b.email);
  const business = sanitizeString(b.business, 200);
  const phone = sanitizeString(b.phone, 30);
  const budget = sanitizeString(b.budget, 50);
  const website = sanitizeUrl(b.website);
  const description = sanitizeString(b.description, 2000);

  if (!name || !email || !business || !description) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  // Save as a new lead in the manager dashboard (with AI analysis)
  try {
    const state = await readManagerState();
    const leadBase: Omit<LeadItem, "analysis"> = {
      id: crypto.randomUUID(),
      name,
      business,
      email,
      phone,
      source: "Contact Form",
      stage: "new",
      notes: `${description}${budget ? `\n\nBudget: ${budget}` : ""}${website ? `\nCurrent website: ${website}` : ""}`,
      nextStep: "Review proposal request and reply within 24 hours.",
      createdAt: new Date().toISOString(),
    };

    // Auto-analyze proposal requirements immediately
    const analysis = analyzeLead(leadBase);
    const lead: LeadItem = { ...leadBase, analysis };

    const activity = {
      id: crypto.randomUUID(),
      at: new Date().toLocaleString(),
      label: `New proposal request: ${name} — ${business} (${email}) · AI analysis ready`,
      tone: "success" as const,
    };
    await writeManagerState({
      ...state,
      leads: [lead, ...state.leads].slice(0, 300),
      activity: [activity, ...state.activity].slice(0, 80),
    });
  } catch (err) {
    console.error("[contact] Failed to save lead:", err);
    // Don't block the response — email is more important
  }

  // Send email notification via Gmail SMTP (nodemailer)
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (toEmail && gmailUser && gmailPass) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });
      await transporter.sendMail({
        from: `"Clearview Digital" <${gmailUser}>`,
        to: toEmail,
        replyTo: email,
        subject: `New proposal request: ${name} — ${business}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#132238">
            <div style="background:#183153;padding:24px 28px;border-radius:12px 12px 0 0">
              <p style="margin:0;color:#fff;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase">
                Clearview Digital
              </p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:20px;font-weight:700">
                New Proposal Request
              </h1>
            </div>
            <div style="border:1px solid #dbe2ea;border-top:none;padding:28px;border-radius:0 0 12px 12px;background:#fff">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#475569;font-size:13px;width:120px">Name</td><td style="padding:6px 0;font-size:13px;font-weight:600">${escapeHtml(name)}</td></tr>
                <tr><td style="padding:6px 0;color:#475569;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px"><a href="mailto:${escapeHtml(email)}" style="color:#f97316">${escapeHtml(email)}</a></td></tr>
                <tr><td style="padding:6px 0;color:#475569;font-size:13px">Business</td><td style="padding:6px 0;font-size:13px;font-weight:600">${escapeHtml(business)}</td></tr>
                ${phone ? `<tr><td style="padding:6px 0;color:#475569;font-size:13px">Phone</td><td style="padding:6px 0;font-size:13px">${escapeHtml(phone)}</td></tr>` : ""}
                ${budget ? `<tr><td style="padding:6px 0;color:#475569;font-size:13px">Budget</td><td style="padding:6px 0;font-size:13px">${escapeHtml(budget)}</td></tr>` : ""}
                ${website ? `<tr><td style="padding:6px 0;color:#475569;font-size:13px">Website</td><td style="padding:6px 0;font-size:13px">${escapeHtml(website)}</td></tr>` : ""}
              </table>
              <div style="margin-top:20px;padding:16px;background:#f3f5f7;border-radius:10px">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#475569">Project Details</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#132238;white-space:pre-wrap">${escapeHtml(description)}</p>
              </div>
              <p style="margin-top:24px;font-size:12px;color:#94a3b8">
                Submitted via Clearview Digital contact form · Reply to this email to respond directly to ${escapeHtml(name)}.
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("[contact] Failed to send email:", err);
      // Lead is already saved — don't block success response
    }
  }

  return NextResponse.json({ ok: true });
}
