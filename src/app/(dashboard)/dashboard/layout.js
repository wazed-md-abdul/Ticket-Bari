"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { 
  User, Shield, BarChart3, Ticket, LogOut, 
  Menu, X, Home, Sun, Moon, PlusCircle, Calendar, CreditCard, Users, Sparkles,
  ShieldX, Lock, ArrowLeft, UserCheck, Search, Bell, Settings, Zap, Activity, ChevronRight
} from "lucide-react";
import Logo from "../../../components/Logo";

function UnauthorizedView({ userRole }) {
  return (
    <div className="min-h-screen bg-[#070c12] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden nexus-bg">
      <div className="relative z-10 text-center max-w-md w-full nexus-card p-10 rounded-3xl border border-red-500/20 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-500" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-2">Access Restrained</p>
        <h1 className="text-3xl font-black text-white mb-3">403 Unauthorized</h1>
        <p className="text-xs text-slate-400 mb-8">
          You do not have permission to view this view. Your active role is <span className="font-bold text-cyan-400">{userRole}</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
          >
            Go Home
          </Link>
          <Link
            href={`/dashboard/${userRole}`}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 nexus-pill-btn rounded-xl transition-all"
          >
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
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Default to dark mode for NexusX visual theme
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
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

  const isImpersonating = !!(session?.session?.impersonatedBy || session?.impersonatedBy || session?.user?.impersonatedBy);

  const handleStopImpersonating = async () => {
    try {
      const res = await authClient.admin.stopImpersonating();
      if (res?.error) throw new Error(res.error.message || "Failed to stop impersonating.");
      toast.success("Stopped impersonating. Returned to Admin session.");
      window.location.href = "/dashboard/admin?tab=users";
    } catch (err) {
      toast.error(err.message || "Failed to return to admin.");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070c12] text-cyan-400">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
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
  const pathnameRole = pathname.split("/")[2];

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
    <div className="min-h-screen bg-[#070c12] text-slate-100 nexus-bg flex flex-col font-sans">
      
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-cyan-500 text-slate-950 rounded-2xl shadow-xl shadow-cyan-500/20 font-bold"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-md transition-opacity"
        />
      )}

      {/* Sidebar Nav */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 p-4 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-full nexus-card rounded-3xl p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            
            {/* Logo */}
            <div className="px-2 flex items-center justify-between">
              <Link 
                href="/" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 fill-cyan-400" />
                </div>
                <span className="text-lg font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  Ticket<span className="text-cyan-400">Bari</span>
                </span>
              </Link>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {role}
              </span>
            </div>

            {/* Profile Widget Card at Sidebar Top */}
            <div className="p-3.5 rounded-2xl bg-[#091119] border border-slate-800/80 flex items-center gap-3">
              <img
                src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt={session?.user?.name || "User Avatar"}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg"
              />
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 truncate">@{session?.user?.name?.toLowerCase().replace(/\s+/g, '') || "user"}</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-black bg-cyan-500 text-slate-950 rounded uppercase">PRO</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{session?.user?.name}</h4>
              </div>
            </div>

            {/* Sidebar Menu Navigation */}
            <nav className="space-y-1.5">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-xl transition-all"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Go to Homepage</span>
              </Link>

              <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Navigation
              </div>

              {menuItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 text-xs font-bold rounded-xl transition-all ${
                      isActive
                        ? "nexus-active-tab"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? "text-cyan-400" : "text-slate-500"}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </Link>
                );
              })}
            </nav>

            {/* Activate Super / Tier Promo Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950 border border-cyan-500/20 space-y-2.5 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Zap className="w-4 h-4 fill-cyan-400" />
                </div>
                <span className="text-xs font-black text-white">Verified {role.toUpperCase()}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Unlock all features, premium analytics & fast ticket management.
              </p>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 space-y-2 border-t border-slate-800/80">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-all"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-400" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2.5 font-bold text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl z-50">
            <div className="flex items-center gap-2">
              <span className="text-base">🎭</span>
              <span>Impersonation Mode: Currently signed in as <strong>{session.user.name}</strong> ({session.user.email}).</span>
            </div>
            <button
              onClick={handleStopImpersonating}
              className="px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-[10px] uppercase tracking-wider font-black hover:bg-slate-900 transition-colors shadow-md flex items-center gap-1.5 shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Stop Impersonating
            </button>
          </div>
        )}

        {/* Top Header Navbar */}
        <header className="px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-800/40 bg-[#070c12]/80 backdrop-blur-md sticky top-0 z-30">
          
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search routes, tickets, users..."
              className="w-full bg-[#0d1620] border border-slate-800/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Right Action Icons & Quick Deposit / Action Button */}
          <div className="flex items-center gap-3 ml-auto">
            {role === "vendor" ? (
              <Link
                href="/dashboard/vendor?tab=add-ticket"
                className="nexus-pill-btn px-4 py-2 rounded-full text-xs flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Add Ticket
              </Link>
            ) : role === "admin" ? (
              <Link
                href="/dashboard/admin?tab=tickets"
                className="nexus-pill-btn px-4 py-2 rounded-full text-xs flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" /> Manage Tickets
              </Link>
            ) : (
              <Link
                href="/#routes"
                className="nexus-pill-btn px-4 py-2 rounded-full text-xs flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" /> Book Tickets
              </Link>
            )}

            <button className="w-9 h-9 rounded-xl bg-[#0d1620] border border-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center relative transition-colors">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2" />
            </button>

            <button className="w-9 h-9 rounded-xl bg-[#0d1620] border border-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Main Children Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#070c12] text-cyan-400">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SidebarContent>{children}</SidebarContent>
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
