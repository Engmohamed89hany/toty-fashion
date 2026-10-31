import type { Metadata } from "next";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/seo";
import LoginModelForm from "./loginModelForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجلي الدخول إلى حسابك في توتي فاشون لمتابعة طلباتك وتسوقك.",
  openGraph: createOpenGraphMetadata({
    title: "تسجيل الدخول | TOTY Fashion",
    description: "سجلي الدخول إلى حسابك في توتي فاشون لمتابعة طلباتك وتسوقك.",
    url: "/login",
  }),
  twitter: createTwitterMetadata({
    title: "تسجيل الدخول | TOTY Fashion",
    description: "سجلي الدخول إلى حسابك في توتي فاشون لمتابعة طلباتك وتسوقك.",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginModelPage() {
  return <LoginModelForm />;
}
