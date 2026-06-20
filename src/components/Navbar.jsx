"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Sun, Moon, LogOut, LayoutDashboard, Ticket, LogIn, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const getDashboardLink = () => {
    if (!session?.user) return "/auth/signin";
    const role = session.user.role || "user";
    return `/dashboard/${role}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card)]/75 backdrop-blur-xl border-b border-[var(--border)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-xl shadow-md shadow-emerald-500/10 transition-transform duration-300 group-hover:scale-110">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-widest text-slate-800 dark:text-slate-100 font-sans select-none">
                TICKET<span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">BARI</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 bg-[var(--input)] p-1 rounded-2xl border border-[var(--border)]">
            <Link 
              href="/" 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                pathname === "/" 
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/tickets" 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center space-x-1.5 ${
                pathname === "/tickets" 
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Explore Tickets</span>
            </Link>
          </div>

          {/* User & Theme Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--input)] text-slate-600 dark:text-slate-400 hover:scale-105 active:scale-95 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Session States */}
            {isPending ? (
              <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin"></div>
            ) : session?.user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl hover:opacity-95 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center space-x-2 bg-[var(--input)] border border-[var(--border)] rounded-2xl p-1 pr-2.5">
                  <img
                    src={session.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt={session.user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 max-w-[80px] truncate">
                    {session.user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-[var(--primary)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 shadow-md transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer Menu */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              pathname === "/" ? "bg-slate-100 dark:bg-slate-900 text-[var(--primary)]" : "text-slate-700 dark:text-slate-300"
            }`}
          >
            Home
          </Link>
          <Link
            href="/tickets"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 ${
              pathname === "/tickets" ? "bg-slate-100 dark:bg-slate-900 text-[var(--primary)]" : "text-slate-700 dark:text-slate-300"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Explore Tickets</span>
          </Link>

          <hr className="border-slate-200/50 dark:border-slate-800/50" />

          {isPending ? (
            <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mx-auto"></div>
          ) : session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 px-4 py-2">
                <img
                  src={session.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                  alt={session.user.name}
                  className="w-9 h-9 rounded-full object-cover border"
                />
                <div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-150">{session.user.name}</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">{session.user.role}</span>
                </div>
              </div>
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block py-3 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 text-xs font-black uppercase tracking-wider text-red-500 bg-red-50/50 dark:bg-red-950/10 rounded-xl flex items-center justify-center space-x-2 border border-red-150/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-black uppercase tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
