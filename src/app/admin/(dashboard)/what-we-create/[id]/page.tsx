"use client";

import { useParams } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function WhatWeCreateEditPage() {
  const params = useParams<{ id: string }>();
  return (
    <>
      <AdminHeader
        title="Edit creation category"
        description="Hero, process, FAQs, care, and SEO for this What We Create category"
      />
      <CategoryForm categoryId={params.id} backHref="/admin/what-we-create" />
    </>
  );
}
