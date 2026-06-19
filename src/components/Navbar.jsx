"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Sun, Moon, LogOut, LayoutDashboard, Ticket, LogIn } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [theme, setTheme] = useState("light");

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

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!session?.user) return "/auth/signin";
    const role = session.user.role || "user";
    return `/dashboard/${role}`;
  };

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent tracking-wider animate-pulse">
                TICKETBARI
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-indigo-500 ${
                pathname === "/" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/tickets" 
              className={`text-sm font-medium transition-colors hover:text-indigo-500 flex items-center space-x-1 ${
                pathname === "/tickets" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Explore Tickets</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Auth section */}
            {isPending ? (
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Shortcut */}
                <Link
                  href={getDashboardLink()}
                  className="hidden sm:flex items-center space-x-1 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all-300 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile Pic & Log Out */}
                <div className="flex items-center space-x-3">
                  <img
                    src={session.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt={session.user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                  />
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all-300"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg hover:opacity-90 transition-all-300 shadow-lg shadow-indigo-500/10"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
