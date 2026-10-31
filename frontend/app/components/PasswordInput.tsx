"use client";

import { useState, type InputHTMLAttributes } from "react";
import { FaEye } from "react-icons/fa";
import { IoEyeOff } from "react-icons/io5";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const PasswordInput = (props: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="my-3 flex items-center gap-x-2 rounded-2xl border border-primary bg-gray-100 px-3 py-2">
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className="w-full border-none bg-transparent outline-none"
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        aria-pressed={isVisible}
        className="shrink-0 cursor-pointer text-secondry"
      >
        {isVisible ? (
          <IoEyeOff aria-hidden="true" />
        ) : (
          <FaEye aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
