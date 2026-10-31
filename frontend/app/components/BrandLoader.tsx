const BrandLoader = () => {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-label="جارٍ تحميل توتي فاشون"
      className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-neutral px-6 text-center"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/25" />
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-primary border-l-primary/40 animate-spin" />
        <div className="absolute inset-3 rounded-full border border-dashed border-primary/35 animate-[spin_8s_linear_infinite_reverse]" />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgba(197,160,89,0.18)]">
          <span className="font-alex text-xl font-bold tracking-wide text-primary">
          ت
          </span>
        </div>
      </div>

      <p className="mt-7 font-alex text-2xl font-semibold tracking-wide text-secondry">
        توتي فاشون
      </p>
      <p className="mt-2 font-cairo text-sm text-secondry/65">
        جمالك تفاصيل يصاغ باتقان
      </p>

      <div
        aria-hidden="true"
        className="mt-7 h-1 w-40 overflow-hidden rounded-full bg-primary/15"
      >
        <div className="h-full w-2/5 rounded-full bg-primary animate-[loader-progress_1.4s_ease-in-out_infinite]" />
      </div>
      <span className="sr-only">جارٍ تجهيز تجربتك</span>
    </main>
  );
};

export default BrandLoader;
