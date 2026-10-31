import React from "react";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { TbLabelImportant, TbLabelImportantFilled } from "react-icons/tb";
import Image from "next/image";
import register from "@/public/assests/register.jpg";
const Authlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full md:h-[124%] bg-yellow-200/10 rounded-md overflow-hidden">
      <div className="flex justify-between items-start">
        <div className=" relative w-lg h-full hidden md:block">
          <Image
            src={register}
            alt="register-image"
            className="w-lg h-full object-cover "
          />
          <div className=" absolute inset-0 bg-black/60 px-3 py-6 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h2 className="text-neutral text-3xl font-cairo ">
                TOTY Fashion
              </h2>
              <span className="bg-white/25 px-3 py-2 font-alex text-primary rounded-xl text-sm">
                عضويه النخبه
              </span>
            </div>
            <div>
              <div className="w-[60px] h-[2px] rounded-md bg-primary"></div>
              <h3 className="text-7xl text-white italic">
                جمالك تفاصيل{" "}
                <span className=" block text-primary">يصاغ باتقان</span>{" "}
              </h3>
            </div>
            <div>
              <div className="text-white my-6 flex  items-center gap-x-2 dark:bg-white/[.1] py-3 px-4 rounded-md">
                <VscWorkspaceTrusted className="text-[30px]" />
                <div>
                  <h4 className="text-[22px]">اقمشه مختاره بعنايه فائقه</h4>
                  <p>خامات قطنيه و حريريه معتمده تدوم</p>
                </div>
              </div>
              <div className="text-white flex items-center gap-x-2 dark:bg-white/[.1] py-3 px-4 rounded-md">
                <TbLabelImportantFilled className="text-[30px]" />
                <div>
                  <h4 className="text-[22px]">خصم 15% فوري علي اول طلب </h4>
                  <p>كود ترحيبي بفعل تلقائيا فور التسجيل </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Authlayout;
