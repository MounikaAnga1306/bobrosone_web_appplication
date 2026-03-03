import React from "react";

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) {
  const variants = {
    primary: "bg-[#FD561E] text-white hover:opacity-90",
    outline: "border border-gray-300 bg-white hover:bg-gray-100",
    ghost: "hover:bg-gray-100",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-semibold transition ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
