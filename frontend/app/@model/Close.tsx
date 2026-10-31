"use client"
import { useRouter } from "next/navigation";
import React from "react";
import { FaXmark } from "react-icons/fa6";

const Close = ({ className }: { className: string }) => {
    const router = useRouter()
  return (
    <button type="button"
    onClick={()=>router.back()}
      className={`w-[25px] h-[25px] rounded-full bg-primary text-white cursor-pointer flex justify-center items-center ${className}`}
    >
      <FaXmark />
    </button>
  );
};

export default Close;
