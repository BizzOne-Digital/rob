"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/ImagePicker";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { adminFetch } from "@/lib/admin/api";
import type { AdminItemResponse, SiteSettingsAdmin } from "@/lib/admin/types";
import type { MediaRef } from "@/types";

type TabId =
  | "business"
  | "branding"
  | "announcement"
  | "intro"
  | "nav"
  | "shipping"
  | "tax"
  | "emails"
  | "seo"
  | "analytics"
  | "policies"
  | "stripe";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "business", label: "Business" },
  { id: "branding", label: "Branding" },
  { id: "announcement", label: "Announcement" },
  { id: "intro", label: "Intro wrapper" },
  { id: "nav", label: "Navigation" },
  { id: "shipping", label: "Shipping" },
  { id: "tax", label: "Tax" },
  { id: "emails", label: "Contact emails" },
  { id: "seo", label: "SEO" },
  { id: "analytics", label: "Analytics" },
  { id: "policies", label: "Policies" },
  { id: "stripe", label: "Stripe" },
];

export function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettingsAdmin | null>(null);
  const [baseline, setBaseline] = useState("");
  const [tab, setTab] = useState<TabId>("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminFetch<AdminItemResponse<SiteSettingsAdmin>>("/api/admin/settings")
      .then((data) => {
        setSettings(data.item);
        setBaseline(JSON.stringify(data.item));
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const dirty = useMemo(
    () => !!settings && baseline !== "" && JSON.stringify(settings) !== baseline,
    [settings, baseline],
  );

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      const data = await adminFetch<AdminItemResponse<SiteSettingsAdmin>>(
        "/api/admin/settings",
        { method: "PATCH", body: JSON.stringify(settings) },
      );
      setSettings(data.item);
      setBaseline(JSON.stringify(data.item));
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="rounded-xl border border-admin-border bg-white px-6 py-16 text-center text-sm text-admin-muted">
        Loading settings…
      </div>
    );
  }

  function setMedia(key: "logoLight" | "logoDark" | "favicon", value: MediaRef | null) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <>
      <UnsavedGuard dirty={dirty} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={
                tab === t.id
                  ? "admin-btn-primary"
                  : "admin-btn-ghost border border-transparent"
              }
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          disabled={saving || !dirty}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>

      {dirty ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          You have unsaved changes.
        </p>
      ) : null}

      <div className="admin-card p-5">
        {tab === "business" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["businessName", "Business name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["instagram", "Instagram handle"],
                ["instagramUrl", "Instagram URL"],
                ["facebookUrl", "Facebook URL"],
                ["address", "Address"],
                ["headline", "Headline"],
                ["currency", "Currency"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className={key === "address" || key === "headline" ? "md:col-span-2" : ""}>
                <label className="admin-label">{label}</label>
                <input
                  className="admin-input"
                  value={String(settings[key] ?? "")}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev ? { ...prev, [key]: e.target.value } : prev,
                    )
                  }
                />
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={settings.wholesaleInquiriesEnabled ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? { ...prev, wholesaleInquiriesEnabled: e.target.checked }
                      : prev,
                  )
                }
              />
              Wholesale inquiries enabled
            </label>
          </div>
        ) : null}

        {tab === "branding" ? (
          <div className="grid gap-6 md:grid-cols-3">
            <ImageField
              label="Logo light"
              value={settings.logoLight ?? null}
              onChange={(v) => setMedia("logoLight", v)}
            />
            <ImageField
              label="Logo dark"
              value={settings.logoDark ?? null}
              onChange={(v) => setMedia("logoDark", v)}
            />
            <ImageField
              label="Favicon"
              value={settings.favicon ?? null}
              onChange={(v) => setMedia("favicon", v)}
            />
            <div className="md:col-span-3">
              <label className="admin-label">Footer tagline</label>
              <input
                className="admin-input"
                value={settings.footer?.tagline ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          footer: { ...prev.footer, tagline: e.target.value },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div className="md:col-span-3">
              <label className="admin-label">Copyright</label>
              <input
                className="admin-input"
                value={settings.footer?.copyright ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          footer: { ...prev.footer, copyright: e.target.value },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "announcement" ? (
          <div className="grid gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.announcementBar?.enabled ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          announcementBar: {
                            ...prev.announcementBar,
                            enabled: e.target.checked,
                          },
                        }
                      : prev,
                  )
                }
              />
              Enable announcement bar
            </label>
            <div>
              <label className="admin-label">Text</label>
              <input
                className="admin-input"
                value={settings.announcementBar?.text ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          announcementBar: {
                            ...prev.announcementBar,
                            text: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Link</label>
              <input
                className="admin-input"
                value={settings.announcementBar?.link ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          announcementBar: {
                            ...prev.announcementBar,
                            link: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "intro" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.introWrapper?.enabled ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          introWrapper: {
                            ...prev.introWrapper,
                            enabled: e.target.checked,
                          },
                        }
                      : prev,
                  )
                }
              />
              Enable intro wrapper
            </label>
            <div>
              <label className="admin-label">Duration (ms)</label>
              <input
                type="number"
                className="admin-input"
                value={settings.introWrapper?.durationMs ?? 3500}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          introWrapper: {
                            ...prev.introWrapper,
                            durationMs: Number(e.target.value) || 0,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "nav" ? (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.navigation?.showBlog ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          navigation: {
                            ...prev.navigation,
                            showBlog: e.target.checked,
                          },
                        }
                      : prev,
                  )
                }
              />
              Show blog in navigation
            </label>
            <p className="text-xs text-admin-muted">
              Nav items are managed primarily via Pages (show in nav). This toggle
              controls blog visibility in the storefront header.
            </p>
          </div>
        ) : null}

        {tab === "shipping" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={settings.shipping?.localPickup?.enabled ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            localPickup: {
                              ...prev.shipping?.localPickup,
                              enabled: e.target.checked,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
              Local pickup enabled
            </label>
            <div>
              <label className="admin-label">Pickup label</label>
              <input
                className="admin-input"
                value={settings.shipping?.localPickup?.label ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            localPickup: {
                              ...prev.shipping?.localPickup,
                              label: e.target.value,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Pickup price</label>
              <input
                type="number"
                className="admin-input"
                value={settings.shipping?.localPickup?.price ?? 0}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            localPickup: {
                              ...prev.shipping?.localPickup,
                              price: Number(e.target.value) || 0,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Pickup instructions</label>
              <textarea
                className="admin-input min-h-[80px]"
                value={settings.shipping?.localPickup?.instructions ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            localPickup: {
                              ...prev.shipping?.localPickup,
                              instructions: e.target.value,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={settings.shipping?.flatRate?.enabled ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            flatRate: {
                              ...prev.shipping?.flatRate,
                              enabled: e.target.checked,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
              Flat-rate shipping enabled
            </label>
            <div>
              <label className="admin-label">Flat rate label</label>
              <input
                className="admin-input"
                value={settings.shipping?.flatRate?.label ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            flatRate: {
                              ...prev.shipping?.flatRate,
                              label: e.target.value,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Flat rate price</label>
              <input
                className="admin-input"
                value={
                  settings.shipping?.flatRate?.price == null
                    ? ""
                    : String(settings.shipping.flatRate.price)
                }
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            flatRate: {
                              ...prev.shipping?.flatRate,
                              price: e.target.value.trim()
                                ? Number(e.target.value)
                                : null,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Shipping note</label>
              <textarea
                className="admin-input min-h-[70px]"
                value={settings.shipping?.flatRate?.note ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            flatRate: {
                              ...prev.shipping?.flatRate,
                              note: e.target.value,
                            },
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Free shipping threshold</label>
              <input
                className="admin-input"
                value={
                  settings.shipping?.freeShippingThreshold == null
                    ? ""
                    : String(settings.shipping.freeShippingThreshold)
                }
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            freeShippingThreshold: e.target.value.trim()
                              ? Number(e.target.value)
                              : null,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.shipping?.internationalEnabled ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            internationalEnabled: e.target.checked,
                          },
                        }
                      : prev,
                  )
                }
              />
              International shipping
            </label>
            <div className="md:col-span-2">
              <label className="admin-label">Default production time</label>
              <input
                className="admin-input"
                value={settings.shipping?.defaultProductionTime ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            defaultProductionTime: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Estimated dispatch</label>
              <input
                className="admin-input"
                value={settings.shipping?.estimatedDispatch ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            estimatedDispatch: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "tax" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={settings.tax?.enabled ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          tax: { ...prev.tax, enabled: e.target.checked },
                        }
                      : prev,
                  )
                }
              />
              Tax enabled
            </label>
            <div>
              <label className="admin-label">Rate (e.g. 0.13)</label>
              <input
                type="number"
                step="0.01"
                className="admin-input"
                value={settings.tax?.rate ?? 0}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          tax: { ...prev.tax, rate: Number(e.target.value) || 0 },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Label</label>
              <input
                className="admin-input"
                value={settings.tax?.label ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          tax: { ...prev.tax, label: e.target.value },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={settings.tax?.includedInPrice ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          tax: {
                            ...prev.tax,
                            includedInPrice: e.target.checked,
                          },
                        }
                      : prev,
                  )
                }
              />
              Tax included in price
            </label>
          </div>
        ) : null}

        {tab === "emails" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Contact recipient email</label>
              <input
                className="admin-input"
                value={settings.contactRecipientEmail ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? { ...prev, contactRecipientEmail: e.target.value }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Order email sender</label>
              <input
                className="admin-input"
                value={settings.orderEmailSender ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, orderEmailSender: e.target.value } : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "seo" ? (
          <div className="grid gap-4">
            <div>
              <label className="admin-label">Default SEO title</label>
              <input
                className="admin-input"
                value={settings.defaultSeo?.title ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          defaultSeo: {
                            ...prev.defaultSeo,
                            title: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Default SEO description</label>
              <textarea
                className="admin-input min-h-[90px]"
                value={settings.defaultSeo?.description ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          defaultSeo: {
                            ...prev.defaultSeo,
                            description: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Default OG image URL</label>
              <input
                className="admin-input"
                value={settings.defaultSeo?.ogImage ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          defaultSeo: {
                            ...prev.defaultSeo,
                            ogImage: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "analytics" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Google Analytics ID</label>
              <input
                className="admin-input"
                value={settings.analytics?.googleAnalyticsId ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          analytics: {
                            ...prev.analytics,
                            googleAnalyticsId: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <label className="admin-label">Meta Pixel ID</label>
              <input
                className="admin-input"
                value={settings.analytics?.metaPixelId ?? ""}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          analytics: {
                            ...prev.analytics,
                            metaPixelId: e.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === "policies" ? (
          <div className="grid gap-4">
            {(
              [
                ["privacy", "Privacy"],
                ["terms", "Terms"],
                ["shippingReturns", "Shipping & returns"],
                ["customOrder", "Custom order"],
                ["draftNotice", "Draft notice"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="admin-label">{label}</label>
                <textarea
                  className="admin-input min-h-[100px]"
                  value={settings.policies?.[key] ?? ""}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev
                        ? {
                            ...prev,
                            policies: {
                              ...prev.policies,
                              [key]: e.target.value,
                            },
                          }
                        : prev,
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : null}

        {tab === "stripe" ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Stripe configuration status (read from settings; update via env +
              toggle if needed).
            </p>
            <div className="rounded-lg border border-admin-border bg-slate-50 px-4 py-3 text-sm">
              Status:{" "}
              <strong>
                {settings.stripeConfigured ? "Configured" : "Not configured"}
              </strong>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.stripeConfigured ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? { ...prev, stripeConfigured: e.target.checked }
                      : prev,
                  )
                }
              />
              Mark Stripe as configured
            </label>
          </div>
        ) : null}
      </div>
    </>
  );
}
