"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import api from "@/lib/api";

interface ICategoryForm {
  title: string;
  description: string;
  image: File | null;
}

interface IFormStatus {
  type: "success" | "error";
  message: string;
}

const API_URL = "http://localhost:4000/api";
const BASE_URL = "http://localhost:4000";
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

const getCategoryImageUrl = (image?: string | null) => {
  if (!image) {
    return "https://placehold.co/100x100/f3f4f6/1f2937?text=No+Image";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${BASE_URL}/images/${image}`;
};

const UpdateCategoryPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearImagePreview = () => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }
    setImagePreview(null);
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

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

      if (!token || !params.id) {
        helpers.setStatus({
          type: "error",
          message: "انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title.trim());
      formData.append("description", values.description.trim());

      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      try {
        const response = await api.put(`/categories/${params.id}`, formData);

        const payload: unknown = response.data ?? null;

        if (response.status < 200 || response.status >= 300) {
          helpers.setStatus({
            type: "error",
            message:
              getErrorMessage(payload) ??
              "تعذر تحديث التصنيف. يرجى المحاولة مرة أخرى.",
          });
          return;
        }

        helpers.setStatus({
          type: "success",
          message: "تم تحديث التصنيف بنجاح.",
        });

        setTimeout(() => {
          router.push("/dashboard/categories");
        }, 500);
      } catch {
        helpers.setStatus({
          type: "error",
          message: "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        });
      }
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      const token = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("token="))
        ?.slice("token=".length);

      if (!params.id) {
        setLoading(false);
        return;
      }

      if (!token) {
        formik.setStatus({
          type: "error",
          message: "انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/categories/${params.id}`);

        if (response.status < 200 || response.status >= 300) {
          throw new Error("Category not found");
        }

        const payload = response.data;
        const category = payload?.data ?? payload;

        formik.setValues({
          title: category?.title ?? "",
          description: category?.decription ?? "",
          image: null,
        });

        if (category?.image) {
          const previewUrl = getCategoryImageUrl(category.image);
          setExistingImage(previewUrl);
          setImagePreview(previewUrl);
        } else {
          setExistingImage(null);
          setImagePreview(null);
        }
      } catch {
        formik.setStatus({
          type: "error",
          message: "تعذر تحميل بيانات التصنيف.",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchCategory();
  }, [params.id]);

  const fieldClassName =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-secondry outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const status = formik.status as IFormStatus | undefined;

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
            تحديث التصنيف
          </h1>
          <p className="mt-3 font-cairo leading-7 text-gray-600">
            عدّل اسم التصنيف ووصفه، ويمكنك استبدال صورته عند الحاجة.
          </p>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center font-cairo text-gray-600">
            جارٍ تحميل بيانات التصنيف...
          </div>
        ) : (
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
                aria-invalid={Boolean(formik.touched.title && formik.errors.title)}
                className={fieldClassName}
              />
              {formik.touched.title && formik.errors.title && (
                <p role="alert" className="mt-2 text-sm text-red-600">
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
                className={`${fieldClassName} resize-y`}
              />
              {formik.touched.description && formik.errors.description && (
                <p role="alert" className="mt-2 text-sm text-red-600">
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
                    const file = event.currentTarget.files?.[0] ?? null;
                    formik.setFieldValue("image", file);

                    if (file) {
                      if (imagePreviewUrlRef.current) {
                        URL.revokeObjectURL(imagePreviewUrlRef.current);
                      }

                      const previewUrl = URL.createObjectURL(file);
                      imagePreviewUrlRef.current = previewUrl;
                      setImagePreview(previewUrl);
                    } else {
                      setImagePreview(existingImage);
                    }
                  }}
                  onBlur={() => formik.setFieldTouched("image", true)}
                  aria-invalid={Boolean(formik.touched.image && formik.errors.image)}
                  className="block w-full cursor-pointer font-cairo text-sm text-gray-600 file:ml-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-secondry hover:file:bg-primary/20"
                />
                <p className="mt-3 font-cairo text-xs text-gray-500">
                  JPG أو PNG أو WEBP، بحد أقصى 5 ميجابايت. يمكنك ترك الصورة الحالية
                  دون تعديل أو اختيار صورة جديدة لاستبدالها.
                </p>
                {formik.touched.image && formik.errors.image && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
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
                      {formik.values.image?.name ?? "الصورة الحالية"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {status && (
              <p
                role={status.type === "error" ? "alert" : "status"}
                className={`rounded-lg px-4 py-3 font-cairo text-sm ${
                  status.type === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full rounded-xl bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formik.isSubmitting ? "جارٍ تحديث التصنيف..." : "تحديث التصنيف"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default UpdateCategoryPage;
