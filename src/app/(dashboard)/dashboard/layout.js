"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { 
  User, Shield, BarChart3, Ticket, LogOut, 
  Menu, X, Home, Sun, Moon, PlusCircle, Calendar, CreditCard, Users, Sparkles
} from "lucide-react";

function SidebarContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
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
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    if (typeof window !== "undefined") {
      router.push("/auth/signin");
    }
    return null;
  }

  const role = session.user.role || "user";
  const activeTab = searchParams.get("tab") || "profile";

  let menuItems = [];
  if (role === "admin") {
    menuItems = [
      {
        name: "Admin Profile",
        href: "/dashboard/admin?tab=profile",
        tab: "profile",
        icon: <User className="w-4 h-4" />
      },
      {
        name: "Manage Tickets",
        href: "/dashboard/admin?tab=tickets",
        tab: "tickets",
        icon: <Ticket className="w-4 h-4" />
      },
      {
        name: "Manage Users",
        href: "/dashboard/admin?tab=users",
        tab: "users",
        icon: <Users className="w-4 h-4" />
      },
      {
        name: "Advertise Tickets",
        href: "/dashboard/admin?tab=advertise",
        tab: "advertise",
        icon: <Sparkles className="w-4 h-4" />
      }
    ];
  } else if (role === "vendor") {
    menuItems = [
      {
        name: "Vendor Profile",
        href: "/dashboard/vendor?tab=profile",
        tab: "profile",
        icon: <User className="w-4 h-4" />
      },
      {
        name: "Add Ticket",
        href: "/dashboard/vendor?tab=add-ticket",
        tab: "add-ticket",
        icon: <PlusCircle className="w-4 h-4" />
      },
      {
        name: "My Added Tickets",
        href: "/dashboard/vendor?tab=tickets",
        tab: "tickets",
        icon: <Ticket className="w-4 h-4" />
      },
      {
        name: "Requested Bookings",
        href: "/dashboard/vendor?tab=bookings",
        tab: "bookings",
        icon: <Calendar className="w-4 h-4" />
      },
      {
        name: "Revenue Overview",
        href: "/dashboard/vendor?tab=revenue",
        tab: "revenue",
        icon: <BarChart3 className="w-4 h-4" />
      }
    ];
  } else {
    menuItems = [
      {
        name: "User Profile",
        href: "/dashboard/user?tab=profile",
        tab: "profile",
        icon: <User className="w-4 h-4" />
      },
      {
        name: "My Booked Tickets",
        href: "/dashboard/user?tab=bookings",
        tab: "bookings",
        icon: <Ticket className="w-4 h-4" />
      },
      {
        name: "Transaction History",
        href: "/dashboard/user?tab=transactions",
        tab: "transactions",
        icon: <CreditCard className="w-4 h-4" />
      }
    ];
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      
      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Nav */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-full flex flex-col justify-between py-6 px-4">
          <div className="space-y-6">
            
            {/* Rebrand logo */}
            <div className="px-3">
              <Link href="/" className="text-xl font-black bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                TICKETBARI
              </Link>
              <span className="block text-[10px] text-indigo-500 uppercase tracking-widest font-bold mt-1">
                {role} Panel
              </span>
            </div>

            {/* Sidebar menu */}
            <nav className="space-y-1">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all-300"
              >
                <Home className="w-4 h-4" />
                <span>Go to Homepage</span>
              </Link>
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all-300 ${
                    activeTab === item.tab
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            {/* Theme Toggle in dashboard */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-gray-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 min-h-screen">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SidebarContent>{children}</SidebarContent>
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
