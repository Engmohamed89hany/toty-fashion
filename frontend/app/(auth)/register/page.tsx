import type { Metadata } from "next";
import RegisterForm from "./registerForm";
import Link from "next/link";
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

const RegisterPage = () => {
  return (
        <div className="md:w-[45%] mx-auto">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-alex text-primary">
              انضمي الي عالم الاناقه
            </h1>
            <p className="font-cairo text-md my-7">
              انشئي حسابك و احصلي علي
              <span className="text-primary"> خصم 15% فوري</span> علي اول طلب
            </p>
          </div>
          <RegisterForm />
          <p className="text-center my-6">
            لديك حساب بالفعل ؟{" "}
            <Link
              href={"/login"}
               scroll={true}
              className=" underline text-primary cursor-pointer"
            >
              سجلي الان للدخول
            </Link>
          </p>
        </div>

  );
};

export default RegisterPage;
