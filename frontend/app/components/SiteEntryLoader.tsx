"use client";

import { useEffect, useState } from "react";
import BrandLoader from "./BrandLoader";

const SiteEntryLoader = ({ children }: { children: React.ReactNode }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      {children}
      {showLoader && (
        <div className="fixed inset-0 z-[100]">
          <BrandLoader />
        </div>
      )}
    </>
  );
};

export default SiteEntryLoader;
