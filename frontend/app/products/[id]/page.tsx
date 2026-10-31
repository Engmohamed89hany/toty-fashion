import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaStar } from "react-icons/fa";
import ProductCard, { type IStoreProduct } from "../ProductCard";
import ReviewSection, { type IProductReview } from "./ReviewSection";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/seo";

const API_URL = "http://localhost:4000/api";
const API_ORIGIN = "http://localhost:4000";

interface IApiResponse<T> {
  data?: T;
  message?: string;
}

interface IProductDetails extends IStoreProduct {
  size: string;
}

interface IProductListing {
  products?: IStoreProduct[];
}

interface IReviewListing {
  reviews?: IProductReview[];
  summary?: {
    totalReviews: number;
    averageRating: number;
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { title: "تفاصيل المنتج" };
    }

    const payload =
      (await response.json()) as IApiResponse<{ product?: IProductDetails }>;
    const product = payload.data?.product;
    if (!product) {
      return { title: "تفاصيل المنتج" };
    }

    const description = product.description.slice(0, 160);
    return {
      title: product.name,
      description,
      alternates: { canonical: `/products/${product.id}` },
      openGraph: {
        ...createOpenGraphMetadata({
          title: `${product.name} | توتي فاشون`,
          description,
          url: `/products/${product.id}`,
        }),
        ...(product.images?.[0]?.imageurl
          ? {
              images: [
                {
                  url: getImageUrl(product.images[0].imageurl),
                  alt: product.name,
                },
              ],
            }
          : {}),
      },
      twitter: createTwitterMetadata({
        title: `${product.name} | توتي فاشون`,
        description,
      }),
    };
  } catch (error) {
    console.error("Product metadata request failed:", error);
    return { title: "تفاصيل المنتج" };
  }
}

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) {
    return "/assests/hero.jpg";
  }
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }
  return `${API_ORIGIN}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const formatPrice = (price: number) =>
  `${price.toLocaleString("ar-EG")} ج.م`;

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  let product: IProductDetails | undefined;
  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (response.status === 404) {
      product = undefined;
    } else {
      if (!response.ok) {
        throw new Error(`Products API returned HTTP ${response.status}`);
      }
      const payload =
        (await response.json()) as IApiResponse<{ product?: IProductDetails }>;
      product = payload.data?.product;
    }
  } catch (error) {
    console.error("Product detail request failed:", error);
    return (
      <main className="py-16">
        <p role="alert" className="text-center font-cairo text-gray-600">
          تعذر تحميل المنتج الآن. يرجى المحاولة لاحقًا.
        </p>
      </main>
    );
  }

  if (!product) {
    notFound();
  }

  const [reviewsResult, relatedProductsResult] = await Promise.allSettled([
    fetch(`${API_URL}/products/${product.id}/reviews?page=1&limit=20`, {
      cache: "no-store",
    }),
    fetch(
      `${API_URL}/products?page=1&limit=5&category_id=${product.category_id}`,
      { cache: "no-store" },
    ),
  ]);

  let reviews: IProductReview[] = [];
  let averageRating = 0;
  let totalReviews = 0;
  let reviewsUnavailable = false;
  let relatedProducts: IStoreProduct[] = [];

  if (
    reviewsResult.status === "fulfilled" &&
    reviewsResult.value.ok
  ) {
    const payload =
      (await reviewsResult.value.json()) as IApiResponse<IReviewListing>;
    reviews = payload.data?.reviews ?? [];
    averageRating = payload.data?.summary?.averageRating ?? 0;
    totalReviews = payload.data?.summary?.totalReviews ?? 0;
  } else {
    reviewsUnavailable = true;
    console.error(
      "Product reviews request failed:",
      reviewsResult.status === "rejected"
        ? reviewsResult.reason
        : reviewsResult.value.status,
    );
  }

  if (
    relatedProductsResult.status === "fulfilled" &&
    relatedProductsResult.value.ok
  ) {
    const payload =
      (await relatedProductsResult.value.json()) as IApiResponse<IProductListing>;
    relatedProducts = (payload.data?.products ?? [])
      .filter((relatedProduct) => relatedProduct.id !== product.id)
      .slice(0, 4);
  } else {
    console.error(
      "Related products request failed:",
      relatedProductsResult.status === "rejected"
        ? relatedProductsResult.reason
        : relatedProductsResult.value.status,
    );
  }

  const price = Number(product.price);
  const discount = Number(product.discount);
  const discountedPrice =
    discount > 0 ? price * (1 - discount / 100) : price;
  const images =
    product.images.length > 0 ? product.images : [{ id: 0, imageurl: "" }];

  return (
    <main className="pb-16">
      <nav aria-label="مسار التنقل" className="py-5 font-cairo text-sm">
        <Link href="/" className="text-gray-500 transition hover:text-primary">
          الرئيسية
        </Link>
        <span aria-hidden="true" className="mx-2 text-gray-400">
          /
        </span>
        <Link
          href="/products"
          className="text-gray-500 transition hover:text-primary"
        >
          الكوليكشن
        </Link>
        <span aria-hidden="true" className="mx-2 text-gray-400">
          /
        </span>
        <span aria-current="page" className="text-secondry">
          {product.name}
        </span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className={`relative aspect-[4/5] overflow-hidden bg-gray-100 ${
                index === 0 && images.length > 1 ? "sm:row-span-2" : ""
              }`}
            >
              <Image
                src={getImageUrl(image.imageurl)}
                alt={`${product.name} - صورة ${index + 1}`}
                fill
                priority={index === 0}
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-28 lg:h-fit lg:py-6">
          <p className="font-cairo text-sm font-semibold text-primary">
            {product.title}
          </p>
          <h1 className="mt-2 text-3xl leading-relaxed text-secondry sm:text-4xl">
            {product.name}
          </h1>
          <a
            href="#reviews-title"
            className="mt-4 inline-flex items-center gap-2 font-cairo text-sm text-gray-600 hover:text-primary"
          >
            <FaStar aria-hidden="true" className="text-primary" />
            {totalReviews > 0 ? averageRating.toFixed(1) : "لا توجد تقييمات بعد"}
            {totalReviews > 0 && ` (${totalReviews})`}
          </a>
          <div className="mt-5 flex items-center gap-3 font-cairo">
            <span className="text-xl font-semibold text-secondry">
              {formatPrice(discountedPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-gray-400 line-through">
                  {formatPrice(price)}
                </span>
                <span className="bg-primary px-2 py-1 text-xs font-bold text-white">
                  خصم {discount}%
                </span>
              </>
            )}
          </div>
          <p className="mt-6 whitespace-pre-line font-cairo text-base leading-8 text-gray-600">
            {product.description}
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-4 border-y border-gray-200 py-5 font-cairo text-sm">
            <div>
              <dt className="text-gray-500">المقاسات</dt>
              <dd className="mt-1 font-semibold text-secondry">
                {product.size || "تواصلي معنا لمعرفة المقاسات"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">التوفر</dt>
              <dd
                className={`mt-1 font-semibold ${
                  product.stock > 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {product.stock > 0 ? "متوفر" : "غير متوفر حاليًا"}
              </dd>
            </div>
          </dl>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-3 bg-secondry px-6 py-3.5 font-cairo text-sm font-semibold text-white transition hover:bg-primary"
          >
            استفسري عن المنتج
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      {reviewsUnavailable && (
        <p role="status" className="mt-8 font-cairo text-sm text-gray-500">
          تعذر تحميل التقييمات حاليًا.
        </p>
      )}
      <ReviewSection
        productId={product.id}
        initialReviews={reviews}
        initialAverageRating={averageRating}
        initialTotalReviews={totalReviews}
      />

      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-products-title" className="pt-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-cairo text-sm font-semibold text-primary">
                اختيارات قريبة من ذوقك
              </p>
              <h2
                id="related-products-title"
                className="mt-2 text-2xl text-secondry sm:text-3xl"
              >
                منتجات من نفس التصنيف
              </h2>
            </div>
            <Link
              href={`/products?category_id=${product.category_id}`}
              className="font-cairo text-sm font-semibold text-secondry transition hover:text-primary"
            >
              عرض كل التصنيف
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
