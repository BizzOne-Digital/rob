export class AdminApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.details = details;
  }
}

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers,
  });

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = { error: text };
    }
  }

  if (!res.ok) {
    const errObj =
      payload && typeof payload === "object"
        ? (payload as { error?: string; details?: unknown })
        : {};
    throw new AdminApiError(
      errObj.error || `Request failed (${res.status})`,
      res.status,
      errObj.details,
    );
  }

  return payload as T;
}

export function toJsonBody(data: JsonValue): string {
  return JSON.stringify(data);
}

export function idOf(value: { _id?: unknown } | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id ?? "");
}
