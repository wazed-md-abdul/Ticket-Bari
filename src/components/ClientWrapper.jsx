"use client";

import { useState, useEffect } from "react";
import Lenis from "lenis";
import { Ticket } from "lucide-react";
import { Toaster } from "sonner";

export default function ClientWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Hide loader after 1.2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => {
      lenis.destroy();
      clearTimeout(timer);
    };
  }, []);

  // Sync theme with localStorage + html class (for Toaster)
  useEffect(() => {
    const syncTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    // Initial sync
    syncTheme();

    // Watch for class changes on <html>
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Toaster
        richColors
        closeButton
        position="top-right"
        theme={theme}
        toastOptions={{
          style: {
            fontFamily: "inherit",
          },
          classNames: {
            toast: "font-sans text-sm",
            title: "font-bold",
          },
        }}
      />
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] transition-opacity duration-500">
          {/* Wave/Glow circles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] rounded-full bg-[var(--primary)] blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] rounded-full bg-[var(--secondary)] blur-[120px] animate-pulse"></div>
          </div>

          <div className="relative flex flex-col items-center space-y-6">
            {/* Spinning/pulsing ticket icon */}
            <div className="relative flex items-center justify-center p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl shadow-emerald-500/5 animate-[float_3s_ease-in-out_infinite]">
              <Ticket className="w-12 h-12 text-[var(--primary)] animate-pulse" />
              {/* Spinning loading rings */}
              <div className="absolute inset-0 border-2 border-[var(--primary)] border-t-transparent rounded-3xl animate-spin"></div>
            </div>

            {/* Glowing Brand text */}
            <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              TICKETBARI
            </h1>

            {/* Micro loading progress bar */}
            <div className="w-48 h-1 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] animate-[loadingBar_1.2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      )}
      <div className={loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        {children}
      </div>
    </>
  );
}
