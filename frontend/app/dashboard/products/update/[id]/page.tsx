import type { Metadata } from "next";
import ProductForm from "../../components/ProductForm";

export const metadata: Metadata = {
  title: "تعديل منتج | لوحة التحكم",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UpdateProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductForm mode="edit" productId={id} />;
}
