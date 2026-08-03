"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { adminFetch } from "@/lib/admin/api";
import type { AdminItemResponse, AdminOrder } from "@/lib/admin/types";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { OrderFulfillmentStatus, OrderPaymentStatus } from "@/types";

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address?: AdminOrder["shippingAddress"];
}) {
  if (!address) {
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-admin-muted">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500">No address</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-admin-muted">
        {title}
      </h3>
      <div className="mt-2 space-y-0.5 text-sm text-slate-800">
        <p className="font-medium">{address.fullName}</p>
        {address.line1 ? <p>{address.line1}</p> : null}
        {address.line2 ? <p>{address.line2}</p> : null}
        <p>
          {[address.city, address.province, address.postalCode]
            .filter(Boolean)
            .join(", ")}
        </p>
        <p>{address.country}</p>
        {address.phone ? <p>{address.phone}</p> : null}
        {address.email ? <p>{address.email}</p> : null}
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fulfillmentStatus, setFulfillmentStatus] =
    useState<OrderFulfillmentStatus>("pending_payment");
  const [paymentStatus, setPaymentStatus] =
    useState<OrderPaymentStatus>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [customerVisibleNotes, setCustomerVisibleNotes] = useState("");
  const [timelineNote, setTimelineNote] = useState("");
  const [baseline, setBaseline] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminItemResponse<AdminOrder>>(
        `/api/admin/orders/${params.id}`,
      );
      const item = data.item;
      setOrder(item);
      setFulfillmentStatus(item.fulfillmentStatus);
      setPaymentStatus(item.paymentStatus);
      setTrackingNumber(item.trackingNumber ?? "");
      setInternalNotes(item.internalNotes ?? "");
      setCustomerVisibleNotes(item.customerVisibleNotes ?? "");
      setTimelineNote("");
      setBaseline(
        JSON.stringify({
          fulfillmentStatus: item.fulfillmentStatus,
          paymentStatus: item.paymentStatus,
          trackingNumber: item.trackingNumber ?? "",
          internalNotes: item.internalNotes ?? "",
          customerVisibleNotes: item.customerVisibleNotes ?? "",
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty =
    baseline !== "" &&
    JSON.stringify({
      fulfillmentStatus,
      paymentStatus,
      trackingNumber,
      internalNotes,
      customerVisibleNotes,
    }) !== baseline;

  async function save(extra?: {
    sendConfirmation?: boolean;
    sendShipping?: boolean;
  }) {
    setSaving(true);
    try {
      const data = await adminFetch<AdminItemResponse<AdminOrder>>(
        `/api/admin/orders/${params.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            fulfillmentStatus,
            paymentStatus,
            trackingNumber: trackingNumber || null,
            internalNotes: internalNotes || null,
            customerVisibleNotes: customerVisibleNotes || null,
            timelineNote: timelineNote || undefined,
            timelineVisibleToCustomer: false,
            sendConfirmation: extra?.sendConfirmation,
            sendShipping: extra?.sendShipping,
          }),
        },
      );
      setOrder(data.item);
      setTimelineNote("");
      setBaseline(
        JSON.stringify({
          fulfillmentStatus: data.item.fulfillmentStatus,
          paymentStatus: data.item.paymentStatus,
          trackingNumber: data.item.trackingNumber ?? "",
          internalNotes: data.item.internalNotes ?? "",
          customerVisibleNotes: data.item.customerVisibleNotes ?? "",
        }),
      );
      toast.success(
        extra?.sendConfirmation
          ? "Confirmation email sent"
          : extra?.sendShipping
            ? "Shipping email sent"
            : "Order updated",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Order" />
        <LoadingState />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <AdminHeader title="Order" />
        <ErrorState message={error || "Not found"} onRetry={() => void load()} />
      </>
    );
  }

  return (
    <>
      <UnsavedGuard dirty={dirty} />
      <AdminHeader
        title={order.orderNumber}
        description={`Placed ${
          order.createdAt
            ? format(parseISO(order.createdAt), "MMM d, yyyy HH:mm")
            : ""
        }`}
        actions={
          <>
            <Link href="/admin/orders" className="admin-btn-secondary no-print">
              Back
            </Link>
            <button
              type="button"
              className="admin-btn-secondary no-print"
              onClick={() => window.print()}
            >
              Print packing slip
            </button>
            <button
              type="button"
              className="admin-btn-secondary no-print"
              disabled={saving}
              onClick={() => void save({ sendConfirmation: true })}
            >
              Send confirmation
            </button>
            <button
              type="button"
              className="admin-btn-secondary no-print"
              disabled={saving}
              onClick={() => void save({ sendShipping: true })}
            >
              Send shipping email
            </button>
            <button
              type="button"
              className="admin-btn-primary no-print"
              disabled={saving}
              onClick={() => void save()}
            >
              Save
            </button>
          </>
        }
      />

      <div className="packing-slip grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="admin-card p-4">
            <h2 className="text-sm font-semibold">Items</h2>
            <ul className="mt-3 divide-y">
              {order.items.map((item, idx) => (
                <li key={item._id ?? idx} className="flex gap-3 py-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-14 w-14 rounded border object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded border bg-slate-50" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.variantLabel ? (
                      <p className="text-xs text-admin-muted">{item.variantLabel}</p>
                    ) : null}
                    <p className="text-xs text-admin-muted">
                      Qty {item.quantity} · {formatCurrency(item.price)}
                    </p>
                    {item.personalization?.length ? (
                      <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                        {item.personalization.map((p, i) => (
                          <li key={i}>
                            <strong>{p.label}:</strong> {p.value}
                            {p.fileUrl ? (
                              <>
                                {" "}
                                ·{" "}
                                <a
                                  href={p.fileUrl}
                                  className="underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  file
                                </a>
                              </>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="tabular-nums text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>{formatCurrency(order.discountAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.taxAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total, order.currency)}</span>
              </div>
            </div>
          </section>

          <section className="admin-card grid gap-6 p-4 md:grid-cols-2">
            <AddressBlock title="Shipping" address={order.shippingAddress} />
            <AddressBlock title="Billing" address={order.billingAddress} />
          </section>

          <section className="admin-card p-4">
            <h2 className="text-sm font-semibold">Timeline</h2>
            {order.timeline?.length ? (
              <ul className="mt-3 space-y-3">
                {[...order.timeline].reverse().map((event, i) => (
                  <li key={event._id ?? i} className="text-sm">
                    <div className="flex items-center gap-2">
                      {event.status ? <StatusBadge status={event.status} /> : null}
                      <span className="text-xs text-admin-muted">
                        {event.createdAt
                          ? format(parseISO(event.createdAt), "MMM d, HH:mm")
                          : ""}
                        {event.createdBy ? ` · ${event.createdBy}` : ""}
                      </span>
                    </div>
                    {event.note ? (
                      <p className="mt-1 text-slate-700">{event.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-admin-muted">No timeline events yet.</p>
            )}
          </section>
        </div>

        <div className="no-print space-y-4">
          <section className="admin-card space-y-3 p-4">
            <h2 className="text-sm font-semibold">Status</h2>
            <div>
              <label className="admin-label">Fulfillment</label>
              <select
                className="admin-input"
                value={fulfillmentStatus}
                onChange={(e) =>
                  setFulfillmentStatus(e.target.value as OrderFulfillmentStatus)
                }
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Payment</label>
              <select
                className="admin-input"
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as OrderPaymentStatus)
                }
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">Partially refunded</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Tracking number</label>
              <input
                className="admin-input"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label">Timeline note (optional)</label>
              <textarea
                className="admin-input min-h-[70px]"
                value={timelineNote}
                onChange={(e) => setTimelineNote(e.target.value)}
              />
            </div>
          </section>

          <section className="admin-card space-y-3 p-4">
            <h2 className="text-sm font-semibold">Notes</h2>
            <div>
              <label className="admin-label">Internal notes</label>
              <textarea
                className="admin-input min-h-[80px]"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label">Customer-visible notes</label>
              <textarea
                className="admin-input min-h-[80px]"
                value={customerVisibleNotes}
                onChange={(e) => setCustomerVisibleNotes(e.target.value)}
              />
            </div>
            {order.customerNotes ? (
              <div>
                <label className="admin-label">Customer checkout notes</label>
                <p className="rounded-md border bg-slate-50 p-3 text-sm">
                  {order.customerNotes}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
