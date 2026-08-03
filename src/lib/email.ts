import { Resend } from "resend";
import { BRAND } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

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
    console.info("[email:dev:html]", options.html.slice(0, 500));
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
  const to = process.env.CONTACT_RECIPIENT_EMAIL || BRAND.email;
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
  const to = process.env.CONTACT_RECIPIENT_EMAIL || BRAND.email;
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

export type OrderEmailAddress = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

export type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
  variantLabel?: string | null;
  sku?: string | null;
  personalization?: Array<{
    label?: string | null;
    value?: string | null;
  }> | null;
};

export type OrderEmailData = {
  orderNumber: string;
  email: string;
  phone?: string | null;
  currency?: string | null;
  subtotal: number;
  discountAmount?: number | null;
  discountCode?: string | null;
  shippingAmount?: number | null;
  taxAmount?: number | null;
  total: number;
  paymentStatus?: string | null;
  fulfillmentStatus?: string | null;
  shippingMethod?: { name?: string | null; price?: number | null } | null;
  shippingAddress?: OrderEmailAddress | null;
  billingAddress?: OrderEmailAddress | null;
  customerNotes?: string | null;
  items: OrderEmailItem[];
  paidAt?: Date | string | null;
};

function money(amount: number, currency?: string | null) {
  return formatCurrency(amount, currency || "CAD");
}

function formatAddress(address?: OrderEmailAddress | null) {
  if (!address) return "<p>—</p>";
  const lines = [
    address.fullName,
    address.line1,
    address.line2,
    [address.city, address.province, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
    address.phone ? `Phone: ${address.phone}` : null,
    address.email ? `Email: ${address.email}` : null,
  ].filter(Boolean);
  return `<p>${lines.map((l) => escapeHtml(String(l))).join("<br/>")}</p>`;
}

function itemsTable(items: OrderEmailItem[], currency?: string | null) {
  const rows = items
    .map((item) => {
      const personalization =
        item.personalization && item.personalization.length
          ? `<ul style="margin:6px 0 0;padding-left:16px;color:#555;font-size:12px;">${item.personalization
              .map(
                (p) =>
                  `<li><strong>${escapeHtml(p.label || "")}:</strong> ${escapeHtml(p.value || "")}</li>`,
              )
              .join("")}</ul>`
          : "";
      const label = item.variantLabel
        ? `${item.name} (${item.variantLabel})`
        : item.name;
      const lineTotal = item.price * item.quantity;
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;vertical-align:top;">
            <strong>${escapeHtml(label)}</strong>
            ${item.sku ? `<div style="font-size:12px;color:#777;">SKU: ${escapeHtml(item.sku)}</div>` : ""}
            ${personalization}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(money(item.price, currency))}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(money(lineTotal, currency))}</td>
        </tr>`;
    })
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f6f1f6;">
          <th align="left" style="padding:10px 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Item</th>
          <th style="padding:10px 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Qty</th>
          <th align="right" style="padding:10px 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Price</th>
          <th align="right" style="padding:10px 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(order: OrderEmailData) {
  const currency = order.currency || "CAD";
  return `
    <table width="100%" style="margin-top:8px;font-size:14px;">
      <tr><td>Subtotal</td><td align="right">${escapeHtml(money(order.subtotal, currency))}</td></tr>
      ${
        order.discountAmount
          ? `<tr><td>Discount${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ""}</td><td align="right">−${escapeHtml(money(order.discountAmount, currency))}</td></tr>`
          : ""
      }
      <tr><td>Shipping${order.shippingMethod?.name ? ` — ${escapeHtml(order.shippingMethod.name)}` : ""}</td><td align="right">${escapeHtml(money(order.shippingAmount || 0, currency))}</td></tr>
      ${
        order.taxAmount
          ? `<tr><td>Tax</td><td align="right">${escapeHtml(money(order.taxAmount, currency))}</td></tr>`
          : ""
      }
      <tr><td style="padding-top:8px;font-size:16px;"><strong>Total</strong></td><td align="right" style="padding-top:8px;font-size:16px;"><strong>${escapeHtml(money(order.total, currency))}</strong></td></tr>
    </table>`;
}

function orderEmailHtml(order: OrderEmailData, opts: { forAdmin: boolean }) {
  const title = opts.forAdmin
    ? `New order ${order.orderNumber}`
    : `Thank you for your order`;
  const intro = opts.forAdmin
    ? `<p>A new order was placed on the website. Full customer and order details are below.</p>`
    : `<p>We've received your order <strong>${escapeHtml(order.orderNumber)}</strong>. Here's a summary of what you ordered.</p>`;

  return `
    <div style="font-family:Georgia,serif;color:#2f2c31;max-width:640px;margin:0 auto;">
      <h1 style="font-size:24px;margin-bottom:8px;">${title}</h1>
      ${intro}
      <p style="font-size:13px;color:#666;">
        Payment: ${escapeHtml(order.paymentStatus || "pending")} ·
        Status: ${escapeHtml(order.fulfillmentStatus || "pending")}
      </p>

      <h2 style="font-size:18px;margin-top:28px;">Customer</h2>
      <p>
        <strong>Name:</strong> ${escapeHtml(order.shippingAddress?.fullName || "—")}<br/>
        <strong>Email:</strong> ${escapeHtml(order.email)}<br/>
        <strong>Phone:</strong> ${escapeHtml(order.phone || order.shippingAddress?.phone || "—")}
      </p>

      <h2 style="font-size:18px;margin-top:28px;">Items</h2>
      ${itemsTable(order.items, order.currency)}
      ${totalsBlock(order)}

      <div style="display:flex;gap:24px;flex-wrap:wrap;margin-top:28px;">
        <div style="flex:1;min-width:220px;">
          <h2 style="font-size:18px;">Shipping address</h2>
          ${formatAddress(order.shippingAddress)}
        </div>
        <div style="flex:1;min-width:220px;">
          <h2 style="font-size:18px;">Billing address</h2>
          ${formatAddress(order.billingAddress)}
        </div>
      </div>

      ${
        order.customerNotes
          ? `<h2 style="font-size:18px;margin-top:28px;">Customer notes</h2><p>${escapeHtml(order.customerNotes).replace(/\n/g, "<br/>")}</p>`
          : ""
      }

      <p style="margin-top:32px;font-size:13px;color:#777;">— ${escapeHtml(BRAND.name)}</p>
    </div>
  `;
}

export function toOrderEmailData(order: {
  orderNumber: string;
  email: string;
  phone?: string | null;
  currency?: string | null;
  subtotal: number;
  discountAmount?: number | null;
  discountCode?: string | null;
  shippingAmount?: number | null;
  taxAmount?: number | null;
  total: number;
  paymentStatus?: string | null;
  fulfillmentStatus?: string | null;
  shippingMethod?: { name?: string | null; price?: number | null } | null;
  shippingAddress?: OrderEmailAddress | null;
  billingAddress?: OrderEmailAddress | null;
  customerNotes?: string | null;
  items: OrderEmailItem[];
  paidAt?: Date | string | null;
}): OrderEmailData {
  return {
    orderNumber: order.orderNumber,
    email: order.email,
    phone: order.phone,
    currency: order.currency,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    discountCode: order.discountCode,
    shippingAmount: order.shippingAmount,
    taxAmount: order.taxAmount,
    total: order.total,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    shippingMethod: order.shippingMethod,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    customerNotes: order.customerNotes,
    items: order.items,
    paidAt: order.paidAt,
  };
}

/** Customer confirmation with full order details */
export async function sendOrderConfirmation(order: OrderEmailData) {
  return sendEmail({
    to: order.email,
    subject: `Order confirmation ${order.orderNumber} — RW Designs Canada`,
    html: orderEmailHtml(order, { forAdmin: false }),
  });
}

/** Admin notification with full order + customer details */
export async function notifyAdminNewOrder(order: OrderEmailData) {
  const to = process.env.CONTACT_RECIPIENT_EMAIL || BRAND.email;
  return sendEmail({
    to,
    subject: `New order ${order.orderNumber} — ${order.shippingAddress?.fullName || order.email}`,
    replyTo: order.email,
    html: orderEmailHtml(order, { forAdmin: true }),
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
