import Image from "next/image";
import Link from "next/link";

export interface IStoreProduct {
  id: number;
  name: string;
  description: string;
  price: number | string;
  discount: number | string;
  stock: number;
  size?: string;
  category_id: number;
  title: string;
  images: Array<{ id: number; imageurl: string }>;
}

const API_ORIGIN = "http://localhost:4000";

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

export default function ProductCard({
  product,
}: {
  product: IStoreProduct;
}) {
  const price = Number(product.price);
  const discount = Number(product.discount);
  const discountedPrice =
    discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <article className="group overflow-hidden border border-gray-100 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/products/${product.id}`}
        aria-label={`عرض ${product.name}`}
        className="block"
      >
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
          <p className="font-cairo text-xs text-gray-500">{product.title}</p>
          <h2 className="mt-2 line-clamp-1 text-lg text-secondry">
            {product.name}
          </h2>
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
          <span className="mt-4 inline-flex font-cairo text-sm font-semibold text-primary">
            اكتشفي التفاصيل
          </span>
        </div>
      </Link>
    </article>
  );
}
