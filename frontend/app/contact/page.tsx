import type { Metadata } from "next";
import Link from "next/link";
import {
  FaArrowLeft,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import ContactForm from "./ContactForm";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/seo";

const contactDetails = {
  email: "mohamedreal910@gmail.com",
  phone: "+20 1061765759",
  address:"الصنافين - مقابل دوار ابو بلال - محل توتي فاشون",
  hours: "من السبت إلى الخميس، 10 صباحًا – 10 مساءً",
};

export const metadata: Metadata = {
  title: "تواصلي معنا",
  description:
    "يسعد فريق توتي فاشون بمساعدتك والإجابة عن استفساراتك حول الطلبات والمنتجات.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: createOpenGraphMetadata({
    title: "تواصلي معنا | توتي فاشون",
    description:
      "تواصلي مع فريق توتي فاشون للاستفسار عن المنتجات والطلبات.",
    url: "/contact",
  }),
  twitter: createTwitterMetadata({
    title: "تواصلي معنا | توتي فاشون",
    description:
      "تواصلي مع فريق توتي فاشون للاستفسار عن المنتجات والطلبات.",
  }),
};

const contactMethods = [
  {
    title: "البريد الإلكتروني",
    value: contactDetails.email,
    href: `mailto:${contactDetails.email}`,
    icon: FaEnvelope,
  },
  {
    title: "الهاتف",
    value: contactDetails.phone,
    href: `tel:${contactDetails.phone.replaceAll(" ", "")}`,
    icon: FaPhoneAlt,
  },
  {
    title: "موقعنا",
    value: contactDetails.address,
    icon: FaMapMarkerAlt,
  },
  {
    title: "ساعات العمل",
    value: contactDetails.hours,
    icon: FaClock,
  },
];

export default function ContactPage() {
  return (
    <main className="pb-16">
      <section
        aria-labelledby="contact-title"
        className="relative isolate overflow-hidden bg-secondry px-6 py-14 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24"
      >
        <div
          aria-hidden="true"
          className="absolute -left-20 -top-32 h-80 w-80 rounded-full border border-primary/30 sm:-left-10"
        />
        <div
          aria-hidden="true"
          className="absolute -left-10 -top-20 h-60 w-60 rounded-full border border-primary/20"
        />
        <div className="relative max-w-3xl">
          <p className="mb-4 flex items-center gap-3 font-cairo text-sm font-semibold text-primary">
            <span aria-hidden="true" className="h-px w-10 bg-primary" />
            نحن هنا لمساعدتك
          </p>
          <h1
            id="contact-title"
            className="text-3xl leading-relaxed sm:text-4xl lg:text-5xl"
          >
            يسعدنا أن نسمع
            <span className="text-primary"> منكِ</span>
          </h1>
          <p className="mt-4 max-w-2xl font-cairo text-base leading-8 text-white/75 sm:text-lg">
            لديكِ سؤال عن منتج أو طلب؟ أرسلي لنا رسالة، وسيسعد فريق توتي فاشون
            بمساعدتك.
          </p>
          <Link
            href="/#featured"
            className="mt-7 inline-flex items-center gap-3 border border-white/30 px-5 py-3 font-cairo text-sm font-semibold transition hover:border-primary hover:text-primary"
          >
            تصفحي أحدث القطع
            <FaArrowLeft aria-hidden="true" />
          </Link>
        </div>
        <span className="absolute left-5 top-5 border border-white/20 px-3 py-2 font-cairo text-xs text-white/75 sm:left-8 sm:top-8">
          TOTY FASHION
        </span>
      </section>

      <section
        aria-label="بيانات التواصل"
        className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {contactMethods.map(({ title, value, href, icon: Icon }) => {
          const content = (
            <>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-cairo text-xs text-gray-500">
                  {title}
                </span>
                <span className="mt-1 block break-words text-sm text-secondry">
                  {value}
                </span>
              </span>
            </>
          );

          return (
            <article
              key={title}
              className="flex min-h-24 items-center gap-3 border border-gray-200 bg-white p-4"
            >
              {href ? (
                <a
                  href={href}
                  className="flex min-w-0 items-center gap-3 transition hover:text-primary"
                >
                  {content}
                </a>
              ) : (
                <div className="flex min-w-0 items-center gap-3">
                  {content}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section
        aria-labelledby="message-title"
        className="grid overflow-hidden border border-gray-200 bg-white lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div className="bg-neutral px-6 py-9 sm:px-9 sm:py-12 lg:px-12">
          <p className="font-cairo text-sm font-semibold text-primary">
            راسلينا
          </p>
          <h2
            id="message-title"
            className="mt-3 text-2xl leading-relaxed text-secondry sm:text-3xl"
          >
            كيف يمكننا مساعدتك؟
          </h2>
          <p className="mt-4 font-cairo text-sm leading-7 text-gray-600">
            املئي البيانات وسيفتح تطبيق البريد لديكِ برسالة جاهزة للإرسال. يسعدنا
            مساعدتك في أي استفسار.
          </p>
          <div className="mt-8 border-t border-gray-200 pt-5">
            <p className="font-cairo text-sm leading-7 text-gray-600">
              بيانات التواصل المعروضة في هذه الصفحة تجريبية. استبدلي البريد
              الإلكتروني ورقم الهاتف والعنوان ببيانات متجرك قبل النشر.
            </p>
          </div>
        </div>
        <div className="px-6 py-8 sm:px-9 sm:py-12 lg:px-12">
          <ContactForm email={contactDetails.email} />
        </div>
      </section>
    </main>
  );
}
