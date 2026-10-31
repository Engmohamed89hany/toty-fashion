import type { Metadata } from "next";
import { Alexandria, Cairo } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import SiteEntryLoader from "./components/SiteEntryLoader";
import ThemeToggle from "./components/ThemeToggle";
import ScrollToTopButton from "./components/ScrollToTopButton";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
  defaultDescription,
  siteName,
  siteUrl,
} from "@/lib/seo";
import Footer from "./components/Footer";

const alex = Alexandria({
  subsets: ["arabic"],
  variable: "--font-alex",
});
const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
});
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "TOTY Fashion | أزياء نسائية راقية",
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    "توتي فاشون",
    "ملابس نسائية",
    "أزياء نسائية",
    "ملابس منزلية",
    "لانجيري",
    "قطن مصري",
    "حرير",
  ],
  openGraph: createOpenGraphMetadata({
    title: "TOTY Fashion | أزياء نسائية راقية",
    description: defaultDescription,
    url: "/",
  }),
  twitter: createTwitterMetadata({
    title: "TOTY Fashion | أزياء نسائية راقية",
    description: defaultDescription,
  }),
};

export default function RootLayout({
  children,
  model,
}: {
  children: React.ReactNode;
  model: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      className={`${alex.variable} ${cairo.variable} h-full antialiased`}
      dir="rtl"
    >
      <body className="min-h-full flex flex-col font-alex">
        <SiteEntryLoader>
          <Header />
          <div className="w-5/6 min-h-screen mx-auto mt-[120px] ">
            {children} {model}
          </div>
          <Footer />
          <div className="fixed bottom-5 left-5 z-[60]">
            <ThemeToggle />
          </div>
          <ScrollToTopButton />
        </SiteEntryLoader>
      </body>
    </html>
  );
}
