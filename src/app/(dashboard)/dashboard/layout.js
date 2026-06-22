"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { 
  User, Shield, BarChart3, Ticket, LogOut, 
  Menu, X, Home, Sun, Moon, PlusCircle, Calendar, CreditCard, Users, Sparkles,
  ShieldX, Lock, ArrowLeft
} from "lucide-react";

function UnauthorizedView({ userRole }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl shadow-red-500/10">
              <ShieldX className="w-14 h-14 text-red-500" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.4em] text-red-500/70 mb-3">Error 403</p>

        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
          Access{" "}
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Denied
          </span>
        </h1>

        <p className="text-sm text-foreground/50 font-medium mb-2">
          তুমি এই পেইজ দেখার অনুমতি পাওনি।
        </p>
        <p className="text-xs text-foreground/40 mb-10">
          You don&apos;t have permission to access this page. Your role is{" "}
          <span className="font-bold text-[var(--primary)]">{userRole}</span>.
        </p>

        <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent mx-auto mb-10" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider bg-foreground text-background rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href={`/dashboard/${userRole}`}
            className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Theme sync
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

  // pathname থেকে dashboard role বের করো
  // e.g. /dashboard/vendor → "vendor"
  const pathnameRole = pathname.split("/")[2]; // dashboard/[role]

  // Role match না হলে Unauthorized দেখাও
  if (pathnameRole && pathnameRole !== role) {
    return <UnauthorizedView userRole={role} />;
  }
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Nav */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-full flex flex-col justify-between py-6 px-4">
          <div className="space-y-6">
            
            {/* Rebrand logo */}
            <div className="px-3">
              <Link 
                href="/" 
                onClick={() => setSidebarOpen(false)}
                className="text-xl font-black bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent"
              >
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
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all-300"
              >
                <Home className="w-4 h-4" />
                <span>Go to Homepage</span>
              </Link>
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
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
