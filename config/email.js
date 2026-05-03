const nodemailer = require('nodemailer');

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.trim();
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

/**
 * Sends contact notification to the site inbox, then tries a confirmation to the visitor.
 * @returns {{ ok: true } | { ok: false, code: string, message?: string }}
 */
const sendContactEmail = async (name, email, message) => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.trim();

  if (!user || !pass) {
    console.error(
      '[email] Missing EMAIL_USER or EMAIL_PASSWORD. Set them in backend .env (Gmail needs an App Password, not your normal login password).'
    );
    return { ok: false, code: 'NOT_CONFIGURED' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { ok: false, code: 'NOT_CONFIGURED' };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  try {
    await transporter.sendMail({
      from: `"Raas Media" <${user}>`,
      to: user,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br/>')}</p>
      `,
    });
    console.log('[email] Admin notification sent to', user);
  } catch (err) {
    console.error('[email] Failed to send admin notification:', err.message || err);
    return {
      ok: false,
      code: 'SMTP_ADMIN_FAILED',
      message: err.message || String(err),
    };
  }

  try {
    await transporter.sendMail({
      from: `"Raas Media" <${user}>`,
      to: email,
      subject: 'Thank you for contacting Raas Media',
      html: `
        <h2>Thank You!</h2>
        <p>Dear ${safeName},</p>
        <p>We have received your message and will get back to you soon.</p>
        <p>Best regards,<br>Raas Media & Entertainment</p>
      `,
    });
    console.log('[email] Visitor confirmation sent to', email);
  } catch (err) {
    console.error(
      '[email] Visitor confirmation failed (your team was still notified):',
      err.message || err
    );
  }

  return { ok: true };
};

module.exports = { sendContactEmail };
