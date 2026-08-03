"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type { AdminListResponse, BlogPostAdmin } from "@/lib/admin/types";

export default function AdminBlogsPage() {
  const router = useRouter();
  const [items, setItems] = useState<BlogPostAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const qs = params.toString();
      const data = await adminFetch<AdminListResponse<BlogPostAdmin>>(
        `/api/admin/blogs${qs ? `?${qs}` : ""}`,
      );
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createPost() {
    setCreating(true);
    try {
      const data = await adminFetch<{ item: BlogPostAdmin }>("/api/admin/blogs", {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled draft",
          status: "draft",
          content: "",
          excerpt: "",
        }),
      });
      toast.success("Draft created");
      router.push(`/admin/blogs/${idOf(data.item)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/blogs/${deleteId}`, { method: "DELETE" });
      toast.success("Deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminHeader
        title="Blogs"
        description="Draft and publish blog posts"
        actions={
          <button
            type="button"
            className="admin-btn-primary"
            disabled={creating}
            onClick={() => void createPost()}
          >
            <Plus className="h-4 w-4" />
            New post
          </button>
        }
      />

      <div className="mb-4">
        <select
          className="admin-input max-w-[180px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <DataTable
          rows={items}
          rowKey={(row) => idOf(row)}
          emptyMessage="No blog posts yet."
          columns={[
            {
              key: "title",
              header: "Title",
              render: (row) => (
                <Link
                  href={`/admin/blogs/${row._id}`}
                  className="font-medium hover:underline"
                >
                  {row.title}
                </Link>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "updated",
              header: "Updated",
              render: (row) =>
                row.updatedAt
                  ? format(parseISO(row.updatedAt), "MMM d, yyyy")
                  : "—",
            },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <button
                  type="button"
                  className="admin-btn-ghost text-rose-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(row._id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete blog post?"
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
