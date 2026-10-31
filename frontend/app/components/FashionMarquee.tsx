"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

interface IFashionImage {
  id: number;
  name: string;
  imageUrl: string;
}

const FashionMarquee = ({ images }: { images: IFashionImage[] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  if (images.length === 0) {
    return (
      <section
        aria-label="صور المنتجات"
        className="my-14 border-y border-gray-200 py-8 text-center font-cairo text-sm text-gray-500 lg:my-20"
      >
        ستظهر هنا صور المنتجات الجديدة قريبًا.
      </section>
    );
  }

  return (
    <section
      aria-label="صور منتجات توتي فاشون"
      className="relative my-14 overflow-hidden lg:my-20 hidden md:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-5 flex items-center justify-between gap-4 px-1">
        <div>
          <p className="mb-2 font-cairo text-sm font-semibold text-primary">
            من اختيارات توتي
          </p>
          <h2 className="text-xl text-secondry sm:text-2xl">
            تفاصيل تستحق أن تريها
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? "تشغيل حركة الصور" : "إيقاف حركة الصور"}
          aria-pressed={isPaused}
          className="inline-flex shrink-0 items-center gap-2 border border-gray-200 px-3 py-2 font-cairo text-xs text-secondry transition hover:border-primary hover:text-primary sm:px-4 sm:text-sm"
        >
          {isPaused ? (
            <FaPlay aria-hidden="true" className="text-[10px]" />
          ) : (
            <FaPause aria-hidden="true" className="text-[10px]" />
          )}
          <span>{isPaused ? "تشغيل" : "إيقاف الحركة"}</span>
        </button>
      </div>

      <div className="relative">
        <div
          className="fashion-marquee-track flex w-max"
          style={{
            animationDuration: `${images.length * 2500}ms`,
            animationPlayState: isHovered || isPaused ? "paused" : "running",
          }}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0"
            >
              {images.map((image) => (
                <Link
                  key={`${copy}-${image.id}`}
                  href="#featured"
                  tabIndex={copy === 1 ? -1 : undefined}
                  aria-label={`شاهدي صور ${image.name}`}
                  className="group relative mx-2 h-[18rem] w-52 shrink-0 overflow-hidden bg-gray-100 transition-transform duration-300 hover:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-[20rem] sm:w-60"
                >
                  <Image
                    src={image.imageUrl}
                    alt={copy === 1 ? "" : image.name}
                    fill
                    sizes="240px"
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <p className="absolute inset-x-4 bottom-4 text-center font-cairo text-base font-semibold text-white sm:text-lg">
                    {image.name}
                  </p>
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-16"
          style={{
            background:
              "linear-gradient(to right, var(--background), transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-16"
          style={{
            background:
              "linear-gradient(to left, var(--background), transparent)",
          }}
        />
      </div>
    </section>
  );
};

export default FashionMarquee;
