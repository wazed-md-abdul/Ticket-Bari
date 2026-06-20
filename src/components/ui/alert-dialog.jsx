import * as React from "react";

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default"
}) {
  if (!isOpen) return null;

  const confirmBtnClasses = variant === "destructive"
    ? "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/10"
    : "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-md shadow-emerald-500/10";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-[var(--border)] p-6 rounded-3xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 liftup">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-gray-500 leading-normal">
              {description}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-950 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${confirmBtnClasses}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
