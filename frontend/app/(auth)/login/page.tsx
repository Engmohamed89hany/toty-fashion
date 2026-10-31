import Link from "next/link";
import LoginForm from "./loginForm";
import type { Metadata } from "next";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/seo";

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

const LoginPage = () => {
  return (
    <div className="md:w-[45%] mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-alex text-primary">
          مرحبا بعودتك
        </h1>
        <p className="font-cairo text-md my-7">
          سجلي الدخول لتجربه تسوق استثنائيةو متابعه خزانتك و طالبتك الحصريه
        </p>
      </div>
      <LoginForm />
      <p className="text-center my-6">
        ليس لديك حساب حتى الان ؟
        <Link
          href={"/register"}
          scroll={true}
          className=" underline text-primary cursor-pointer"
        >
          انشا حسابا جديدا فاخرا
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
