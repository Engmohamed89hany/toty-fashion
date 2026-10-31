import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import ProductCard, { type IStoreProduct } from "./ProductCard";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/seo";

const API_URL = "http://localhost:4000/api";
const PAGE_SIZE = 12;

interface ICategory {
  id: number;
  title: string;
}

interface IListingResponse<T> {
  data?: T;
}

interface IProductListing {
  products?: IStoreProduct[];
  pagination?: {
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
  };
}

interface ICategoryListing {
  categories?: ICategory[];
}

export const metadata: Metadata = {
  title: "الكوليكشن",
  description:
    "تصفحي كوليكشن توتي فاشون من الأزياء النسائية والملابس المنزلية واللانجيري.",
  alternates: { canonical: "/products" },
  openGraph: createOpenGraphMetadata({
    title: "الكوليكشن | توتي فاشون",
    description: "اكتشفي قطع توتي فاشون المختارة بعناية.",
    url: "/products",
  }),
  twitter: createTwitterMetadata({
    title: "الكوليكشن | توتي فاشون",
    description: "اكتشفي قطع توتي فاشون المختارة بعناية.",
  }),
};

const getPageNumber = (value?: string | string[]) => {
  const parsedValue = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0 ? parsedValue : 1;
};

const getCategoryId = (value?: string | string[]) => {
  const categoryId = Array.isArray(value) ? value[0] : value;
  if (!categoryId || !/^\d+$/.test(categoryId)) {
    return "";
  }
  const parsedCategoryId = Number(categoryId);
  return Number.isSafeInteger(parsedCategoryId) && parsedCategoryId > 0
    ? String(parsedCategoryId)
    : "";
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    category_id?: string | string[];
    search?: string | string[];
  }>;
}) {
  await connection();
  const params = await searchParams;
  const requestedPage = getPageNumber(params.page);
  const categoryId = getCategoryId(params.category_id);
  const searchValue = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const search = searchValue?.trim().slice(0, 100) ?? "";
  const query = new URLSearchParams({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
  });
  if (search) {
    query.set("search", search);
  }
  if (categoryId) {
    query.set("category_id", categoryId);
  }

  let categories: ICategory[] = [];
  let products: IStoreProduct[] = [];
  let pagination: IProductListing["pagination"];
  let categoryError = false;
  let productsError = false;

  const [categoryResult, productResult] = await Promise.allSettled([
    fetch(`${API_URL}/categories?page=1&limit=100`, { cache: "no-store" }),
    fetch(`${API_URL}/products?${query}`, { cache: "no-store" }),
  ]);

  if (categoryResult.status === "fulfilled" && categoryResult.value.ok) {
    const response =
      (await categoryResult.value.json()) as IListingResponse<ICategoryListing>;
    categories = response.data?.categories ?? [];
  } else {
    categoryError = true;
    console.error(
      "Collection category request failed:",
      categoryResult.status === "rejected"
        ? categoryResult.reason
        : categoryResult.value.status,
    );
  }

  if (productResult.status === "fulfilled" && productResult.value.ok) {
    const response =
      (await productResult.value.json()) as IListingResponse<IProductListing>;
    products = response.data?.products ?? [];
    pagination = response.data?.pagination;
  } else {
    productsError = true;
    console.error(
      "Collection product request failed:",
      productResult.status === "rejected"
        ? productResult.reason
        : productResult.value.status,
    );
  }

  const currentPage = pagination?.page ?? requestedPage;
  const totalPages = pagination?.totalPages ?? 0;
  const makePageHref = (page: number) => {
    const pageQuery = new URLSearchParams({ page: String(page) });
    if (categoryId) {
      pageQuery.set("category_id", categoryId);
    }
    if (search) {
      pageQuery.set("search", search);
    }
    return `/products?${pageQuery}`;
  };
  const makeCategoryHref = (nextCategoryId?: number) => {
    const categoryQuery = new URLSearchParams();
    if (nextCategoryId) {
      categoryQuery.set("category_id", String(nextCategoryId));
    }
    if (search) {
      categoryQuery.set("search", search);
    }
    const queryString = categoryQuery.toString();
    return queryString ? `/products?${queryString}` : "/products";
  };

  return (
    <main className="pb-16">
      <header className="bg-neutral px-6 py-10 sm:px-10 sm:py-14">
        <p className="font-cairo text-sm font-semibold text-primary">
          توتي فاشون
        </p>
        <h1 className="mt-2 text-3xl text-secondry sm:text-4xl">الكوليكشن</h1>
        <p className="mt-3 max-w-2xl font-cairo leading-7 text-gray-600">
          اختاري من قطع صُممت لتجمع بين الأناقة والراحة وترافقك في كل يوم.
        </p>
      </header>

      <nav
        aria-label="تصفية حسب التصنيف"
        className="flex flex-wrap gap-2 border-b border-gray-200 py-6"
      >
        <Link
          href={makeCategoryHref()}
          aria-current={!categoryId ? "page" : undefined}
          className={`border px-4 py-2 font-cairo text-sm transition ${
            !categoryId
              ? "border-secondry bg-secondry text-white"
              : "border-gray-200 text-secondry hover:border-primary"
          }`}
        >
          كل القطع
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={makeCategoryHref(category.id)}
            aria-current={categoryId === String(category.id) ? "page" : undefined}
            className={`border px-4 py-2 font-cairo text-sm transition ${
              categoryId === String(category.id)
                ? "border-secondry bg-secondry text-white"
                : "border-gray-200 text-secondry hover:border-primary"
            }`}
          >
            {category.title}
          </Link>
        ))}
      </nav>

      {search && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 font-cairo text-sm text-gray-600">
          <p>نتائج البحث عن: <span className="font-semibold text-secondry">{search}</span></p>
          <Link
            href={makeCategoryHref(categoryId ? Number(categoryId) : undefined)}
            className="font-semibold text-primary transition hover:text-secondry"
          >
            مسح البحث
          </Link>
        </div>
      )}

      {categoryError && (
        <p role="status" className="mt-5 font-cairo text-sm text-gray-500">
          تعذر تحميل التصنيفات حاليًا.
        </p>
      )}

      {productsError ? (
        <p
          role="alert"
          className="mt-8 border border-dashed border-gray-300 px-5 py-10 text-center font-cairo text-gray-600"
        >
          تعذر تحميل المنتجات الآن. يرجى المحاولة لاحقًا.
        </p>
      ) : products.length > 0 ? (
        <>
          <p className="py-5 font-cairo text-sm text-gray-500">
            {pagination?.totalProducts ?? products.length} قطعة
          </p>
          <section
            aria-label="منتجات الكوليكشن"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
          {totalPages > 1 && (
            <nav
              aria-label="صفحات المنتجات"
              className="mt-10 flex items-center justify-center gap-5 font-cairo text-sm"
            >
              {currentPage > 1 ? (
                <Link
                  href={makePageHref(currentPage - 1)}
                  className="border border-gray-300 px-4 py-2 transition hover:border-primary"
                >
                  السابق
                </Link>
              ) : (
                <span className="border border-gray-200 px-4 py-2 text-gray-400">
                  السابق
                </span>
              )}
              <span aria-current="page">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={makePageHref(currentPage + 1)}
                  className="border border-gray-300 px-4 py-2 transition hover:border-primary"
                >
                  التالي
                </Link>
              ) : (
                <span className="border border-gray-200 px-4 py-2 text-gray-400">
                  التالي
                </span>
              )}
            </nav>
          )}
        </>
      ) : (
        <p className="mt-8 border border-dashed border-gray-300 px-5 py-10 text-center font-cairo text-gray-600">
          لا توجد منتجات في هذا التصنيف حاليًا.
        </p>
      )}
    </main>
  );
}
