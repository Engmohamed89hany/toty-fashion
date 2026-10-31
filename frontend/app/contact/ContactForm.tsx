"use client";

import { useState, type FormEvent } from "react";
import { FaArrowLeft } from "react-icons/fa";

interface ContactFormProps {
  email: string;
}

export default function ContactForm({ email }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = encodeURIComponent(
      `رسالة من موقع توتي فاشون - ${formData.get("name")}`,
    );
    const body = encodeURIComponent(
      [
        `الاسم: ${formData.get("name")}`,
        `البريد الإلكتروني: ${formData.get("senderEmail")}`,
        `رقم الهاتف: ${formData.get("phone") || "غير مذكور"}`,
        "",
        "الرسالة:",
        formData.get("message"),
      ].join("\n"),
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block font-cairo text-sm font-semibold text-secondry"
          >
            الاسم
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            className="w-full border border-gray-300 bg-transparent px-4 py-3 font-cairo text-sm outline-none transition placeholder:text-gray-400 focus:border-primary"
            placeholder="اكتبي اسمك"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block font-cairo text-sm font-semibold text-secondry"
          >
            البريد الإلكتروني
          </label>
          <input
            id="contact-email"
            name="senderEmail"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="w-full border border-gray-300 bg-transparent px-4 py-3 font-cairo text-sm outline-none transition placeholder:text-gray-400 focus:border-primary"
            placeholder="name@example.com"
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-phone"
          className="mb-2 block font-cairo text-sm font-semibold text-secondry"
        >
          رقم الهاتف <span className="font-normal text-gray-400">(اختياري)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          className="w-full border border-gray-300 bg-transparent px-4 py-3 font-cairo text-sm outline-none transition placeholder:text-gray-400 focus:border-primary"
          placeholder="+20 100 000 0000"
          dir="ltr"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block font-cairo text-sm font-semibold text-secondry"
        >
          رسالتك
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          className="w-full resize-y border border-gray-300 bg-transparent px-4 py-3 font-cairo text-sm leading-7 outline-none transition placeholder:text-gray-400 focus:border-primary"
          placeholder="كيف يمكننا مساعدتك؟"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-3 bg-secondry px-6 py-3.5 font-cairo text-sm font-semibold text-white transition hover:bg-primary"
      >
        إرسال عبر البريد الإلكتروني
        <FaArrowLeft aria-hidden="true" />
      </button>
      {submitted && (
        <p role="status" className="font-cairo text-sm leading-6 text-gray-600">
          فُتح تطبيق البريد برسالتك. تحققي من عنوان البريد التجريبي قبل الإرسال.
        </p>
      )}
    </form>
  );
}
