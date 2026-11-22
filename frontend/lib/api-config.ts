const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://toty-fashion-irgg.vercel.app/api"
    : "http://localhost:4000/api";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/i, "");

export const getApiAssetUrl = (assetUrl: string) => {
  if (/^https?:\/\//i.test(assetUrl)) {
    return assetUrl
  }

  const assetPath = assetUrl.startsWith("/")
    ? assetUrl
    : `/images/${assetUrl}`;

  return `${API_ORIGIN}${assetPath}`;
};
