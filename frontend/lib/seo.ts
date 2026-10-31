import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);

export const siteName = "TOTY Fashion";

export const defaultDescription =
  "اكتشفي أزياء توتي فاشون النسائية الراقية، بتصاميم أنيقة وخامات مختارة بعناية من الحرير والقطن المصري.";

const socialImage = {
  url: "/assests/hero.jpg",
  alt: "توتي فاشون - أزياء نسائية راقية",
};

export const createOpenGraphMetadata = ({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}): NonNullable<Metadata["openGraph"]> => ({
  type: "website",
  locale: "ar_EG",
  siteName,
  title,
  description,
  url,
  images: [socialImage],
});

export const createTwitterMetadata = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): NonNullable<Metadata["twitter"]> => ({
  card: "summary_large_image",
  title,
  description,
  images: [socialImage.url],
});
