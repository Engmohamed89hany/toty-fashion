"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import api from "@/lib/api";
import { MdArrowBack, MdClose, MdImage } from "react-icons/md";
import Link from "next/link";

interface ICategory {
  id: number;
  title: string;
}

interface IProductImage {
  id: number;
  imageurl: string;
}

interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number | string;
  discount: number | string;
  stock: number;
  size: string;
  category_id: number;
  images: IProductImage[];
}

interface IProductFormValues {
  name: string;
  description: string;
  price: string;
  discount: string;
  stock: string;
  size: string;
  category_id: string;
  images: File[];
}

interface IProductFormProps {
  mode: "create" | "edit";
  productId?: string;
}

interface IFormStatus {
  type: "success" | "error";
  message: string;
}

interface IApiError {
  message?: string;
  data?: {
    message?: string;
    errors?: string[];
  };
  errors?: Array<{
    msg?: string;
    message?: string;
  }>;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const API_ORIGIN = "http://localhost:4000";

const productSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("يرجى إدخال اسم المنتج")
    .max(255, "يجب ألا يزيد اسم المنتج عن 255 حرفًا"),
  description: Yup.string()
    .trim()
    .required("يرجى إدخال وصف المنتج"),
  price: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("يرجى إدخال سعر صحيح")
    .required("يرجى إدخال السعر")
    .min(0, "لا يمكن أن يكون السعر سالبًا")
    .max(99999999.99, "السعر يتجاوز الحد المسموح"),
  discount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? 0 : value,
    )
    .typeError("أدخلي نسبة خصم صحيحة")
    .min(0, "لا يمكن أن يكون الخصم سالبًا")
    .max(100, "يجب ألا يتجاوز الخصم 100%"),
  stock: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("يرجى إدخال كمية صحيحة")
    .required("يرجى إدخال كمية المخزون")
    .integer("يجب أن تكون الكمية رقمًا صحيحًا")
    .min(0, "لا يمكن أن تكون الكمية سالبة")
    .max(2147483647, "الكمية تتجاوز الحد المسموح"),
  size: Yup.string()
    .trim()
    .required("يرجى إدخال المقاس أو المقاسات")
    .max(100, "يجب ألا تتجاوز المقاسات 100 حرف"),
  category_id: Yup.string().required("يرجى اختيار تصنيف"),
  images: Yup.array()
    .of(
      Yup.mixed<File>()
        .test(
          "image-type",
          "اختر صورًا بصيغة JPG أو PNG أو WEBP",
          (file) => !file || ALLOWED_IMAGE_TYPES.includes(file.type),
        )
        .test(
          "image-size",
          "يجب ألا يتجاوز حجم كل صورة 5 ميجابايت",
          (file) => !file || file.size <= MAX_IMAGE_SIZE,
        ),
    )
    .max(MAX_IMAGE_COUNT, "يمكن رفع 5 صور كحد أقصى"),
});

const getImageUrl = (imageUrl: string) => {
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_ORIGIN}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<IApiError>(error)) {
    const payload = error.response?.data;
    return (
      payload?.data?.message ??
      payload?.message ??
      payload?.data?.errors?.[0] ??
      payload?.errors?.[0]?.msg ??
      payload?.errors?.[0]?.message ??
      "تعذر حفظ المنتج. يرجى مراجعة البيانات والمحاولة مرة أخرى."
    );
  }

  return error instanceof Error
    ? error.message
    : "حدث خطأ غير متوقع أثناء حفظ المنتج.";
};

const ProductForm = ({ mode, productId }: IProductFormProps) => {
  const params = useParams<{ id?: string }>();
  const resolvedProductId = productId ?? params.id;
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<IProductImage[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState("");

  const formik = useFormik<IProductFormValues>({
    initialValues: {
      name: "",
      description: "",
      price: "",
      discount: "0",
      stock: "",
      size: "",
      category_id: "",
      images: [],
    },
    validationSchema: productSchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("description", values.description.trim());
      formData.append("price", values.price);
      formData.append("discount", values.discount || "0");
      formData.append("stock", values.stock);
      formData.append("size", values.size.trim());
      formData.append("category_id", values.category_id);
      values.images.forEach((image) => formData.append("images", image));

      try {
        if (mode === "edit" && resolvedProductId) {
          await api.put(`/products/${resolvedProductId}`, formData);
          helpers.setStatus({
            type: "success",
            message: "تم تحديث المنتج بنجاح.",
          });
        } else {
          await api.post("/products", formData);
          helpers.setStatus({
            type: "success",
            message: "تم إنشاء المنتج بنجاح.",
          });
        }

        router.push("/dashboard/products");
        router.refresh();
      } catch (error) {
        helpers.setStatus({
          type: "error",
          message: getErrorMessage(error),
        });
      }
    },
  });

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadFormData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [categoriesResponse, productResponse] = await Promise.all([
          api.get("/categories?page=1&limit=100"),
          mode === "edit" && resolvedProductId
            ? api.get(`/products/${resolvedProductId}`)
            : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        const categoryData = categoriesResponse.data?.data?.categories;
        if (!Array.isArray(categoryData)) {
          throw new Error("تعذر قراءة قائمة التصنيفات من الخادم.");
        }
        setCategories(categoryData);

        if (mode === "edit") {
          const productData: IProduct | undefined =
            productResponse?.data?.data?.product;
          if (!productData) {
            throw new Error("لم يتم العثور على المنتج.");
          }

          formik.setValues({
            name: productData.name ?? "",
            description: productData.description ?? "",
            price: String(productData.price ?? ""),
            discount: String(productData.discount ?? 0),
            stock: String(productData.stock ?? ""),
            size: productData.size ?? "",
            category_id: String(productData.category_id ?? ""),
            images: [],
          });
          setExistingImages(productData.images ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFormData();
    return () => {
      cancelled = true;
    };
    // Form state is updated after the initial category/product fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, resolvedProductId]);

  const status = formik.status as IFormStatus | undefined;
  const fieldClassName =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-secondry outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20";

  const handleImageChange = (files: FileList | null) => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const selectedImages = Array.from(files ?? []);
    const urls = selectedImages.map((image) => URL.createObjectURL(image));
    previewUrlsRef.current = urls;
    setPreviewUrls(urls);
    void formik.setFieldValue("images", selectedImages);
  };

  return (
    <main dir="rtl" className="min-h-screen w-full bg-neutral py-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <Link
            href="/dashboard/products"
            className="mb-4 inline-flex items-center gap-2 font-cairo text-sm text-gray-600 transition hover:text-primary"
          >
            <MdArrowBack aria-hidden="true" />
            العودة إلى المنتجات
          </Link>
          <p className="mb-2 font-cairo text-sm font-semibold text-primary">
            إدارة المتجر
          </p>
          <h1 className="font-alex text-3xl font-bold text-secondry">
            {mode === "edit" ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h1>
          <p className="mt-3 font-cairo leading-7 text-gray-600">
            أدخلي بيانات المنتج واختاري تصنيفه وصوره لعرضه في المتجر.
          </p>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center font-cairo text-gray-600">
            جارٍ تحميل بيانات المنتج...
          </div>
        ) : loadError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 font-cairo text-red-700"
          >
            <p>{loadError}</p>
            {mode === "edit" && (
              <Link
                href="/dashboard/products"
                className="mt-4 inline-flex underline"
              >
                العودة إلى المنتجات
              </Link>
            )}
          </div>
        ) : (
          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  اسم المنتج
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  maxLength={255}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="مثال: فستان سهرة أنيق"
                  className={fieldClassName}
                  aria-invalid={Boolean(formik.touched.name && formik.errors.name)}
                />
                {formik.touched.name && formik.errors.name && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  وصف المنتج
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="اكتبي تفاصيل المنتج وخامته..."
                  className={`${fieldClassName} resize-y`}
                  aria-invalid={Boolean(
                    formik.touched.description && formik.errors.description,
                  )}
                />
                {formik.touched.description && formik.errors.description && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  السعر
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={fieldClassName}
                  aria-invalid={Boolean(formik.touched.price && formik.errors.price)}
                />
                {formik.touched.price && formik.errors.price && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.price}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="discount"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  الخصم (%)
                </label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={fieldClassName}
                  aria-invalid={Boolean(
                    formik.touched.discount && formik.errors.discount,
                  )}
                />
                {formik.touched.discount && formik.errors.discount && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.discount}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  الكمية في المخزون
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={fieldClassName}
                  aria-invalid={Boolean(formik.touched.stock && formik.errors.stock)}
                />
                {formik.touched.stock && formik.errors.stock && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.stock}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="size"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  المقاس أو المقاسات
                </label>
                <input
                  id="size"
                  name="size"
                  type="text"
                  maxLength={100}
                  value={formik.values.size}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="مثال: S, M, L أو مقاس موحد"
                  className={fieldClassName}
                  aria-invalid={Boolean(formik.touched.size && formik.errors.size)}
                />
                {formik.touched.size && formik.errors.size && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.size}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="category_id"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  التصنيف
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formik.values.category_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={fieldClassName}
                  aria-invalid={Boolean(
                    formik.touched.category_id && formik.errors.category_id,
                  )}
                >
                  <option value="">اختاري تصنيفًا</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-2 font-cairo text-sm text-amber-700">
                    لا توجد تصنيفات. أضيفي تصنيفًا قبل حفظ المنتج.
                  </p>
                )}
                {formik.touched.category_id && formik.errors.category_id && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {formik.errors.category_id}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="images"
                  className="font-cairo text-sm font-semibold text-secondry"
                >
                  صور المنتج
                </label>
                <div className="mt-2 rounded-xl border-2 border-dashed border-gray-200 p-5 transition hover:border-primary">
                  <input
                    ref={imageInputRef}
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handleImageChange(event.currentTarget.files)
                    }
                    onBlur={() => formik.setFieldTouched("images", true)}
                    className="block w-full cursor-pointer font-cairo text-sm text-gray-600 file:ml-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-secondry hover:file:bg-primary/20"
                  />
                  <p className="mt-3 font-cairo text-xs text-gray-500">
                    JPG أو PNG أو WEBP، حتى 5 صور، بحد أقصى 5 ميجابايت للصورة.
                    {mode === "edit" &&
                      " الصور الجديدة ستضاف إلى الصور الحالية."}
                  </p>
                  {formik.touched.images && formik.errors.images && (
                    <p role="alert" className="mt-2 text-sm text-red-600">
                      {typeof formik.errors.images === "string"
                        ? formik.errors.images
                        : "تحققي من صيغ وأحجام الصور المختارة."}
                    </p>
                  )}
                  {(existingImages.length > 0 || previewUrls.length > 0) && (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {existingImages.map((image) => (
                        <div
                          key={`existing-${image.id}`}
                          className="relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                        >
                          <Image
                            src={getImageUrl(image.imageurl)}
                            alt="صورة المنتج الحالية"
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {previewUrls.map((url, index) => (
                        <div
                          key={url}
                          className="relative aspect-square overflow-hidden rounded-xl border border-primary/40"
                        >
                          <Image
                            src={url}
                            alt={`معاينة الصورة الجديدة ${index + 1}`}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {existingImages.length === 0 && previewUrls.length === 0 && (
                    <div className="mt-4 flex items-center gap-2 font-cairo text-sm text-gray-500">
                      <MdImage aria-hidden="true" />
                      لم يتم اختيار صور بعد.
                    </div>
                  )}
                </div>
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

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-cairo text-secondry transition hover:bg-gray-50"
              >
                <MdClose aria-hidden="true" />
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={
                  formik.isSubmitting ||
                  categories.length === 0 ||
                  (mode === "edit" && !resolvedProductId)
                }
                className="flex-1 rounded-xl bg-primary px-5 py-3 font-cairo font-semibold text-white transition hover:bg-secondry disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formik.isSubmitting
                  ? "جارٍ حفظ المنتج..."
                  : mode === "edit"
                    ? "حفظ التعديلات"
                    : "إنشاء المنتج"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default ProductForm;
