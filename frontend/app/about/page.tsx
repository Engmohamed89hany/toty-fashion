import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { FaArrowLeft, FaGem, FaHeart, FaLeaf, FaRegStar } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
  defaultDescription,
} from "@/lib/seo";

const images = {
  hero: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85",
  story:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
  details:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
  lifestyle:
    "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=85",
};

export const metadata: Metadata = {
  title: "من نحن",
  description: `تعرفي على قصة توتي فاشون ورؤيتنا للأزياء النسائية التي تجمع بين الأناقة والراحة. ${defaultDescription}`,
  alternates: {
    canonical: "/about",
  },
  openGraph: createOpenGraphMetadata({
    title: "من نحن | توتي فاشون",
    description:
      "تعرّفي على توتي فاشون، حيث تلتقي الأناقة بالراحة في أزياء نسائية بخامات مختارة بعناية.",
    url: "/about",
  }),
  twitter: createTwitterMetadata({
    title: "من نحن | توتي فاشون",
    description: `تعرفي على قصة توتي فاشون. ${defaultDescription}`,
  }),
};

const values = [
  {
    title: "أناقة تشبهك",
    description:
      "نختار تصاميم أنثوية عصرية تمنحك مساحة للتعبير عن أسلوبك في كل يوم.",
    icon: FaRegStar,
  },
  {
    title: "راحة من أول لمسة",
    description:
      "نهتم بملمس الخامة وتفاصيلها لنقدم قطعًا تجمع بين الإحساس الجميل والاستخدام اليومي.",
    icon: FaHeart,
  },
  {
    title: "اختيار بعناية",
    description:
      "كل تفصيلة لها أهميتها، من الخامات المختارة إلى اللمسات التي تكمل إطلالتك.",
    icon: FaGem,
  },
  {
    title: "جمال يدوم",
    description:
      "نؤمن أن القطعة المفضلة هي التي تعودين إليها بثقة، موسمًا بعد موسم.",
    icon: FaLeaf,
  },
];

const AboutPage = () => {
  return (
    <main className="pb-16">
      <section
        aria-labelledby="about-title"
        className="relative isolate flex min-h-[430px] items-end overflow-hidden bg-gray-900 sm:min-h-[540px] lg:min-h-[620px]"
      >
        <Image
          src={images.hero}
          alt="إطلالة أنيقة تعكس روح توتي فاشون"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 83vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="relative z-10 max-w-3xl px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <p className="mb-4 flex items-center gap-3 font-cairo text-sm font-semibold tracking-wide text-white/85">
            <span className="h-px w-10 bg-primary" />
            حكاية أناقة وراحة
          </p>
          <h1
            id="about-title"
            className="text-3xl leading-relaxed sm:text-4xl lg:text-5xl"
          >
            نؤمن أن الأناقة تبدأ
            <span className="block text-primary">من شعورك بنفسك</span>
          </h1>
          <p className="mt-4 max-w-2xl font-cairo text-base leading-8 text-white/85 sm:text-lg">
            توتي فاشون مساحة تحتفي بأنوثتك، وتجمع بين التصاميم الراقية والخامات
            المريحة لتكون كل قطعة أقرب إلى أسلوبك.
          </p>
          <Link
            href="/#featured"
            className="mt-7 inline-flex items-center gap-3 bg-primary px-6 py-3.5 font-cairo text-sm font-semibold text-white transition hover:bg-white hover:text-secondry"
          >
            اكتشفي اختياراتنا
            <FaArrowLeft aria-hidden="true" />
          </Link>
        </div>
        <span className="absolute left-5 top-5 z-10 border border-white/50 bg-black/20 px-3 py-2 font-cairo text-xs text-white backdrop-blur-sm sm:left-8 sm:top-8">
          TOTY FASHION
        </span>
      </section>

      <section
        aria-labelledby="story-title"
        className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24"
      >
        <div className="relative mx-auto min-h-[360px] w-full max-w-xl sm:min-h-[480px] lg:mx-0">
          <Image
            src={images.story}
            alt="لحظات من عالم الأزياء والاختيارات اليومية"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover"
          />
          <div className="absolute -bottom-4 -left-3 max-w-[220px] bg-secondry px-5 py-4 text-white sm:-left-5 sm:px-7 sm:py-5">
            <p className="font-cairo text-xs text-primary">TOTY FASHION</p>
            <p className="mt-1 text-base">تفاصيل تختارينها لنفسك</p>
          </div>
        </div>

        <div className="lg:py-8">
          <p className="mb-3 font-cairo text-sm font-semibold text-primary">
            قصتنا
          </p>
          <h2
            id="story-title"
            className="max-w-xl text-2xl leading-relaxed text-secondry sm:text-3xl"
          >
            من حب التفاصيل… إلى إطلالة تشبهك
          </h2>
          <div className="mt-5 space-y-4 font-cairo leading-8 text-gray-600">
            <p>
              بدأت حكاية توتي فاشون من فكرة بسيطة: أن تشعري بالراحة والثقة في
              ملابسك، من دون أن تتنازلي عن الأناقة التي تحبينها.
            </p>
            <p>
              لذلك نهتم بتقديم اختيارات تجمع بين الجمال والعملية، من الملابس
              اليومية إلى القطع المنزلية، مع عناية خاصة بالخامات والقصّات
              والتفاصيل الصغيرة.
            </p>
            <p>
              نريد أن تكون تجربتك معنا سهلة، دافئة، ومليئة بقطع تختارينها لأنك
              تحبينها فعلًا.
            </p>
          </div>
          <Link
            href="/#categories-title"
            className="mt-7 inline-flex items-center gap-2 font-cairo text-sm font-semibold text-primary transition hover:text-secondry"
          >
            تصفحي التصنيفات
            <FaArrowLeft aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="values-title"
        className="bg-neutral px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 font-cairo text-sm font-semibold text-primary">
            ما يهمنا
          </p>
          <h2
            id="values-title"
            className="text-2xl leading-relaxed text-secondry sm:text-3xl"
          >
            اختياراتنا تبدأ من إحساسك
          </h2>
          <p className="mt-3 font-cairo leading-7 text-gray-600">
            قيم بسيطة نضعها في كل قطعة وفي كل تجربة تسوق.
          </p>
        </div>
        <div className="mx-auto mt-9 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ title, description, icon: Icon }) => (
            <article key={title} className="bg-white p-5 sm:p-6">
              <Icon aria-hidden="true" className="text-2xl text-primary" />
              <h3 className="mt-4 text-lg text-secondry">{title}</h3>
              <p className="mt-2 font-cairo text-sm leading-7 text-gray-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="quality-title"
        className="grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24"
      >
        <div>
          <p className="mb-3 font-cairo text-sm font-semibold text-primary">
            عناية في كل تفصيلة
          </p>
          <h2
            id="quality-title"
            className="max-w-xl text-2xl leading-relaxed text-secondry sm:text-3xl"
          >
            جمال تختارينه، وراحة تستحقينها
          </h2>
          <p className="mt-4 max-w-2xl font-cairo leading-8 text-gray-600">
            نؤمن أن الملابس جزء من يومك وشعورك. لهذا نبحث عن التوازن بين التصميم
            الجميل، والخامة المريحة، والتفاصيل التي تجعل القطعة عملية وقريبة
            منك.
          </p>
          <ul className="mt-6 space-y-4 font-cairo text-sm text-secondry">
            <li className="flex items-start gap-3">
              <MdOutlineVerified
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-xl text-primary"
              />
              عناية باختيار الأقمشة والملمس.
            </li>
            <li className="flex items-start gap-3">
              <MdOutlineVerified
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-xl text-primary"
              />
              تصاميم ترافقك في البيت وخارجه.
            </li>
            <li className="flex items-start gap-3">
              <MdOutlineVerified
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-xl text-primary"
              />
              تفاصيل أنثوية بلمسة عصرية.
            </li>
          </ul>
        </div>
        <div className="relative min-h-[340px] overflow-hidden bg-gray-100 sm:min-h-[460px]">
          <Image
            src={images.details}
            alt="ألوان وأقمشة وتفاصيل أزياء مختارة"
            fill
            sizes="(max-width: 1024px) 100vw, 38vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-secondry px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <Image
          src={images.lifestyle}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 83vw"
          className="object-cover opacity-20"
        />
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="font-cairo text-sm font-semibold text-primary">
            اختاري ما يشبهك
          </p>
          <h2 className="mt-3 text-2xl leading-relaxed sm:text-3xl">
            قطعتك القادمة بانتظارك
          </h2>
          <p className="mt-3 font-cairo leading-7 text-white/75">
            اكتشفي تشكيلتنا واختاري التفاصيل التي تجعل يومك أجمل.
          </p>
          <Link
            href="/#featured"
            className="mt-6 inline-flex items-center gap-3 bg-primary px-6 py-3 font-cairo text-sm font-semibold text-white transition hover:bg-white hover:text-secondry"
          >
            تسوّقي الآن
            <FaArrowLeft aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
