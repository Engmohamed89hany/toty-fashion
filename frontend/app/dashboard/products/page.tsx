import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { FaRegPenToSquare } from "react-icons/fa6";
import { MdAdd, MdInventory2 } from "react-icons/md";
import DeleteRow from "../components/DeleteRow";
import api from "@/lib/api";
import { ImSearch } from "react-icons/im";

export const metadata = {
  title: "لوحة التحكم | المنتجات",
  description: "إدارة منتجات المتجر والمخزون.",
};

interface IProductImage {
  id: number;
  imageurl: string;
}

interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number | string;
  discount: number | string;
  stock: number;
  size: string;
  category_id: number;
  title: string;
  images: IProductImage[];
}

interface IProductsResponse {
  data: {
    products: IProduct[];
    pagination: {
      page: number;
      limit: number;
      totalProducts: number;
      totalPages: number;
    };
  };
}

interface IProps {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
  }>;
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  totalProducts: 0,
  totalPages: 0,
};

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) {
    return "/assests/hero.jpg";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `http://localhost:4000${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const formatPrice = (price: number | string) =>
  `${Number(price).toLocaleString("ar-EG")} ج.م`;

const ProductsPage = async ({
  searchParams,
}: IProps): Promise<React.JSX.Element> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const searchParam = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const parsedPage = Number(pageParam);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = searchParam?.trim() ?? "";

  let products: IProduct[] = [];
  let pagination = DEFAULT_PAGINATION;
  let loadError = "";

  try {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(DEFAULT_PAGINATION.limit),
    });
    if (search) {
      query.set("search", search);
    }

    const response = await api.get<IProductsResponse>(`/products?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    products = response.data.data.products ?? [];
    pagination = response.data.data.pagination ?? DEFAULT_PAGINATION;
  } catch (error) {
    console.error("Products dashboard error:", error);
    loadError = "تعذر تحميل المنتجات. يرجى تحديث الصفحة والمحاولة مرة أخرى.";
  }

  return (
    <div className="w-full min-w-0">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-cairo text-sm font-semibold text-primary">
            إدارة المتجر
          </p>
          <h1 className="text-2xl text-primary sm:text-[30px]">
            المنتجات والمخزون
          </h1>
          <p className="my-2 max-w-4xl font-cairo text-base leading-7 sm:text-[17px]">
            تابعي المنتجات والأسعار والمخزون والصور من لوحة التحكم.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry"
        >
          <MdAdd aria-hidden="true" className="text-xl" />
          إضافة منتج
        </Link>
      </header>

      <form
        action="/dashboard/products"
        method="get"
        role="search"
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
      >
        <label htmlFor="product-search" className="sr-only">
          البحث عن منتج بالاسم
        </label>
        <input
          id="product-search"
          name="search"
          type="search"
          defaultValue={search}
          placeholder="ابحثي عن منتج بالاسم..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-right font-cairo outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry"
          >
            <ImSearch aria-hidden="true" />
            بحث
          </button>
          {search && (
            <Link
              href="/dashboard/products"
              className="inline-flex items-center rounded-xl border border-gray-200 px-5 py-3 font-cairo text-secondry transition hover:bg-gray-50"
            >
              مسح
            </Link>
          )}
        </div>
      </form>

      {loadError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 font-cairo text-red-700"
        >
          {loadError}
        </p>
      ) : products.length > 0 ? (
        <>
          <p className="mb-4 font-cairo text-sm text-gray-600">
            {search
              ? `نتائج البحث عن "${search}": ${pagination.totalProducts}`
              : `إجمالي المنتجات: ${pagination.totalProducts}`}
          </p>
          <section
            aria-label="قائمة المنتجات"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 bg-gray-100">
                  <Image
                    src={getImageUrl(product.images[0]?.imageurl)}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 font-cairo text-xs font-semibold text-secondry shadow-sm">
                    التصنيف #{product.category_id}
                  </span>
                  {Number(product.discount) > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-cairo text-xs font-bold text-white">
                      خصم {Number(product.discount)}%
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-secondry">
                    {product.name}
                  </h2>
                  <p className="mt-2 min-h-12 break-words font-cairo leading-6 text-gray-600">
                    {product.description}
                  </p>
                  <p className="mt-2 min-h-12 break-words font-cairo leading-6 text-gray-600">
                    التصنيف: {product.title}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 font-cairo text-sm">
                    <div>
                      <dt className="text-gray-500">السعر</dt>
                      <dd className="mt-1 font-semibold text-secondry">
                        {formatPrice(product.price)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">المخزون</dt>
                      <dd className="mt-1 flex items-center gap-1 font-semibold text-secondry">
                        <MdInventory2 aria-hidden="true" />
                        {product.stock}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">المقاس</dt>
                      <dd className="mt-1 font-semibold text-secondry">
                        {product.size}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">الصور</dt>
                      <dd className="mt-1 font-semibold text-secondry">
                        {product.images.length}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <Link
                      href={`/dashboard/products/update/${product.id}`}
                      aria-label={`تعديل ${product.name}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 font-cairo text-sm text-secondry transition hover:border-primary hover:bg-primary hover:text-white"
                    >
                      <FaRegPenToSquare aria-hidden="true" />
                      تعديل المنتج
                    </Link>
                    <DeleteRow
                      endpoint={`products/${product.id}`}
                      token={token}
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
          <MdInventory2
            aria-hidden="true"
            className="mx-auto text-4xl text-primary"
          />
          <p className="mt-3 font-cairo text-gray-600">
            {search
              ? `لم يتم العثور على منتجات تطابق "${search}".`
              : "لا توجد منتجات لعرضها حتى الآن."}
          </p>
          <Link
            href={search ? "/dashboard/products" : "/dashboard/products/new"}
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 font-cairo text-white transition hover:bg-secondry"
          >
            {search ? "مسح البحث" : "أضيفي أول منتج"}
          </Link>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <nav
          aria-label="صفحات المنتجات"
          className="my-5 flex max-w-full items-center justify-start gap-3 overflow-x-auto py-1 sm:justify-center"
        >
          {Array.from(
            { length: pagination.totalPages },
            (_, index) => index + 1,
          ).map((pageNumber) => {
            const query = new URLSearchParams();
            if (search) {
              query.set("search", search);
            }
            query.set("page", String(pageNumber));

            return (
              <Link
                key={pageNumber}
                scroll={false}
                href={`/dashboard/products?${query.toString()}`}
                aria-current={
                  pageNumber === pagination.page ? "page" : undefined
                }
                className={`rounded-md px-3 py-1 transition-all ${
                  pageNumber === pagination.page
                    ? "bg-primary text-white"
                    : "bg-white text-secondry hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default ProductsPage;
