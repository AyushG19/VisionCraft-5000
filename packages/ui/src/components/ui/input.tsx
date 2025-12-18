import React from "react";
import { InputProps } from "../types";

const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200">
          {icon}
        </div>
        <input
          id={id}
          className={`
            block w-full pl-10 pr-3 py-2.5 
            bg-slate-800/50 border border-slate-700 
            rounded-xl text-slate-200 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
            transition-all duration-200 ease-in-out
            hover:border-slate-600
            ${error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""}
            ${className || ""}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default Input;
