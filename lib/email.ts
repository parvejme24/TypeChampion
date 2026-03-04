import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER;

if (!host || !user || !pass) {
  // In dev, just log a warning; in prod you should ensure these are set
  console.warn("[Email] SMTP configuration is missing. Emails will not be sent.");
}

const transporter =
  host && user && pass
    ? nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
    : null;

export async function sendLoginEmail(to: string, name?: string | null) {
  if (!transporter) return;

  const displayName = name || to;

  await transporter.sendMail({
    from,
    to,
    subject: "You just signed in to TypeChampion",
    text: `Hi ${displayName},

You just signed in to your TypeChampion account with this email address.

If this was you, you can ignore this message.
If this wasn't you, please secure your Google account and contact support.

— TypeChampion`,
    html: `<p>Hi ${displayName},</p>
<p>You just signed in to your <strong>TypeChampion</strong> account with this email address.</p>
<p>If this was you, you can safely ignore this message.<br/>
If this <strong>wasn't you</strong>, please secure your Google account and contact support.</p>
<p>— TypeChampion</p>`,
  });
}

