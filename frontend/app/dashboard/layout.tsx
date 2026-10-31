import React from "react";
import SideBar from "./components/SideBar";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { notFound } from "next/navigation";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const DashbardLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookie: ReadonlyRequestCookies = await cookies();
  const role = cookie.get("role")?.value;
  if (role !== "admin") {
    notFound();
  }
  return (
    <div className="min-h-screen font-alex">
      <SideBar />
      <main className="min-h-screen w-full md:w-[95%] md:mr-32 min-w-0 px-4 py-5 sm:px-6 md:px-8">
        {children}
      </main>
    </div>
  ); 
};

export default DashbardLayout;
