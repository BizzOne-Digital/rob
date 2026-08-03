import { Resend } from "resend";
import { BRAND } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from =
  process.env.EMAIL_FROM ||
  `RW Designs Canada <onboarding@resend.dev>`;

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!resend) {
    console.info("[email:dev]", options.subject, "→", options.to);
    return { id: "dev-mode", skipped: true as const };
  }

  const result = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  });

  return result;
}

export async function notifyAdminInquiry(data: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  const to =
    process.env.CONTACT_RECIPIENT_EMAIL || BRAND.email;
  return sendEmail({
    to,
    subject: `New inquiry from ${data.name} (${data.type})`,
    replyTo: data.email,
    html: `
      <h2>New website inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Type:</strong> ${escapeHtml(data.type)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
    `,
  });
}

export async function notifyAdminCustomRequest(data: {
  name: string;
  email: string;
  creationType: string;
}) {
  const to =
    process.env.CONTACT_RECIPIENT_EMAIL || BRAND.email;
  return sendEmail({
    to,
    subject: `New custom request: ${data.creationType}`,
    replyTo: data.email,
    html: `
      <h2>New custom creation request</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Type:</strong> ${escapeHtml(data.creationType)}</p>
      <p>Review it in the admin portal.</p>
    `,
  });
}

export async function sendOrderConfirmation(data: {
  email: string;
  orderNumber: string;
  total: string;
}) {
  return sendEmail({
    to: data.email,
    subject: `Order confirmation ${data.orderNumber} — RW Designs Canada`,
    html: `
      <h2>Thank you for your order</h2>
      <p>We've received your order <strong>${escapeHtml(data.orderNumber)}</strong>.</p>
      <p>Total: ${escapeHtml(data.total)}</p>
      <p>You'll receive updates as we prepare your handmade pieces.</p>
      <p>— ${BRAND.name}</p>
    `,
  });
}

export async function sendShippingEmail(data: {
  email: string;
  orderNumber: string;
  trackingNumber?: string;
}) {
  return sendEmail({
    to: data.email,
    subject: `Your order ${data.orderNumber} is on its way`,
    html: `
      <h2>Your order has shipped</h2>
      <p>Order <strong>${escapeHtml(data.orderNumber)}</strong> is on its way.</p>
      ${
        data.trackingNumber
          ? `<p>Tracking: ${escapeHtml(data.trackingNumber)}</p>`
          : ""
      }
      <p>— ${BRAND.name}</p>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
