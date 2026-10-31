"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "@/lib/api";

interface ICategoryForm {
  title: string;
  description: string;
  image: File | null;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const categorySchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("يرجى إدخال اسم التصنيف")
    .max(100, "يجب ألا يزيد اسم التصنيف عن 100 حرف"),
  description: Yup.string()
    .trim()
    .required("يرجى إدخال وصف التصنيف")
    .max(500, "يجب ألا يزيد الوصف عن 500 حرف"),
  image: Yup.mixed<File>()
    .nullable()
    .required("يرجى اختيار صورة للتصنيف")
    .test(
      "image-type",
      "اختر صورة بصيغة JPG أو PNG أو WEBP",
      (file) => !file || ALLOWED_IMAGE_TYPES.includes(file.type),
    )
    .test(
      "image-size",
      "يجب ألا يتجاوز حجم الصورة 5 ميجابايت",
      (file) => !file || file.size <= MAX_IMAGE_SIZE,
    ),
});

const getErrorMessage = (payload: unknown): string | undefined => {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if (
    "data" in payload &&
    typeof payload.data === "object" &&
    payload.data !== null &&
    "message" in payload.data &&
    typeof payload.data.message === "string"
  ) {
    return payload.data.message;
  }

  return undefined;
};

const NewCategoryPage = () => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const clearImagePreview = () => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }
    setImagePreview(null);
  };

  useEffect(
    () => () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    },
    [],
  );

  const formik = useFormik<ICategoryForm>({
    initialValues: {
      title: "",
      description: "",
      image: null,
    },
    validationSchema: categorySchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);

      const token = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("token="))
        ?.slice("token=".length);

      if (!token) {
        helpers.setStatus({
          type: "error",
          message: "انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title.trim());
      formData.append("description", values.description.trim());
      if (values.image) {
        formData.append("image", values.image);
      }

      try {
        const response = await api.post("/categories", formData);

        if (response.status < 200 || response.status >= 300) {
          const payload: unknown = response.data ?? null;
          helpers.setStatus({
            type: "error",
            message:
              getErrorMessage(payload) ??
              "تعذر إنشاء التصنيف. يرجى المحاولة مرة أخرى.",
          });
          return;
        }

        helpers.resetForm();
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
        clearImagePreview();
        helpers.setStatus({
          type: "success",
          message: "تم إنشاء التصنيف بنجاح.",
        });
      } catch {
        helpers.setStatus({
          type: "error",
          message: "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        });
      }
    },
  });

  const fieldClassName =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-secondry outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full bg-neutral py-6 sm:py-10"
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 font-cairo text-sm font-semibold text-primary">
            إدارة المتجر
          </p>
          <h1 className="font-alex text-3xl font-bold text-secondry">
            إضافة تصنيف جديد
          </h1>
          <p className="mt-3 font-cairo leading-7 text-gray-600">
            أضف اسم التصنيف ووصفه وصورة لعرضه في المتجر.
          </p>
        </header>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="font-cairo text-sm font-semibold text-secondry"
            >
              اسم التصنيف
            </label>
            <input
              id="title"
              name="title"
              type="text"
              autoComplete="off"
              placeholder="مثال: فساتين سهرة"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(
                formik.touched.title && formik.errors.title,
              )}
              aria-describedby={
                formik.touched.title && formik.errors.title
                  ? "title-error"
                  : undefined
              }
              className={fieldClassName}
            />
            {formik.touched.title && formik.errors.title && (
              <p
                id="title-error"
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {formik.errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="font-cairo text-sm font-semibold text-secondry"
            >
              وصف التصنيف
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="اكتب وصفًا مختصرًا للتصنيف..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(
                formik.touched.description && formik.errors.description,
              )}
              aria-describedby={
                formik.touched.description && formik.errors.description
                  ? "description-error"
                  : undefined
              }
              className={`${fieldClassName} resize-y`}
            />
            {formik.touched.description && formik.errors.description && (
              <p
                id="description-error"
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {formik.errors.description}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="image"
              className="font-cairo text-sm font-semibold text-secondry"
            >
              صورة التصنيف
            </label>
            <div className="mt-2 rounded-xl border-2 border-dashed border-gray-200 p-5 transition hover:border-primary">
              <input
                ref={imageInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const image = event.currentTarget.files?.[0] ?? null;
                  formik.setFieldValue("image", image);
                  if (imagePreviewUrlRef.current) {
                    URL.revokeObjectURL(imagePreviewUrlRef.current);
                  }
                  const previewUrl = image ? URL.createObjectURL(image) : null;
                  imagePreviewUrlRef.current = previewUrl;
                  setImagePreview(previewUrl);
                }}
                onBlur={() => formik.setFieldTouched("image", true)}
                aria-invalid={Boolean(
                  formik.touched.image && formik.errors.image,
                )}
                aria-describedby={
                  formik.touched.image && formik.errors.image
                    ? "image-error"
                    : "image-help"
                }
                className="block w-full cursor-pointer font-cairo text-sm text-gray-600 file:ml-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-secondry hover:file:bg-primary/20"
              />
              <p
                id="image-help"
                className="mt-3 font-cairo text-xs text-gray-500"
              >
                JPG أو PNG أو WEBP، بحد أقصى 5 ميجابايت.
              </p>
              {formik.touched.image && formik.errors.image && (
                <p
                  id="image-error"
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {formik.errors.image}
                </p>
              )}
              {imagePreview && (
                <div className="mt-5 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="معاينة صورة التصنيف"
                    className="h-20 w-20 rounded-xl border border-gray-200 object-cover"
                  />
                  <span className="font-cairo text-sm text-gray-600">
                    {formik.values.image?.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {formik.status?.message && (
            <p
              role={formik.status.type === "error" ? "alert" : "status"}
              className={`rounded-lg px-4 py-3 font-cairo text-sm ${
                formik.status.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {formik.status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full rounded-xl bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formik.isSubmitting ? "جارٍ إنشاء التصنيف..." : "إنشاء التصنيف"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default NewCategoryPage;
