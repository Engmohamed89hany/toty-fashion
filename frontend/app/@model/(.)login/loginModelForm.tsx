"use client";
import React, { useEffect } from "react";
import Model from "../Model";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { MdOutlineEmail } from "react-icons/md";
import Close from "../Close";
import Link from "next/link";
import PasswordInput from "@/app/components/PasswordInput";

export const loginSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Enter a valid email"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
});

interface IForm {
  email: string;
  password: string;
}
const LoginModelForm = () => {
  const router = useRouter();
  const formik = useFormik<IForm>({
    initialValues: {
      email: "",
      password: "",
    },
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const res = await axios.post("http://localhost:4000/api/users/login", {
          email: values.email,
          password: values.password,
        });
        const token = res.data.data.accessToken;
        const role = res.data.data.role;
        document.cookie = `token=${token};path=/`;
        document.cookie = `role=${role};path=/`;
        window.location.pathname = "/";
        console.log(res.data.data);
      } catch (err) {
        console.log(err);

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          formik.setFieldError("password", "invaild email or password");
          return;
        }

        throw new Error("interinal server error with status 500");
      }
    },
  });
  useEffect(() => {
    if (document.cookie) {
      router.replace("/");
    }
  }, []);
  return (
    <Model>
      <form
        onSubmit={formik.handleSubmit}
        className=" relative bg-white mt-7 md:w-[40%] rounded-md mx-auto py-10 px-5 border border-primary  "
      >
        <Close className=" absolute top-2 right-2" />
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-alex text-primary">
            مرحبا بعودتك
          </h1>
          <p className="font-cairo text-md my-7">
            سجلي الدخول لتجربه تسوق استثنائية و متابعه خزانتك و طالبتك الحصريه
          </p>
        </div>
        <div>
          <label className="text-sm font-cairo my-2">البريد الالكتروني </label>
          <div className="flex items-center gap-x-2 bg-gray-100 py-2 px-3 my-3 rounded-2xl border-primary border-1">
            <MdOutlineEmail className="text-secondry text-xl" />
            <input
              type="email"
              placeholder="Sarah@gmail.com"
              className="w-full outline-none border-none "
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <span className="text-sm text-red-500 my-2">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div>
          <label className="text-sm font-cairo my-2">كلمه السر </label>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            placeholder="***************"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password && (
            <span className="text-sm text-red-500 my-2">
              {formik.errors.password}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="text-white bg-primary w-full rounded-xl py-3 px-5 cursor-pointer my-5 hover:bg-black transition-all duration-300 text-lg"
        >
          تسجيل الدخول
        </button>
        <p className="text-center">
          ليس لديك حساب حتى الان ؟
          <Link
            href={"/register"}
            scroll={true}
            className=" underline text-primary cursor-pointer"
          >
            انشا حسابا جديدا فاخرا
          </Link>
        </p>
      </form>
    </Model>
  );
};

export default LoginModelForm;
