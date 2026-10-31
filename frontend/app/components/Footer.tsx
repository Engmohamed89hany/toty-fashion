import Link from "next/link";
import { FaArrowLeft, FaGem } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full px-4 font-cairo sm:px-6 md:px-10 lg:px-12">
      <div className="flex flex-col items-start justify-between gap-10 border-b border-gray-500/30 py-10 md:flex-row">
        <div className="max-w-96">
          <Link href="/" aria-label="توتي فاشون - الصفحة الرئيسية">
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/50 text-primary">
                <FaGem aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-semibold text-secondry">
                  توتي فاشون
                </span>
                <span className="text-xs tracking-[0.18em] text-gray-500">
                  TOTY FASHION
                </span>
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500">
            أزياء نسائية تجمع بين الأناقة والراحة، بتصاميم عصرية وخامات مختارة
            بعناية لتكوني على طبيعتك في كل وقت.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondry"
          >
            اكتشفي حكاية توتي
            <FaArrowLeft aria-hidden="true" className="text-xs" />
          </Link>
        </div>

        <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-3 md:max-w-xl md:gap-10">
          <div>
            <h2 className="mb-5 font-semibold text-secondry">تسوّقي</h2>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link
                  href="/#categories-title"
                  className="transition hover:text-primary"
                >
                  التصنيفات
                </Link>
              </li>
              <li>
                <Link
                  href="/#featured"
                  className="transition hover:text-primary"
                >
                  أحدث القطع
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-primary">
                  إنشاء حساب
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-semibold text-secondry">عن توتي</h2>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link href="/about" className="transition hover:text-primary">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-primary">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/" className="transition hover:text-primary">
                  الصفحة الرئيسية
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h2 className="mb-5 font-semibold text-secondry">نحن هنا لمساعدتك</h2>
            <p className="text-sm leading-7 text-gray-500">
              تسوّقي بثقة واكتشفي قطعًا مختارة بعناية لتفاصيل يومك.
            </p>
            <Link
              href="/about"
              className="mt-3 inline-flex items-center gap-2 text-sm text-primary transition hover:text-secondry"
            >
              تعرّفي علينا
              <FaArrowLeft aria-hidden="true" className="text-xs" />
            </Link>
          </div>
        </div>
      </div>

      <p className="py-4 text-center text-xs text-gray-500 sm:text-sm">
        © {new Date().getFullYear()} توتي فاشون. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
};

export default Footer;
