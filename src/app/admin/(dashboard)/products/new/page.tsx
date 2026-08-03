import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <AdminHeader
        title="New product"
        description="Create a catalog product with pricing, variants, and SEO"
      />
      <ProductForm />
    </>
  );
}
