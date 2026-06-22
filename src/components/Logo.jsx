"use client";

import React from "react";

/**
 * TicketBari Official Logo Component
 * 
 * Fuses a classic ticket stub with a home roof and window structure.
 * Matches the official brand assets exactly.
 * 
 * Props:
 * - variant: "icon" | "horizontal" | "full" (defaults to "horizontal")
 * - size: "sm" | "md" | "lg" | "xl" (or custom height class like "h-8")
 * - className: custom wrapper class
 * - light: boolean (if true, forces "Ticket" text to be white. Otherwise it dynamically adapts to text-foreground)
 */
export default function Logo({
  variant = "horizontal",
  size = "md",
  className = "",
  light = false,
}) {
  // Determine dimensions based on size
  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-lg", subtitle: "text-[8px]" },
    md: { icon: "w-8 h-8", text: "text-2xl", subtitle: "text-[10px]" },
    lg: { icon: "w-16 h-16", text: "text-4xl", subtitle: "text-[12px]" },
    xl: { icon: "w-24 h-24", text: "text-6xl", subtitle: "text-[16px]" },
  };

  const selectedSize = sizeClasses[size] || { icon: size, text: "text-xl", subtitle: "text-[9px]" };

  // SVG Roofed-Ticket Icon
  const LogoIcon = () => (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${selectedSize.icon} shrink-0 transition-transform duration-300 group-hover:scale-105`}
    >
      {/* Roof */}
      <path
        d="M64 230L256 104L448 230"
        stroke="#0EA5E9"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Window */}
      <rect x="228" y="170" width="24" height="24" rx="4" fill="#0EA5E9" />
      <rect x="260" y="170" width="24" height="24" rx="4" fill="#0EA5E9" />
      <rect x="228" y="202" width="24" height="24" rx="4" fill="#0EA5E9" />
      <rect x="260" y="202" width="24" height="24" rx="4" fill="#0EA5E9" />

      {/* Ticket */}
      <path
        d="M68 300H444C455.046 300 464 308.954 464 320V340C450.193 340 439 351.193 439 365C439 378.807 450.193 390 464 390V411C464 422.046 455.046 431 444 431H68C56.9543 431 48 422.046 48 411V390C61.8071 390 73 378.807 73 365C73 351.193 61.8071 340 48 340V320C48 308.954 56.9543 300 68 300Z"
        fill="url(#ticketGradient)"
      />

      {/* Perforation */}
      <line
        x1="120"
        y1="308"
        x2="120"
        y2="423"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="16 20"
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="ticketGradient"
          x1="48"
          y1="365"
          x2="464"
          y2="365"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Logo Typography (Wordmark)
  const LogoText = () => (
    <span
      className={`font-sans font-black tracking-tight select-none ${selectedSize.text} ${
        light ? "text-white" : "text-foreground"
      }`}
    >
      Ticket
      <span className="text-[#0EA5E9]">Bari</span>
    </span>
  );

  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center text-center space-y-4 group ${className}`}>
        <LogoIcon />
        <div className="flex flex-col items-center">
          <LogoText />
          <span
            className={`font-semibold tracking-widest uppercase mt-1.5 ${
              light ? "text-slate-400" : "text-foreground/50"
            } ${selectedSize.subtitle}`}
          >
            Trusted Home for Every Journey
          </span>
        </div>
      </div>
    );
  }

  // Default: horizontal lockup
  return (
    <div className={`flex items-center space-x-3.5 group ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  );
}
