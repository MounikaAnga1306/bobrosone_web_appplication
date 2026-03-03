import React, { useState, forwardRef } from "react";

const Checkbox = forwardRef(
  ({ className = "", checked, onChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(checked || false);

    const handleChange = (e) => {
      if (disabled) return;

      const value = !isChecked;
      setIsChecked(value);

      if (onChange) {
        onChange(value, e);
      }
    };

    return (
      <label
        className={`inline-flex items-center justify-center h-4 w-4 border rounded-sm cursor-pointer 
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-400"}
      ${className}`}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />

        {isChecked && <span className="text-xs font-bold leading-none">✓</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
