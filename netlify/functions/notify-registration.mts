// Sends James an email whenever a parent submits the registration form.
// Reply-To is set to the parent's email, so hitting "Reply" goes straight to them.
//
// Environment variables (set in Netlify > Site configuration > Environment variables, scope: Functions):
//   RESEND_API_KEY                      required  – API key from resend.com
//   NOTIFY_TO                           optional  – inbox for notifications (default hello@maestrocoaching.academy)
//   NOTIFY_FROM                         optional  – sender (default "MAESTRO Registrations <onboarding@resend.dev>")
//   PAYMENT_LINK_SMALL_GROUP_TRAINING   optional  – Stripe payment link included in Small Group notifications

type Registration = {
  name?: string
  programme?: string
  dob?: string
  ageGroup?: string
  emergencyContactName?: string
  contactNumber?: string
  parentEmail?: string
  medical?: string
  experience?: string
  goals?: string
  additionalNotes?: string
  generalConsent?: boolean
  imageConsent?: boolean
}

const COMMITMENTS: Record<string, string> = {
  "Small Group Training":
    "£199 one-off sign-up + £99/month membership — 4 private group sessions a month (groups of 4–5), Sundays 1pm–6pm, Shepherd's Bush Powerleague",
  "1-2-1 Programme":
    "1-2-1 Programme — confirm Core or Premium with the family",
  "Sunday Service":
    "Sunday Service — weekly group session, Sundays 2pm–6pm, Shepherd's Bush",
  "Not sure yet":
    "Undecided — follow up with a free consultation",
}

const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const clip = (v: unknown, max = 2000): string => String(v ?? "").trim().slice(0, max)

const isEmail = (v: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const apiKey = Netlify.env.get("RESEND_API_KEY")
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set")
    return Response.json({ ok: false, error: "Email not configured" }, { status: 500 })
  }

  let data: Registration
  try {
    data = await req.json()
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const r = {
    name: clip(data.name, 120),
    programme: clip(data.programme, 80) || "Not specified",
    dob: clip(data.dob, 40),
    ageGroup: clip(data.ageGroup, 40),
    emergencyContactName: clip(data.emergencyContactName, 120),
    contactNumber: clip(data.contactNumber, 40),
    parentEmail: clip(data.parentEmail, 200),
    medical: clip(data.medical),
    experience: clip(data.experience),
    goals: clip(data.goals),
    additionalNotes: clip(data.additionalNotes),
    generalConsent: Boolean(data.generalConsent),
    imageConsent: Boolean(data.imageConsent),
  }

  if (!r.name || !isEmail(r.parentEmail)) {
    return Response.json({ ok: false, error: "Player name and a valid parent email are required" }, { status: 400 })
  }

  const commitment = COMMITMENTS[r.programme] ?? r.programme
  const paymentLink =
    r.programme === "Small Group Training" ? Netlify.env.get("PAYMENT_LINK_SMALL_GROUP_TRAINING") || "" : ""

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:180px;vertical-align:top;">${esc(label)}</td>` +
    `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;white-space:pre-wrap;">${esc(value || "—")}</td></tr>`

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111;">
  <div style="background:#0a0a0a;color:#ccff33;padding:18px 22px;font-weight:bold;font-size:18px;letter-spacing:1px;">MAESTRO · NEW REGISTRATION</div>
  <div style="padding:20px 22px;background:#f7f7f2;">
    <p style="margin:0 0 6px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;">Registered for</p>
    <p style="margin:0 0 14px;font-size:22px;font-weight:bold;">${esc(r.programme)}</p>
    <p style="margin:0 0 6px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;">Commitment</p>
    <p style="margin:0;font-size:15px;">${esc(commitment)}</p>
    ${
      paymentLink
        ? `<p style="margin:16px 0 0;font-size:14px;">Payment link to send once you've placed them in a group:<br><a href="${esc(paymentLink)}" style="color:#0a0a0a;font-weight:bold;">${esc(paymentLink)}</a></p>`
        : ""
    }
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;">
    ${row("Player", r.name)}
    ${row("Date of birth", r.dob)}
    ${row("Age group", r.ageGroup)}
    ${row("Parent email", r.parentEmail)}
    ${row("Emergency contact", r.emergencyContactName)}
    ${row("Contact number", r.contactNumber)}
    ${row("Medical information", r.medical)}
    ${row("Experience / position", r.experience)}
    ${row("Areas to improve", r.goals)}
    ${row("Notes / questions", r.additionalNotes)}
    ${row("Participation consent", r.generalConsent ? "Yes" : "No")}
    ${row("Photo / video consent", r.imageConsent ? "Yes" : "No")}
  </table>
  <p style="font-size:12px;color:#888;padding:16px 22px;">Hit Reply to respond directly to ${esc(r.parentEmail)}.</p>
</div>`

  const text = [
    `NEW REGISTRATION: ${r.programme}`,
    `Commitment: ${commitment}`,
    paymentLink ? `Payment link: ${paymentLink}` : "",
    "",
    `Player: ${r.name}`,
    `Date of birth: ${r.dob || "—"}`,
    `Age group: ${r.ageGroup || "—"}`,
    `Parent email: ${r.parentEmail}`,
    `Emergency contact: ${r.emergencyContactName || "—"}`,
    `Contact number: ${r.contactNumber || "—"}`,
    `Medical information: ${r.medical || "—"}`,
    `Experience / position: ${r.experience || "—"}`,
    `Areas to improve: ${r.goals || "—"}`,
    `Notes / questions: ${r.additionalNotes || "—"}`,
    `Participation consent: ${r.generalConsent ? "Yes" : "No"}`,
    `Photo / video consent: ${r.imageConsent ? "Yes" : "No"}`,
  ]
    .filter((l) => l !== null)
    .join("\n")

  const subject = `New registration: ${r.programme} · ${r.name}${r.ageGroup ? ` (${r.ageGroup})` : ""}`

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Netlify.env.get("NOTIFY_FROM") || "MAESTRO Registrations <onboarding@resend.dev>",
      to: [Netlify.env.get("NOTIFY_TO") || "hello@maestrocoaching.academy"],
      reply_to: r.parentEmail,
      subject,
      html,
      text,
    }),
  })

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text())
    return Response.json({ ok: false, error: "Email failed to send" }, { status: 502 })
  }

  return Response.json({ ok: true })
}

export const config = {
  path: "/api/notify-registration",
  method: "POST",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
