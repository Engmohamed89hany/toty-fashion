"use client";
import { FaPhone, FaUserAlt } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import api, { setAccessToken } from "@/lib/api";
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
const LoginForm = () => {
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
        const res = await api.post("/users/login", {
          email: values.email,
          password: values.password,
        });
        const token = res.data.data.accessToken;
        const role = res.data.data.role;
        setAccessToken(token);
        document.cookie = `role=${role};path=/`;
        router.replace("/");
      } catch (err) {
        console.log(err);
      }
    },
  });
  useEffect(() => {
    if (document.cookie) {
      router.replace("/");
    }
  }, []);
  return (
    <form onSubmit={formik.handleSubmit}>
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
    </form>
  );
};

export default LoginForm;
