import React from "react";
const Model = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black/60 mt-12">
      {children}
    </div>
  );
};

export default Model;
