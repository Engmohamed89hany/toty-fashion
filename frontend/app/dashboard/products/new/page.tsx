import type { Metadata } from "next";
import ProductForm from "../components/ProductForm";

export const metadata: Metadata = {
  title: "إضافة منتج | لوحة التحكم",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}
