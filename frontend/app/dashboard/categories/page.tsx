import React from "react";
import { cookies } from "next/headers";
import { FaRegPenToSquare } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { MdAdd, MdCategory } from "react-icons/md";

import DeleteRow from "../components/DeleteRow";
import api from "@/lib/api";
import { ImSearch } from "react-icons/im";

export const metadata = {
  title: "لوحة التحكم | التصنيفات",
  description: "إدارة التصنيفات في لوحة التحكم.",
};

interface ICategory {
  id: number;
  title: string;
  decription?: string;
  description?: string;
  image: string | null;
  created_At: string;
  updated_At: string;
}

interface ICategoriesResponse {
  data: {
    categories: ICategory[];
    pagination: {
      page: number;
      limit: number;
      totalCategories: number;
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
  limit: 5,
  totalCategories: 0,
  totalPages: 0,
};

const getCategoryImageUrl = (image?: string | null) => {
  if (!image) {
    return "/assests/hero.jpg";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `http://localhost:4000/images/${image}`;
};

const formatDate = (date?: string) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleDateString("ar-EG");
};

const CategoriesPage = async ({
  searchParams,
}: IProps): Promise<React.JSX.Element> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const searchParam = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const parsedPage = Number(pageParam);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = searchParam?.trim() ?? "";

  let categories: ICategory[] = [];
  let pagination = DEFAULT_PAGINATION;
  let loadError = "";

  if (!token) {
    loadError = "انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.";
  } else {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(DEFAULT_PAGINATION.limit),
      });
      if (search) {
        query.set("search", search);
      }

      const response = await api.get<ICategoriesResponse>(
        `/categories?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      categories = response.data.data.categories ?? [];
      pagination = response.data.data.pagination ?? DEFAULT_PAGINATION;
    } catch (error) {
      console.error("Categories dashboard error:", error);
      loadError = "تعذر تحميل التصنيفات. يرجى تحديث الصفحة والمحاولة مرة أخرى.";
    }
  }

  return (
    <div className="w-full min-w-0">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-cairo text-sm font-semibold text-primary">
            إدارة المتجر
          </p>
          <h1 className="text-2xl text-primary sm:text-[30px]">
            إدارة التصنيفات
          </h1>
          <p className="my-2 w-full max-w-4xl font-cairo text-base leading-7 sm:text-[17px]">
            تابعي تصنيفات المتجر وصورها، وحدّثي تفاصيلها من مكان واحد.
          </p>
        </div>

        <Link
          href="/dashboard/categories/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[5px] bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry"
        >
          <MdAdd aria-hidden="true" className="text-xl" />
          إضافة تصنيف
        </Link>
      </header>

      <form
        action="/dashboard/categories"
        method="get"
        role="search"
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
      >
        <label htmlFor="category-search" className="sr-only">
          البحث عن تصنيف بالاسم
        </label>
        <input
          id="category-search"
          type="search"
          name="search"
          defaultValue={search}
          placeholder="ابحثي عن تصنيف بالاسم..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-right font-cairo outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex items-center gap-x-2  rounded-[5px] cursor-pointer bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry w-full md:w-auto"
          >
            <ImSearch />
            بحث
            
          </button>
          {search && (
            <Link
              href="/dashboard/categories"
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
      ) : categories.length > 0 ? (
        <>
          <p className="mb-4 font-cairo text-sm text-gray-600">
            {search
              ? `نتائج البحث عن "${search}": ${pagination.totalCategories}`
              : `إجمالي التصنيفات: ${pagination.totalCategories}`}
          </p>

          <section
            aria-label="بطاقات التصنيفات"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {categories.map((category) => (
              <article
                key={category.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <Image
                    src={getCategoryImageUrl(category.image)}
                    alt={category.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 font-cairo text-xs font-semibold text-secondry shadow-sm">
                    <MdCategory aria-hidden="true" />
                    تصنيف #{category.id}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-secondry">
                    {category.title}
                  </h2>
                  <p className="mt-2 min-h-12 whitespace-pre-wrap break-words font-cairo leading-6 text-gray-600">
                    {category.description ??
                      category.decription ??
                      "لا يوجد وصف لهذا التصنيف."}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 font-cairo text-xs text-gray-500">
                    <div>
                      <dt>تاريخ الإنشاء</dt>
                      <dd className="mt-1 font-semibold text-secondry">
                        {formatDate(category.created_At)}
                      </dd>
                    </div>
                    <div>
                      <dt>آخر تحديث</dt>
                      <dd className="mt-1 font-semibold text-secondry">
                        {formatDate(category.updated_At)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <Link
                      href={`/dashboard/categories/update/${category.id}`}
                      aria-label={`تعديل ${category.title}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 font-cairo text-sm text-secondry transition hover:border-primary hover:bg-primary hover:text-white"
                    >
                      <FaRegPenToSquare aria-hidden="true" />
                      تعديل التصنيف
                    </Link>
                    <DeleteRow
                      endpoint={`categories/${category.id}`}
                      token={token ?? ""}
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
          <MdCategory
            aria-hidden="true"
            className="mx-auto text-4xl text-primary"
          />
          <p className="mt-3 font-cairo text-gray-600">
            {search
              ? `لم يتم العثور على تصنيفات تطابق "${search}".`
              : "لا توجد تصنيفات لعرضها حتى الآن."}
          </p>
          {search ? (
            <Link
              href="/dashboard/categories"
              className="mt-4 inline-flex rounded-lg border border-primary px-4 py-2 font-cairo text-primary transition hover:bg-primary hover:text-white"
            >
              مسح البحث
            </Link>
          ) : (
            <Link
              href="/dashboard/categories/new"
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 font-cairo text-white transition hover:bg-secondry"
            >
              أضيفي أول تصنيف
            </Link>
          )}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <nav
          aria-label="صفحات التصنيفات"
          className="my-5 flex max-w-full items-center justify-start gap-3 overflow-x-auto py-1 sm:justify-center"
        >
          {Array.from(
            { length: pagination.totalPages },
            (_, index) => index + 1,
          ).map((pageNumber) => (
            <Link
              key={pageNumber}
              scroll={false}
              href={`/dashboard/categories?${new URLSearchParams({
                ...(search ? { search } : {}),
                page: String(pageNumber),
              }).toString()}`}
              aria-current={pageNumber === pagination.page ? "page" : undefined}
              className={`rounded-md px-3 py-1 transition-all ${
                pageNumber === pagination.page
                  ? "bg-primary text-white"
                  : "bg-white text-secondry hover:bg-gray-100"
              }`}
            >
              {pageNumber}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
};

export default CategoriesPage;
