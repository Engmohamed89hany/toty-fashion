"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { getApiAssetUrl } from "@/lib/api-config";
import type { IStoreProduct } from "../ProductCard";

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) {
    return "/assests/hero.jpg";
  }
  return getApiAssetUrl(imageUrl);
};

const formatPrice = (price: number) =>
  `${price.toLocaleString("ar-EG")} ج.م`;

export default function CategoryProductCarousel({
  products,
}: {
  products: IStoreProduct[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (products.length === 0) {
    return null;
  }

  const move = (direction: number) => {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex + direction + products.length) % products.length,
    );
  };

  return (
    <div className="overflow-hidden">
      <div
        aria-label="منتجات من نفس التصنيف"
        aria-roledescription="عارض ثلاثي الأبعاد"
        className="relative mx-auto flex h-[410px] max-w-5xl items-center justify-center [perspective:1200px] sm:h-[480px]"
      >
        {products.map((product, index) => {
          let offset = index - activeIndex;
          if (offset > products.length / 2) {
            offset -= products.length;
          } else if (offset < -products.length / 2) {
            offset += products.length;
          }

          const isActive = offset === 0;
          const price = Number(product.price);
          const discount = Number(product.discount);
          const shownPrice =
            discount > 0 ? price * (1 - discount / 100) : price;
          const isVisible = Math.abs(offset) <= 1;

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              aria-label={`عرض ${product.name}`}
              aria-hidden={!isVisible}
              tabIndex={isVisible ? 0 : -1}
              className="absolute w-[min(68vw,260px)] overflow-hidden border border-gray-100 bg-white shadow-xl transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none"
              style={{
                left: `${50 + offset * 23}%`,
                zIndex: isActive ? 2 : 1,
                opacity: isVisible ? (isActive ? 1 : 0.62) : 0,
                pointerEvents: isVisible ? "auto" : "none",
                transform: `translateX(-50%) rotateY(${-offset * 24}deg) translateZ(${isActive ? 30 : -100}px) scale(${isActive ? 1 : 0.84})`,
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <Image
                  src={getImageUrl(product.images?.[0]?.imageurl)}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 68vw, 260px"
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-right">
                <p className="font-cairo text-xs text-gray-500">
                  {product.title}
                </p>
                <h3 className="mt-1 line-clamp-1 text-lg text-secondry">
                  {product.name}
                </h3>
                <p className="mt-2 font-cairo text-sm font-semibold text-secondry">
                  {formatPrice(shownPrice)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="المنتج السابق"
            className="inline-flex h-11 w-11 items-center justify-center border border-gray-300 text-secondry transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <FaArrowRight aria-hidden="true" />
          </button>
          <p
            aria-live="polite"
            className="min-w-16 text-center font-cairo text-sm text-gray-600"
          >
            {activeIndex + 1} / {products.length}
          </p>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="المنتج التالي"
            className="inline-flex h-11 w-11 items-center justify-center border border-gray-300 text-secondry transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
