import * as React from "react";

export function Alert({ children, variant = "default", className = "" }) {
  const variantClasses = variant === "destructive"
    ? "bg-red-50/70 text-red-800 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-950/50"
    : "bg-white text-slate-800 border-[var(--border)] dark:bg-slate-900 dark:text-slate-100";

  return (
    <div
      role="alert"
      className={`relative w-full rounded-2xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current ${variantClasses} ${className}`}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = "" }) {
  return (
    <h5 className={`mb-1.5 font-black leading-none tracking-wider text-[11px] uppercase ${className}`}>
      {children}
    </h5>
  );
}

export function AlertDescription({ children, className = "" }) {
  return (
    <div className={`text-xs opacity-75 [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  );
}
