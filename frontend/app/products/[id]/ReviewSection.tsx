"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { FaStar } from "react-icons/fa";
import api, { getAccessToken } from "@/lib/api";

const API_ORIGIN = "http://localhost:4000";

export interface IProductReview {
  id: number;
  user_id: number | null;
  reviewer_name: string;
  email: string | null;
  image: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewSectionProps {
  productId: number;
  initialReviews: IProductReview[];
  initialAverageRating: number;
  initialTotalReviews: number;
}

interface IApiErrorResponse {
  message?: string;
  data?: {
    message?: string;
    errors?: string[];
  };
}

interface ICreateReviewResponse {
  data?: {
    review?: IProductReview;
  };
}

const subscribeToAuthChanges = (onStoreChange: () => void) => {
  window.addEventListener("focus", onStoreChange);
  return () => window.removeEventListener("focus", onStoreChange);
};

const getUserIdSnapshot = () => {
  const token = getAccessToken();
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(base64)) as { userId?: unknown };
    const userId = Number(decoded.userId);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
};

const getServerUserIdSnapshot = () => null;

const getAvatarUrl = (image?: string | null) => {
  if (!image) {
    return null;
  }
  if (/^https?:\/\//i.test(image)) {
    return image;
  }
  return `${API_ORIGIN}${image.startsWith("/") ? "" : "/images/"}${image}`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

export default function ReviewSection({
  productId,
  initialReviews,
  initialAverageRating,
  initialTotalReviews,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);
  const [rating, setRating] = useState(5);
  const currentUserId = useSyncExternalStore(
    subscribeToAuthChanges,
    getUserIdSnapshot,
    getServerUserIdSnapshot,
  );
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = currentUserId !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await api.post<ICreateReviewResponse>(
        `/products/${productId}/reviews`,
        {
          rating,
          comment: formData.get("comment"),
        },
      );
      const createdReview = response.data.data?.review;
      if (!createdReview) {
        throw new Error("استجابة الخادم لا تتضمن التقييم الذي تم إنشاؤه.");
      }

      setReviews((currentReviews) => [createdReview, ...currentReviews]);
      setAverageRating(
        (averageRating * totalReviews + createdReview.rating) /
          (totalReviews + 1),
      );
      setTotalReviews((count) => count + 1);
      setRating(5);
      form.reset();
      setStatus({
        type: "success",
        message: "شكرًا لكِ، تمت إضافة تقييمك بنجاح.",
      });
    } catch (error) {
      const message = axios.isAxiosError<IApiErrorResponse>(error)
        ? (error.response?.data?.data?.errors?.[0] ??
          error.response?.data?.data?.message ??
          error.response?.data?.message)
        : error instanceof Error
          ? error.message
          : undefined;
      setStatus({
        type: "error",
        message: message ?? "تعذر إرسال التقييم. حاولي مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const beginEditing = (review: IProductReview) => {
    setEditingReviewId(review.id);
    setEditingRating(review.rating);
    setEditingComment(review.comment);
    setStatus(null);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditingComment("");
    setStatus(null);
  };

  const saveReview = async (reviewId: number) => {
    setStatus(null);
    setIsSubmitting(true);
    try {
      const response = await api.put<ICreateReviewResponse>(
        `/products/${productId}/reviews/${reviewId}`,
        { rating: editingRating, comment: editingComment },
      );
      const updatedReview = response.data.data?.review;
      if (!updatedReview) {
        throw new Error("استجابة الخادم لا تتضمن التقييم المحدّث.");
      }

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === reviewId ? updatedReview : review,
        ),
      );
      setEditingReviewId(null);
      setEditingComment("");
      setStatus({
        type: "success",
        message: "تم تحديث تقييمك بنجاح.",
      });
    } catch (error) {
      const message = axios.isAxiosError<IApiErrorResponse>(error)
        ? (error.response?.data?.data?.errors?.[0] ??
          error.response?.data?.data?.message ??
          error.response?.data?.message)
        : error instanceof Error
          ? error.message
          : undefined;
      setStatus({
        type: "error",
        message: message ?? "تعذر تحديث التقييم. حاولي مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="reviews-title"
      className="grid gap-8 border-t border-gray-200 py-12 lg:grid-cols-[1fr_0.8fr]"
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-cairo text-sm font-semibold text-primary">
              تجارب حقيقية
            </p>
            <h2
              id="reviews-title"
              className="mt-2 text-2xl text-secondry sm:text-3xl"
            >
              آراء عميلاتنا
            </h2>
          </div>
          <div className="font-cairo text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 font-semibold text-secondry">
              <FaStar aria-hidden="true" className="text-primary" />
              {totalReviews > 0 ? averageRating.toFixed(1) : "—"}
            </span>
            <span className="mr-2">
              ({totalReviews} {totalReviews === 1 ? "تقييم" : "تقييمات"})
            </span>
          </div>
        </div>

        {reviews.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  {getAvatarUrl(review.image) ? (
                    <Image
                      src={getAvatarUrl(review.image) ?? ""}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
                    >
                      {review.reviewer_name.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-secondry">
                          {review.reviewer_name}
                        </p>
                        {review.email && (
                          <p
                            dir="ltr"
                            className="mt-1 break-all text-right font-cairo text-xs text-gray-500"
                          >
                            {review.email}
                          </p>
                        )}
                      </div>
                      <time
                        dateTime={review.created_at}
                        className="font-cairo text-xs text-gray-500"
                      >
                        {formatDate(review.created_at)}
                      </time>
                    </div>
                    <div
                      role="img"
                      className="mt-2 flex gap-1 text-primary"
                      aria-label={`التقييم ${review.rating} من 5`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <FaStar
                          key={index}
                          aria-hidden="true"
                          className={
                            index < review.rating ? "opacity-100" : "opacity-25"
                          }
                        />
                      ))}
                    </div>
                    {editingReviewId === review.id ? (
                      <div className="mt-3 space-y-3">
                        <div
                          role="group"
                          aria-label="تعديل التقييم من 5"
                          className="flex flex-row-reverse justify-end gap-2"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setEditingRating(value)}
                              aria-label={`${value} من 5`}
                              aria-pressed={editingRating === value}
                              className={`text-xl ${
                                value <= editingRating
                                  ? "text-primary"
                                  : "text-gray-300"
                              }`}
                            >
                              <FaStar aria-hidden="true" />
                            </button>
                          ))}
                        </div>
                        <label htmlFor={`edit-review-${review.id}`} className="sr-only">
                          تعديل نص التقييم
                        </label>
                        <textarea
                          id={`edit-review-${review.id}`}
                          value={editingComment}
                          onChange={(event) =>
                            setEditingComment(event.target.value)
                          }
                          minLength={10}
                          maxLength={2000}
                          rows={4}
                          className="w-full border border-gray-300 bg-transparent px-3 py-2 font-cairo text-sm leading-7 outline-none focus:border-primary"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveReview(review.id)}
                            disabled={
                              isSubmitting ||
                              editingComment.trim().length < 10
                            }
                            className="bg-secondry px-4 py-2 font-cairo text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديل"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isSubmitting}
                            className="border border-gray-300 px-4 py-2 font-cairo text-sm text-secondry transition hover:border-primary"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-3 whitespace-pre-wrap font-cairo text-sm leading-7 text-gray-600">
                          {review.comment}
                        </p>
                        {currentUserId === review.user_id && (
                          <button
                            type="button"
                            onClick={() => beginEditing(review)}
                            className="mt-3 font-cairo text-sm font-semibold text-primary hover:text-secondry"
                          >
                            تعديل تقييمي
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 border border-dashed border-gray-300 px-5 py-8 text-center font-cairo text-sm text-gray-500">
            لا توجد تقييمات بعد. كوني أول من يشارك تجربته.
          </p>
        )}
        {status && !isAuthenticated && (
          <p
            role={status.type === "error" ? "alert" : "status"}
            className={`mt-4 font-cairo text-sm leading-6 ${
              status.type === "error" ? "text-red-700" : "text-green-700"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>

      <div className="h-fit bg-neutral p-5 sm:p-7">
        <h3 className="text-xl text-secondry">أضيفي تقييمك</h3>
        <p className="mt-2 font-cairo text-sm leading-6 text-gray-600">
          شاركينا رأيك لمساعدة عميلاتنا في اختيار القطعة المناسبة.
        </p>
        <p className="mt-3 font-cairo text-xs leading-6 text-gray-500">
          سيظهر اسمك وبريدك الإلكتروني وصورتك الشخصية علنًا بجانب تقييمك.
        </p>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <fieldset>
              <legend className="mb-2 font-cairo text-sm font-semibold text-secondry">
                تقييمك
              </legend>
              <div className="flex flex-row-reverse justify-end gap-2">
                {[5, 4, 3, 2, 1].map((value) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={rating === value}
                      onChange={() => setRating(value)}
                      className="peer sr-only"
                    />
                    <FaStar
                      aria-hidden="true"
                      className={`text-2xl transition ${
                        value <= rating ? "text-primary" : "text-gray-300"
                      } peer-focus-visible:outline peer-focus-visible:outline-2`}
                    />
                    <span className="sr-only">{value} من 5</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block font-cairo text-sm font-semibold text-secondry"
              >
                تجربتك مع المنتج
              </label>
              <textarea
                id="review-comment"
                name="comment"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                className="w-full resize-y border border-gray-300 bg-white px-4 py-3 font-cairo text-sm leading-7 outline-none transition focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-secondry px-5 py-3 font-cairo text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "جارٍ إرسال تقييمك..." : "إرسال التقييم"}
            </button>
            {status && (
              <p
                role={status.type === "error" ? "alert" : "status"}
                className={`font-cairo text-sm leading-6 ${
                  status.type === "error" ? "text-red-700" : "text-green-700"
                }`}
              >
                {status.message}
              </p>
            )}
          </form>
        ) : (
          <div className="mt-5 border-t border-gray-200 pt-5">
            <p className="font-cairo text-sm text-gray-600">
              سجّلي الدخول لإضافة تقييم باستخدام بيانات حسابك.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex bg-secondry px-5 py-3 font-cairo text-sm font-semibold text-white transition hover:bg-primary"
            >
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
