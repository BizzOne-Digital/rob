"use client";

import { useParams } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  return (
    <>
      <AdminHeader
        title="Edit product"
        description="Update images, variants, inventory, personalization, and SEO"
      />
      <ProductForm productId={params.id} />
    </>
  );
}
