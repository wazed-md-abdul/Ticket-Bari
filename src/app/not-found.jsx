"use client";

import Link from "next/link";
import { Ticket, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--primary)] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg text-center space-y-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
        <div className="relative w-24 h-24 bg-[var(--primary)]/10 text-[var(--primary)] rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <Ticket className="w-12 h-12" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white font-extrabold items-center justify-center">!</span>
          </span>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-black tracking-widest text-[var(--primary)] uppercase">Error 404</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Route Not Found</h1>
          <p className="text-sm text-foreground/60 leading-relaxed font-medium">
            Lost your ticket? The itinerary or station you are trying to reach does not exist, or has been moved to a new route.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 bg-[var(--primary)] hover:opacity-95 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go Back Home</span>
          </Link>
          <Link
            href="/tickets"
            className="flex-1 py-3 border border-[var(--border)] bg-[var(--input)] hover:bg-[var(--card)] text-foreground font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>Search Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
