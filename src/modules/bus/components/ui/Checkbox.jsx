import React, { forwardRef } from "react";

const Checkbox = forwardRef(
  (
    { className = "", checked = false, onChange, disabled = false, ...props },
    ref,
  ) => {
    const handleChange = (e) => {
      if (disabled) return;

      onChange?.(e);
    };

    return (
      <label
        className={`inline-flex items-center justify-center h-4 w-4 border rounded-sm cursor-pointer
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${
          checked
            ? "bg-[#FD561E] border-[#FD561E] text-white"
            : "bg-white border-gray-400"
        }
        ${className}`}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />

        {checked && (
          <span className="text-[10px] font-bold leading-none">✓</span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
