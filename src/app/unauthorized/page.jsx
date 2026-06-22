"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ShieldX, Home, ArrowLeft, Lock } from "lucide-react";

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  const getDashboardLink = () => {
    const role = session?.user?.role || "user";
    return `/dashboard/${role}`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-400/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">

        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl shadow-red-500/10">
              <ShieldX className="w-14 h-14 text-red-500" strokeWidth={1.5} />
            </div>
            {/* Lock badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* 403 code */}
        <p className="text-xs font-black uppercase tracking-[0.4em] text-red-500/70 mb-3">
          Error 403
        </p>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
          Access{" "}
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Denied
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm text-foreground/50 font-medium leading-relaxed mb-2">
          তুমি এই পেইজ দেখার অনুমতি পাওনি।
        </p>
        <p className="text-xs text-foreground/35 mb-10">
          You don&apos;t have permission to access this page.{" "}
          {session?.user && (
            <span>
              Your role is{" "}
              <span className="font-bold text-[var(--primary)]">
                {session.user.role}
              </span>
              .
            </span>
          )}
        </p>

        {/* Divider */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent mx-auto mb-10" />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider bg-foreground text-background rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          {session?.user && (
            <Link
              href={getDashboardLink()}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              My Dashboard
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
