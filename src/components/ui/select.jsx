import * as React from "react";

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        className={`flex h-11 w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm px-4 py-2.5 pr-10 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 text-slate-800 dark:text-slate-100 cursor-pointer ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </div>
  );
});
Select.displayName = "Select";

export { Select };
