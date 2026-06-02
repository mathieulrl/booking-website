import { formatLong } from "@/lib/date";
import { CONCIERGE_LINKS, LUGGAGE_DETAIL, LUGGAGE_PROVIDERS } from "@/lib/concierge";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type BookingEmailParams = {
  name: string;
  email: string;
  message: string;
  start: string;
  end: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stayLabel(start: string, end: string): string {
  return start === end
    ? formatLong(start)
    : `du ${formatLong(start)} au ${formatLong(end)}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function photoUrl(): string | null {
  const base = process.env.SITE_URL?.replace(/\/$/, "");
  return base ? `${base}/london-email.jpg` : null;
}

function conciergeRowsHtml(): string {
  const links = CONCIERGE_LINKS.map((link) => {
    const background = link.highlight ? "#fdf6e3" : "#faf7f2";
    return `
      <tr><td style="padding:4px 0">
        <a href="${link.href}" style="display:block;text-decoration:none;background:${background};border-radius:10px;padding:10px 12px;color:#1c1917">
          <span style="font-size:14px">${link.emoji} <strong>${link.title}</strong></span><br/>
          <span style="font-size:12px;color:#78716c">${link.detail}</span>
        </a>
      </td></tr>`;
  });

  const luggageLinks = LUGGAGE_PROVIDERS.map(
    (provider) =>
      `<a href="${provider.href}" style="color:#1c1917;text-decoration:underline">${provider.label}</a>`
  ).join(" · ");

  links.push(`
    <tr><td style="padding:4px 0">
      <div style="background:#faf7f2;border-radius:10px;padding:10px 12px">
        <span style="font-size:14px;color:#1c1917">🧳 <strong>Consigne à bagages</strong></span><br/>
        <span style="font-size:12px;color:#78716c">${LUGGAGE_DETAIL}</span><br/>
        <span style="font-size:13px">${luggageLinks}</span>
      </div>
    </td></tr>`);

  return links.join("");
}

export function renderConfirmationEmail(params: {
  name: string;
  start: string;
  end: string;
}): string {
  const stay = stayLabel(params.start, params.end);
  const photo = photoUrl();
  const hero = photo
    ? `<tr><td style="padding:0"><img src="${photo}" alt="Londres" width="600" style="display:block;width:100%;max-width:600px;height:auto" /></td></tr>`
    : "";

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;margin:0;padding:0">
  <tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)">
      <tr><td style="background:#1c1917;padding:26px 24px;text-align:center">
        <div style="color:#d6a44c;letter-spacing:4px;font-size:11px">★ ★ ★ ★ ★</div>
        <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:26px;margin-top:6px">Emma &amp; Mathieu's Hôtel</div>
        <div style="color:#d6a44c;letter-spacing:6px;font-size:11px;text-transform:uppercase;margin-top:4px">Londres</div>
      </td></tr>
      ${hero}
      <tr><td style="padding:28px 28px 4px;font-family:Georgia,'Times New Roman',serif;color:#1c1917;font-size:16px;line-height:1.6">
        <p style="margin:0 0 12px">Bonjour ${escapeHtml(params.name)},</p>
        <p style="margin:0 0 18px">Votre séjour chez nous est confirmé. Nous avons hâte de vous accueillir à Londres&nbsp;🗝️</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#f5f0e8;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:2px">Votre séjour</div>
          <div style="font-size:18px;color:#1c1917;margin-top:4px;text-transform:capitalize">${stay}</div>
        </td></tr></table>
        <p style="margin:18px 0 0;color:#57534e;font-size:14px">Nous vous communiquerons l'adresse exacte avant votre arrivée.</p>
      </td></tr>
      <tr><td style="padding:18px 28px 8px">
        <div style="border-top:1px solid #eee;padding-top:16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1c1917">Pour préparer votre venue</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">
          ${conciergeRowsHtml()}
        </table>
      </td></tr>
      <tr><td style="background:#faf7f2;padding:20px;text-align:center;color:#a8a29e;font-size:12px;font-family:Georgia,'Times New Roman',serif">
        À très bientôt,<br/>Emma &amp; Mathieu<br/>🗝️ Conciergerie · Londres
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

function notificationHtml(
  name: string,
  stay: string,
  email: string,
  message: string
): string {
  return `
  <div style="font-family:Georgia,serif;max-width:480px;margin:auto;color:#1c1917;line-height:1.6">
    <h2 style="margin:0 0 12px">Nouvelle réservation 🗝️</h2>
    <ul style="padding-left:18px">
      <li><strong>Nom :</strong> ${escapeHtml(name)}</li>
      <li><strong>Dates :</strong> ${stay}</li>
      <li><strong>Email :</strong> ${email ? escapeHtml(email) : "non communiqué"}</li>
      <li><strong>Message :</strong> ${message ? escapeHtml(message) : "—"}</li>
    </ul>
  </div>`;
}

async function sendEmail(
  apiKey: string,
  payload: {
    from: string;
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
  }
): Promise<void> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status} (to ${payload.to}): ${detail}`);
  }
}

export async function sendBookingEmails(params: BookingEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — skipping booking emails.");
    return;
  }

  const from = process.env.EMAIL_FROM || "Emma & Mathieu's Hôtel <onboarding@resend.dev>";
  const adminEmail = process.env.ADMIN_EMAIL;
  const stay = stayLabel(params.start, params.end);
  const guestEmail = params.email && isValidEmail(params.email) ? params.email : "";
  const errors: string[] = [];

  if (adminEmail) {
    try {
      await sendEmail(apiKey, {
        from,
        to: adminEmail,
        subject: `Nouvelle réservation : ${params.name} (${stay})`,
        html: notificationHtml(params.name, stay, params.email, params.message),
        replyTo: guestEmail || undefined,
      });
    } catch (error) {
      errors.push(`notification: ${error instanceof Error ? error.message : error}`);
    }
  } else {
    console.warn("ADMIN_EMAIL is not set — skipping admin notification.");
  }

  if (guestEmail) {
    try {
      await sendEmail(apiKey, {
        from,
        to: guestEmail,
        subject: "Votre séjour est confirmé — Emma & Mathieu's Hôtel",
        html: renderConfirmationEmail({
          name: params.name,
          start: params.start,
          end: params.end,
        }),
        replyTo: adminEmail || undefined,
      });
    } catch (error) {
      errors.push(`confirmation: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Booking email failures — ${errors.join(" | ")}`);
  }
}
