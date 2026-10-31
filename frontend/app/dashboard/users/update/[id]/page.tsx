"use client";

import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import * as Yup from "yup";
import api from "@/lib/api";

interface IUserForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "user" | "admin";
  image: File | null;
}

interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: "user" | "admin";
  image: string | null;
}

interface IFormStatus {
  type: "success" | "error";
  message: string;
}

const userSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "يجب ألا يقل الاسم عن حرفين")
    .max(100, "يجب ألا يزيد الاسم عن 100 حرف")
    .required("يرجى إدخال الاسم"),
  email: Yup.string()
    .trim()
    .email("يرجى إدخال بريد إلكتروني صحيح")
    .required("يرجى إدخال البريد الإلكتروني"),
  phone: Yup.string()
    .trim()
    .matches(/^$|^01[0125][0-9]{8}$/, "يرجى إدخال رقم هاتف مصري صحيح"),
  address: Yup.string().trim().max(255, "يجب ألا يزيد العنوان عن 255 حرفًا"),
  role: Yup.mixed<"user" | "admin">()
    .oneOf(["user", "admin"], "يرجى اختيار دور صحيح")
    .required("يرجى اختيار الدور"),
  image: Yup.mixed<File>()
    .nullable()
    .test(
      "image-type",
      "اختر صورة بصيغة JPG أو PNG أو WEBP",
      (file) =>
        !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    )
    .test(
      "image-size",
      "يجب ألا يتجاوز حجم الصورة 5 ميجابايت",
      (file) => !file || file.size <= 5 * 1024 * 1024,
    ),
});

const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = error.response;
  if (
    typeof response !== "object" ||
    response === null ||
    !("data" in response)
  ) {
    return undefined;
  }
  const payload = response.data;
  if (typeof payload !== "object" || payload === null) {
    return undefined;
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

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return undefined;
};

const UpdateUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const formik = useFormik<IUserForm>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "user",
      image: null,
    },
    validationSchema: userSchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      try {
        const formData = new FormData();
        formData.append("name", values.name.trim());
        formData.append("email", values.email.trim());
        formData.append("phone", values.phone.trim());
        formData.append("address", values.address.trim());
        formData.append("role", values.role);
        if (values.image) {
          formData.append("image", values.image);
        }

        await api.put(`/users/${id}`, formData);
        helpers.setStatus({
          type: "success",
          message: "تم تحديث بيانات المستخدم بنجاح.",
        });
        window.setTimeout(() => router.push("/dashboard/users"), 600);
      } catch (error) {
        helpers.setStatus({
          type: "error",
          message:
            getErrorMessage(error) ??
            "تعذر تحديث بيانات المستخدم. يرجى المحاولة مرة أخرى.",
        });
      }
    },
  });

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const response = await api.get<{ data: { user: IUser } }>(
          `/users/${id}`,
        );
        const user = response.data.data.user;
        if (active) {
          await formik.setValues({
            name: user.name ?? "",
            email: user.email ?? "",
            phone: user.phone ?? "",
            address: user.address ?? "",
            role: user.role,
            image: null,
          });
          setImagePreview(
            user.image ? `http://localhost:4000/images/${user.image}` : null,
          );
        }
      } catch (error) {
        if (active) {
          formik.setStatus({
            type: "error",
            message: getErrorMessage(error) ?? "تعذر تحميل بيانات المستخدم.",
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUser();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  const fieldClassName =
    "mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-right text-secondry outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const status = formik.status as IFormStatus | undefined;

  return (
    <section
      dir="rtl"
      className="mx-auto min-h-[70vh] w-full max-w-3xl py-4 sm:py-8"
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 font-cairo text-sm font-semibold text-primary">
            إدارة المستخدمين
          </p>
          <h1 className="font-alex text-2xl font-bold text-secondry sm:text-3xl">
            تعديل بيانات المستخدم
          </h1>
        </div>
        <Link
          href="/dashboard/users"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-cairo text-sm text-secondry transition hover:border-primary"
        >
          العودة إلى المستخدمين
        </Link>
      </header>

      {loading ? (
        <p
          role="status"
          className="rounded-lg bg-white p-6 text-center font-cairo text-gray-600"
        >
          جارٍ تحميل بيانات المستخدم...
        </p>
      ) : (
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="space-y-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
        >
          <section
            aria-labelledby="user-image-label"
            className="rounded-xl border-2 border-dashed border-primary/40 bg-neutral p-4 sm:p-5"
          >
            <h2
              id="user-image-label"
              className="font-cairo text-base font-semibold text-secondry"
            >
              صورة المستخدم
            </h2>
            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="صورة المستخدم الحالية أو المختارة"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 shrink-0 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/15 font-alex text-3xl text-primary">
                  {formik.values.name[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="w-full min-w-0">
                <label
                  htmlFor="image"
                  className="font-cairo text-sm font-medium text-secondry"
                >
                  {formik.values.image
                    ? `الصورة المختارة: ${formik.values.image.name}`
                    : "اختر صورة جديدة أو اتركها بدون تغيير"}
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const image = event.currentTarget.files?.[0] ?? null;
                    void formik.setFieldValue("image", image);
                    if (previewUrlRef.current) {
                      URL.revokeObjectURL(previewUrlRef.current);
                    }
                    const nextPreview = image
                      ? URL.createObjectURL(image)
                      : null;
                    previewUrlRef.current = nextPreview;
                    if (nextPreview) {
                      setImagePreview(nextPreview);
                    }
                  }}
                  onBlur={() => formik.setFieldTouched("image", true)}
                  aria-invalid={Boolean(
                    formik.touched.image && formik.errors.image,
                  )}
                  className="mt-3 block w-full cursor-pointer font-cairo text-sm text-gray-700 file:ml-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-secondry"
                />
                <p className="mt-2 font-cairo text-xs text-gray-500">
                  JPG أو PNG أو WEBP، بحد أقصى 5 ميجابايت.
                </p>
                {formik.touched.image && formik.errors.image && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.image}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="font-cairo text-sm font-semibold text-secondry"
              >
                الاسم
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched.name && formik.errors.name,
                )}
                className={fieldClassName}
              />
              {formik.touched.name && formik.errors.name && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="font-cairo text-sm font-semibold text-secondry"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched.email && formik.errors.email,
                )}
                className={fieldClassName}
              />
              {formik.touched.email && formik.errors.email && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="font-cairo text-sm font-semibold text-secondry"
              >
                رقم الهاتف
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched.phone && formik.errors.phone,
                )}
                className={fieldClassName}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="font-cairo text-sm font-semibold text-secondry"
              >
                الدور
              </label>
              <select
                id="role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClassName}
              >
                <option value="user">مستخدم</option>
                <option value="admin">مدير</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {formik.errors.role}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="font-cairo text-sm font-semibold text-secondry"
            >
              العنوان
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(
                formik.touched.address && formik.errors.address,
              )}
              className={`${fieldClassName} resize-y`}
            />
            {formik.touched.address && formik.errors.address && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {formik.errors.address}
              </p>
            )}
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
            className="w-full rounded-lg bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formik.isSubmitting ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      )}
    </section>
  );
};

export default UpdateUserPage;
