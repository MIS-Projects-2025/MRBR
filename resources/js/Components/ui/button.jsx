import React from "react";

export function Button({
  children,
  onClick,
  variant = "default",
  className = "",
}) {
  const base =
    "px-4 py-2 rounded-xl font-medium transition shadow-sm";

  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-gray-300 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}