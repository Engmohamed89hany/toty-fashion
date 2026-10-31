"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { MdDelete, MdEdit, MdSave, MdClose } from "react-icons/md";
import api from "@/lib/api";

const API_ORIGIN = "http://localhost:4000";

export interface IAdminReview {
  id: number;
  product_id: number;
  product_name: string;
  user_id: number | null;
  reviewer_name: string;
  email: string | null;
  image: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsTableProps {
  reviews: IAdminReview[];
}

interface IReviewResponse {
  data?: {
    review?: IAdminReview;
    message?: string;
    errors?: string[];
  };
  message?: string;
}

const getAvatarUrl = (image?: string | null) => {
  if (!image) {
    return null;
  }
  if (/^https?:\/\//i.test(image)) {
    return image;
  }
  return `${API_ORIGIN}${image.startsWith("/") ? "" : "/images/"}${image}`;
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<IReviewResponse>(error)) {
    return (
      error.response?.data?.data?.errors?.[0] ??
      error.response?.data?.data?.message ??
      error.response?.data?.message ??
      "تعذر تنفيذ الطلب. يرجى المحاولة مرة أخرى."
    );
  }
  return error instanceof Error
    ? error.message
    : "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
};

export default function ReviewsTable({ reviews: initialReviews }: ReviewsTableProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const startEditing = (review: IAdminReview) => {
    setEditingId(review.id);
    setEditingRating(review.rating);
    setEditingComment(review.comment);
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingComment("");
    setError("");
  };

  const saveReview = async (reviewId: number) => {
    setBusyId(reviewId);
    setError("");
    setSuccess("");
    try {
      const response = await api.put<IReviewResponse>(`/reviews/${reviewId}`, {
        rating: editingRating,
        comment: editingComment,
      });
      const updatedReview = response.data.data?.review;
      if (!updatedReview) {
        throw new Error("استجابة الخادم لا تتضمن التقييم المحدّث.");
      }
      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId ? updatedReview : review,
        ),
      );
      setEditingId(null);
      setSuccess("تم تحديث التقييم.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!window.confirm("هل أنتِ متأكدة من حذف هذا التقييم؟")) {
      return;
    }

    setBusyId(reviewId);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((current) => current.filter((review) => review.id !== reviewId));
      setSuccess("تم حذف التقييم.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <p className="border border-dashed border-gray-300 p-8 text-center font-cairo text-gray-600">
        لا توجد تقييمات في هذه الصفحة.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 bg-red-50 p-4 font-cairo text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mb-4 bg-green-50 p-4 font-cairo text-sm text-green-700">
          {success}
        </p>
      )}
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="flex min-w-0 flex-1 items-start gap-3">
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
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {review.reviewer_name?.slice(0, 1) ?? "?"}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-secondry">
                        {review.reviewer_name}
                      </p>
                      <p dir="ltr" className="break-all text-right font-cairo text-xs text-gray-500">
                        {review.email ?? "حساب غير مرتبط"}
                      </p>
                      <Link
                        href={`/products/${review.product_id}`}
                        className="mt-1 inline-block font-cairo text-sm text-primary hover:text-secondry"
                      >
                        {review.product_name}
                      </Link>
                    </div>
                    <time className="font-cairo text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString("ar-EG")}
                    </time>
                  </div>

                  {editingId === review.id ? (
                    <div className="mt-4 space-y-3">
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
                              value <= editingRating ? "text-primary" : "text-gray-300"
                            }`}
                          >
                            <FaStar aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                      <label htmlFor={`dashboard-review-${review.id}`} className="sr-only">
                        نص التقييم
                      </label>
                      <textarea
                        id={`dashboard-review-${review.id}`}
                        value={editingComment}
                        onChange={(event) => setEditingComment(event.target.value)}
                        minLength={10}
                        maxLength={2000}
                        rows={4}
                        className="w-full border border-gray-300 px-3 py-2 font-cairo text-sm leading-7 outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveReview(review.id)}
                          disabled={
                            busyId === review.id ||
                            editingComment.trim().length < 10
                          }
                          className="inline-flex items-center gap-1 bg-secondry px-3 py-2 font-cairo text-sm text-white transition hover:bg-primary disabled:opacity-60"
                        >
                          <MdSave aria-hidden="true" />
                          حفظ
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={busyId === review.id}
                          className="inline-flex items-center gap-1 border border-gray-300 px-3 py-2 font-cairo text-sm text-secondry"
                        >
                          <MdClose aria-hidden="true" />
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        role="img"
                        aria-label={`التقييم ${review.rating} من 5`}
                        className="mt-2 flex gap-1 text-primary"
                      >
                        {Array.from({ length: 5 }, (_, index) => (
                          <FaStar
                            key={index}
                            aria-hidden="true"
                            className={index < review.rating ? "" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <p className="mt-3 whitespace-pre-wrap font-cairo text-sm leading-7 text-gray-700">
                        {review.comment}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {editingId !== review.id && (
                <div className="flex shrink-0 gap-2 lg:pt-1">
                  <button
                    type="button"
                    onClick={() => startEditing(review)}
                    disabled={busyId === review.id}
                    aria-label={`تعديل تقييم ${review.reviewer_name}`}
                    className="inline-flex items-center gap-1 border border-gray-300 px-3 py-2 font-cairo text-sm text-secondry transition hover:border-primary"
                  >
                    <MdEdit aria-hidden="true" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReview(review.id)}
                    disabled={busyId === review.id}
                    aria-label={`حذف تقييم ${review.reviewer_name}`}
                    className="inline-flex items-center gap-1 border border-red-200 px-3 py-2 font-cairo text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <MdDelete aria-hidden="true" />
                    حذف
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
