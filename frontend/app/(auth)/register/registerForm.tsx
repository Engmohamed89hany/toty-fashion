"use client";

import { useEffect, useState } from "react";
import { FaPhone, FaUserAlt } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import api, { getAccessToken, setAccessToken } from "@/lib/api";
import PasswordInput from "@/app/components/PasswordInput";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const registerSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Enter a valid email"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  image: Yup.mixed<File>()
    .nullable()
    .test(
      "image-type",
      "Choose a JPG, PNG, or WEBP image",
      (image) => !image || ALLOWED_IMAGE_TYPES.includes(image.type),
    )
    .test(
      "image-size",
      "Image must be 5 MB or smaller",
      (image) => !image || image.size <= MAX_IMAGE_SIZE,
    ),
});

interface IForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  image: File | null;
}

interface IRegisterResponse {
  data: {
    accessToken: string;
  };
}

interface IApiErrorResponse {
  message?: string;
  data?: {
    message?: string;
  };
  errors?: Array<{
    msg?: string;
  }>;
}

const RegisterForm = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const formik = useFormik<IForm>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      image: null,
    },
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setSubmitError("");

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("phone", values.phone);
      if (values.image) {
        formData.append("image", values.image);
      }

      try {
        const response = await api.post<IRegisterResponse>(
          "/users/register",
          formData,
        );
        setAccessToken(response.data.data.accessToken);
        document.cookie = "role=user;path=/;SameSite=Lax";
        router.replace("/");
      } catch (error) {
        if (axios.isAxiosError<IApiErrorResponse>(error)) {
          setSubmitError(
            error.response?.data?.data?.message ??
              error.response?.data?.message ??
              error.response?.data?.errors?.[0]?.msg ??
              "Registration failed. Please try again.",
          );
          return;
        }

        setSubmitError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during registration.",
        );
      }
    },
  });

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/");
    }
  }, [router]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div>
        <label htmlFor="name" className="text-sm font-cairo my-2">
          الاسم بالكامل
        </label>
        <div className="flex items-center gap-x-2 bg-gray-100 py-2 px-3 my-3 rounded-2xl border-primary border-1">
          <FaUserAlt />
          <input
            id="name"
            type="text"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="ساره هاني"
            className="w-full outline-none border-none"
          />
        </div>
        {formik.touched.name && formik.errors.name && (
          <span className="text-sm text-red-500 my-2">
            {formik.errors.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-cairo my-2">
          البريد الالكتروني
        </label>
        <div className="flex items-center gap-x-2 bg-gray-100 py-2 px-3 my-3 rounded-2xl border-primary border-1">
          <MdOutlineEmail className="text-secondry text-xl" />
          <input
            id="email"
            type="email"
            placeholder="Sarah@gmail.com"
            className="w-full outline-none border-none"
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
        <label htmlFor="phone" className="text-sm font-cairo my-2">
          رقم الهاتف ( للتاكيد عبر واتساب )
        </label>
        <div className="flex items-center gap-x-2 bg-gray-100 py-2 px-3 my-3 rounded-2xl border-primary border-1">
          <FaPhone />
          <input
            id="phone"
            type="tel"
            placeholder="01061765759"
            className="w-full outline-none border-none"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        {formik.touched.phone && formik.errors.phone && (
          <span className="text-sm text-red-500 my-2">
            {formik.errors.phone}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-cairo my-2">
          كلمه السر
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
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

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-cairo my-2">
          تاكيد كلمه السر
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="***************"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <span className="text-sm text-red-500 my-2">
            {formik.errors.confirmPassword}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="image" className="text-sm font-cairo my-2">
          صورة الملف الشخصي (اختياري)
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full my-3 rounded-xl border border-primary bg-gray-100 p-3"
          onChange={(event) => {
            const image = event.currentTarget.files?.[0] ?? null;
            void formik.setFieldValue("image", image);
          }}
          onBlur={() => formik.setFieldTouched("image", true)}
        />
        {formik.touched.image && formik.errors.image && (
          <span className="text-sm text-red-500 my-2">
            {formik.errors.image}
          </span>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-red-500 my-2">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="text-white bg-primary w-full rounded-xl py-3 px-5 cursor-pointer my-5 hover:bg-black transition-all duration-300 text-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {formik.isSubmitting ? "جارٍ إنشاء الحساب..." : "انشاء حساب جديد"}
      </button>
    </form>
  );
};

export default RegisterForm;
