import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import ReviewsTable, { type IAdminReview } from "./ReviewsTable";

export const metadata = {
  title: "إدارة التقييمات | لوحة التحكم",
  description: "مراجعة وإدارة تقييمات المنتجات.",
};

interface IReviewsResponse {
  data: {
    reviews: IAdminReview[];
    pagination: {
      page: number;
      limit: number;
      totalReviews: number;
      totalPages: number;
    };
  };
}

const PAGE_SIZE = 20;

export default async function ReviewsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsedPage = Number(pageParam);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let reviews: IAdminReview[] = [];
  let totalReviews = 0;
  let totalPages = 0;
  let errorMessage = "";

  if (!token) {
    errorMessage = "انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.";
  } else {
    try {
      const response = await api.get<IReviewsResponse>(
        `/reviews?page=${page}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      reviews = response.data.data.reviews ?? [];
      totalReviews = response.data.data.pagination.totalReviews;
      totalPages = response.data.data.pagination.totalPages;
    } catch (error) {
      console.error("Reviews dashboard request failed:", error);
      errorMessage = "تعذر تحميل التقييمات. يرجى تحديث الصفحة والمحاولة مرة أخرى.";
    }
  }

  return (
    <div className="w-full min-w-0">
      <header className="mb-6">
        <p className="mb-2 font-cairo text-sm font-semibold text-primary">
          إدارة المتجر
        </p>
        <h1 className="text-2xl text-primary sm:text-[30px]">
          إدارة تقييمات المنتجات
        </h1>
        <p className="mt-2 max-w-4xl font-cairo text-base leading-7 text-gray-600">
          راجعي آراء العميلات وعدّلي التقييمات أو احذفي المحتوى غير المناسب.
        </p>
      </header>

      <section
        aria-label="ملخص التقييمات"
        className="mb-6 flex items-center gap-4 bg-secondry p-5 text-white"
      >
        <Image
          src="/assests/hero.jpg"
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="font-cairo text-sm text-white/75">إجمالي التقييمات</p>
          <p className="mt-1 text-2xl font-semibold">{totalReviews}</p>
        </div>
      </section>

      {errorMessage ? (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 p-5 font-cairo text-red-700"
        >
          {errorMessage}
        </p>
      ) : (
        <ReviewsTable reviews={reviews} />
      )}

      {totalPages > 1 && (
        <nav
          aria-label="صفحات التقييمات"
          className="my-6 flex flex-wrap items-center justify-center gap-2 font-cairo"
        >
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Link
                key={pageNumber}
                href={`/dashboard/reviews?page=${pageNumber}`}
                aria-current={pageNumber === page ? "page" : undefined}
                className={`min-w-10 px-3 py-2 text-center ${
                  pageNumber === page
                    ? "bg-primary text-white"
                    : "border border-gray-200 bg-white text-secondry hover:border-primary"
                }`}
              >
                {pageNumber}
              </Link>
            ),
          )}
        </nav>
      )}
    </div>
  );
}
