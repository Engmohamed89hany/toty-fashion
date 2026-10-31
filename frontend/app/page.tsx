import HeroImage from "@/public/assests/hero.jpg";
import RegisterImage from "@/public/assests/register.jpg";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import type { Metadata } from "next";
import FashionMarquee from "@/app/components/FashionMarquee";
import {
  FaLongArrowAltLeft,
  FaRegGem,
  FaShippingFast,
} from "react-icons/fa";
import {
  MdOutlineSupportAgent,
  MdOutlineVerified,
} from "react-icons/md";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/seo";

const API_URL = "http://localhost:4000/api";
const API_ORIGIN = "http://localhost:4000";

export const metadata: Metadata = {
  title: "أزياء نسائية راقية",
  description:
    "تسوقي أزياء توتي فاشون النسائية والملابس المنزلية واللانجيري بخامات مختارة بعناية من الحرير والقطن المصري.",
  alternates: {
    canonical: "/",
  },
  openGraph: createOpenGraphMetadata({
    title: "توتي فاشون | أزياء نسائية راقية",
    description:
      "اكتشفي تشكيلات الكاجوال العصري والملابس المنزلية واللانجيري الراقية من توتي فاشون.",
    url: "/",
  }),
  twitter: createTwitterMetadata({
    title: "توتي فاشون | أزياء نسائية راقية",
    description:
      "اكتشفي تشكيلات الكاجوال العصري والملابس المنزلية واللانجيري الراقية من توتي فاشون.",
  }),
};

interface ICategory {
  id: number;
  title: string;
  decription?: string | null;
  description?: string | null;
  image?: string | null;
}

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
  title: string;
  images: IProductImage[];
}

interface IApiData<T> {
  data?: T;
}

interface ICategoryListing {
  categories?: ICategory[];
}

interface IProductListing {
  products?: IProduct[];
}

const getListing = async <T,>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Store API returned HTTP ${response.status}`);
    }

    const result = (await response.json()) as IApiData<T>;
    if (!result.data) {
      throw new Error("Store API returned an invalid response");
    }
    return result.data;
  } catch (error) {
    console.error(`Home page data request failed (${endpoint}):`, error);
    return null;
  }
};

const getImageUrl = (image?: string | null) => {
  if (!image) {
    return "/assests/hero.jpg";
  }
  if (/^https?:\/\//i.test(image)) {
    return image;
  }
  if (image.startsWith("/")) {
    return `${API_ORIGIN}${image}`;
  }
  return `${API_ORIGIN}/images/${image}`;
};

const formatPrice = (price: number) =>
  `${price.toLocaleString("ar-EG")} ج.م`;

const features = [
  {
    title: "خامات مختارة بعناية",
    description: "قطن مصري وحرير بملمس ناعم يدوم.",
    icon: FaRegGem,
  },
  {
    title: "شحن مجاني",
    description: "على الطلبات التي تتجاوز 3000 جنيه.",
    icon: FaShippingFast,
  },
  {
    title: "تجربة تسوق موثوقة",
    description: "نهتم بجودة كل تفصيلة في طلبك.",
    icon: MdOutlineVerified,
  },
];

export default async function HomePage() {
  await connection();
  const [categoryData, productData] = await Promise.all([
    getListing<ICategoryListing>("/categories?page=1&limit=4"),
    getListing<IProductListing>("/products?page=1&limit=4"),
  ]);
  const categories = categoryData?.categories ?? [];
  const products = productData?.products ?? [];
  const productImages = products.flatMap((product) =>
    product.images
      .filter((image) => Boolean(image.imageurl))
      .map((image) => ({
        id: image.id,
        name: product.name,
        imageUrl: getImageUrl(image.imageurl),
      })),
  );

  return (
    <main className="overflow-hidden pb-12">
      <div className="mb-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-secondry px-4 py-3 text-center font-cairo text-sm text-white">
        <span>أناقتك تستحق الأفضل</span>
        <span aria-hidden="true" className="text-primary">
          •
        </span>
        <span>شحن مجاني للطلبات فوق 3000 جنيه</span>
      </div>

      <section
        aria-labelledby="home-title"
        className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12"
      >
        <div className="order-2 py-4 lg:order-1 lg:py-12">
          <p className="mb-5 flex items-center gap-3 font-cairo text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
            <span aria-hidden="true" className="h-px w-10 bg-primary" />
            Haute couture &amp; loungewear
          </p>
          <h1
            id="home-title"
            className="max-w-2xl text-3xl leading-[1.55] text-secondry sm:text-4xl lg:text-5xl lg:leading-[1.6]"
          >
            أناقتك تبدأ من تفاصيل تلامس{" "}
            <span className="text-primary">روحك</span>
          </h1>
          <p className="mt-5 max-w-xl font-cairo text-base leading-8 text-gray-600 sm:text-lg">
            اكتشفي قطعًا تجمع بين الراحة والأناقة، بتصاميم عصرية وخامات اختيرت
            بعناية لترافقك في كل لحظة.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#featured"
              className="inline-flex items-center gap-3 bg-secondry px-6 py-3.5 font-cairo text-sm font-semibold text-white transition hover:bg-primary sm:text-base"
            >
              اكتشفي الكوليكشن
              <FaLongArrowAltLeft aria-hidden="true" className="text-lg" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center border border-primary px-6 py-3.5 font-cairo text-sm font-semibold text-secondry transition hover:bg-primary hover:text-white sm:text-base"
            >
              اكتشفي عالم توتي
            </Link>
          </div>
          <div className="mt-9 grid max-w-lg grid-cols-2 gap-4 border-t border-gray-200 pt-6 font-cairo">
            <div>
              <p className="text-lg font-bold text-secondry">تصاميم أنيقة</p>
              <p className="mt-1 text-sm text-gray-500">لكل يوم ومناسبة</p>
            </div>
            <div>
              <p className="text-lg font-bold text-secondry">راحة تدوم</p>
              <p className="mt-1 text-sm text-gray-500">خامات ناعمة ومميزة</p>
            </div>
          </div>
        </div>

        <div className="relative order-1 min-h-[360px] overflow-hidden bg-gray-100 sm:min-h-[480px] lg:order-2 lg:min-h-[620px]">
          <Image
            src={HeroImage}
            alt="تشكيلة أنيقة من توتي فاشون"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
          <p className="absolute bottom-6 right-6 max-w-xs font-cairo text-sm leading-7 text-white sm:bottom-9 sm:right-9 sm:text-base">
            اختاري إطلالتك القادمة من قطع صُممت لتشبهك.
          </p>
          <span className="absolute left-5 top-5 border border-white/70 bg-black/20 px-4 py-2 font-cairo text-xs text-white backdrop-blur-sm">
            أناقة تبدأ من هنا
          </span>
        </div>
      </section>

      <section
        aria-label="مميزات توتي فاشون"
        className="my-14 grid gap-4 border-y border-gray-200 py-7 sm:grid-cols-3 sm:gap-6 lg:my-20"
      >
        {features.map(({ title, description, icon: Icon }) => (
          <article key={title} className="flex items-center gap-4 px-2 sm:px-4">
            <Icon
              aria-hidden="true"
              className="shrink-0 text-3xl text-primary"
            />
            <div>
              <h2 className="font-alex text-base text-secondry">{title}</h2>
              <p className="mt-1 font-cairo text-sm leading-6 text-gray-500">
                {description}
              </p>
            </div>
          </article>
        ))}
      </section>

      <FashionMarquee images={productImages} />

      <section aria-labelledby="categories-title" className="mb-16 lg:mb-24">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-cairo text-sm font-semibold text-primary">
              اختاري ما يناسبك
            </p>
            <h2
              id="categories-title"
              className="text-2xl text-secondry sm:text-3xl"
            >
              تسوّقي حسب التصنيف
            </h2>
          </div>
          <Link
            href="#featured"
            className="inline-flex items-center gap-2 font-cairo text-sm font-semibold text-secondry transition hover:text-primary"
          >
            اكتشفي التشكيلة
            <FaLongArrowAltLeft aria-hidden="true" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <article
                key={category.id}
                className="group relative min-h-[280px] overflow-hidden bg-gray-100 sm:min-h-[340px]"
              >
                <Image
                  src={
                    category.image
                      ? getImageUrl(category.image)
                      : index % 2 === 0
                        ? HeroImage
                        : RegisterImage
                  }
                  alt={category.title}
                  fill
                  unoptimized={Boolean(category.image)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-xl">{category.title}</h3>
                  <p className="mt-2 line-clamp-2 font-cairo text-sm leading-6 text-white/85">
                    {category.description ??
                      category.decription ??
                      "اكتشفي قطعًا مميزة اختيرت بعناية."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            role={categoryData ? undefined : "status"}
            className="border border-dashed border-gray-300 bg-white px-5 py-10 text-center font-cairo text-gray-600"
          >
            {categoryData
              ? "نعمل على تجهيز تصنيفاتنا لتجربة تسوق أجمل."
              : "تعذر تحميل التصنيفات الآن. يرجى المحاولة لاحقًا."}
          </div>
        )}
      </section>

      <section
        id="featured"
        aria-labelledby="featured-title"
        className="mb-16 scroll-mt-28 lg:mb-24"
      >
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-cairo text-sm font-semibold text-primary">
              اختيارات توتي
            </p>
            <h2
              id="featured-title"
              className="text-2xl text-secondry sm:text-3xl"
            >
              أحدث القطع
            </h2>
          </div>
          <p className="max-w-md font-cairo text-sm leading-6 text-gray-500">
            تفاصيل مختارة لتضيف لمسة من الأناقة والراحة إلى إطلالتك.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const price = Number(product.price);
              const discount = Number(product.discount);
              const discountedPrice =
                discount > 0 ? price * (1 - discount / 100) : price;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  aria-label={`عرض ${product.name}`}
                  className="group block overflow-hidden border border-gray-100 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <article>
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      <Image
                        src={getImageUrl(product.images?.[0]?.imageurl)}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      {discount > 0 && (
                        <span className="absolute right-3 top-3 bg-primary px-3 py-1 font-cairo text-xs font-bold text-white">
                          خصم {discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-cairo text-xs text-gray-500">
                        {product.title}
                      </p>
                      <h3 className="mt-2 line-clamp-1 text-lg text-secondry">
                        {product.name}
                      </h3>
                      <p className="mt-2 min-h-12 line-clamp-2 font-cairo text-sm leading-6 text-gray-500">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center gap-2 font-cairo">
                        <span className="font-semibold text-secondry">
                          {formatPrice(discountedPrice)}
                        </span>
                        {discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            role={productData ? undefined : "status"}
            className="border border-dashed border-gray-300 bg-white px-5 py-10 text-center font-cairo text-gray-600"
          >
            {productData
              ? "ستجدين هنا أحدث قطعنا قريبًا."
              : "تعذر تحميل المنتجات الآن. يرجى المحاولة لاحقًا."}
          </div>
        )}
      </section>

      <section className="relative isolate grid overflow-hidden bg-neutral lg:grid-cols-2">
        <div className="relative min-h-[300px] lg:min-h-[440px]">
          <Image
            src={RegisterImage}
            alt="تفاصيل ناعمة من توتي فاشون"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-start justify-center px-6 py-10 sm:px-12 lg:px-16 lg:py-16">
          <p className="mb-3 font-cairo text-sm font-semibold text-primary">
            أكثر من مجرد إطلالة
          </p>
          <h2 className="max-w-lg text-2xl leading-relaxed text-secondry sm:text-3xl">
            لأن راحتك وأناقتك تستحقان عناية خاصة
          </h2>
          <p className="mt-4 max-w-lg font-cairo leading-8 text-gray-600">
            في توتي فاشون نهتم بالتفاصيل؛ من اختيار الخامة إلى اللمسة الأخيرة،
            لنمنحك قطعًا تشعرين فيها بالثقة والراحة كل يوم.
          </p>
          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-3 bg-secondry px-6 py-3.5 font-cairo text-sm font-semibold text-white transition hover:bg-primary"
          >
            تعرّفي علينا
            <FaLongArrowAltLeft aria-hidden="true" className="text-lg" />
          </Link>
        </div>
      </section>

      <section className="mt-14 flex flex-col items-center justify-between gap-5 border-y border-gray-200 py-8 text-center sm:flex-row sm:text-right lg:mt-20">
        <div>
          <h2 className="text-xl text-secondry sm:text-2xl">
            نساعدك في اختيار إطلالتك
          </h2>
          <p className="mt-2 font-cairo text-sm leading-6 text-gray-500">
            فريقنا يسعده الإجابة عن استفساراتك ومساعدتك.
          </p>
        </div>
        <div className="flex items-center gap-2 font-cairo text-sm text-primary">
          <MdOutlineSupportAgent aria-hidden="true" className="text-2xl" />
          <Link href="/login" className="hover:underline">
            سجّلي الدخول لمتابعة تجربتك
          </Link>
        </div>
      </section>


    </main>
  );
}
