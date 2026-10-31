import Link from "next/link";
import Close from "../Close";
import Model from "../Model";
import RegisterForm from "../../(auth)/register/registerForm";
import type { Metadata } from "next";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئي حسابك في توتي فاشون واكتشفي الأزياء النسائية الراقية.",
  openGraph: createOpenGraphMetadata({
    title: "إنشاء حساب | TOTY Fashion",
    description: "أنشئي حسابك في توتي فاشون واكتشفي الأزياء النسائية الراقية.",
    url: "/register",
  }),
  twitter: createTwitterMetadata({
    title: "إنشاء حساب | TOTY Fashion",
    description: "أنشئي حسابك في توتي فاشون واكتشفي الأزياء النسائية الراقية.",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const RegisterModel = () => {
  return (
    <Model>
      <div className="relative mx-auto mt-7 max-h-[calc(100vh-8rem)] w-[92%] overflow-y-auto rounded-md border border-primary bg-white px-5 py-10 md:w-[40%]">
        <Close className="absolute right-2 top-2" />
        <div className="text-center">
          <h1 className="text-3xl font-alex text-primary md:text-4xl">
            انضمي الي عالم الاناقه
          </h1>
          <p className="my-7 font-cairo text-md">
            انشئي حسابك و احصلي علي
            <span className="text-primary"> خصم 15% فوري</span> علي اول طلب
          </p>
        </div>
        <RegisterForm />
        <p className="my-6 text-center">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            scroll={true}
            className="cursor-pointer underline text-primary"
          >
            سجلي الان للدخول
          </Link>
        </p>
      </div>
    </Model>
  );
};

export default RegisterModel;
