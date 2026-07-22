"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, authClient, updateUser } from "@/lib/auth-client";
import CountUp from "@/components/CountUp";
import {
  User, Mail, Shield, ShieldAlert, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, AlertTriangle, ShieldCheck, Ticket, Users, Sparkles,
  TrendingUp, Clock, Eye, Ban, Search, ChevronLeft, ChevronRight,
  BarChart3, Activity, Globe, Calendar, Filter, Edit3, X, LogIn, UserCheck, ArrowUpRight
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Clock state
  const [currentTime, setCurrentTime] = useState(null);
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setEditName(session.user.name || "");
      setEditImage(session.user.image || "");
    }
  }, [session]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);
    try {
      let imageUrl = editImage;

      if (editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);

        const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "e137d11ae145b9f6610a6d8377ef5413";
        const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Failed to upload avatar image to ImgBB (status ${uploadRes.status}).`;
          throw new Error(errMsg);
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.data?.url || "";
      }

      await updateUser({
        name: editName,
        image: imageUrl,
      });
      setIsProfileModalOpen(false);
      toast.success("Profile updated successfully!");
      window.location.reload();
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & filter states
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Alert Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
    variant: "default"
  });

  const triggerConfirm = ({ title, description, onConfirm, variant = "default" }) => {
    setConfirmDialog({ isOpen: true, title, description, onConfirm, variant });
  };

  // Tab State via Search Params (matching sidebar)
  const activeTab = searchParams.get("tab") || "profile";

  // Pagination states
  const [ticketPage, setTicketPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 8;

  const getToken = async () => {
    try {
      const tokenRes = await authClient.token();
      return tokenRes?.data?.token || "";
    } catch (e) {
      console.error("Error retrieving JWT token:", e);
      return "";
    }
  };

  const fetchData = async () => {
    if (!session?.user) return;
    const token = await getToken();

    // Fetch all users
    try {
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }

    // Fetch all tickets
    try {
      const ticketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tickets`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  // Reset pagination when switching tabs or filters
  useEffect(() => { setTicketPage(1); }, [ticketSearch, ticketStatusFilter]);
  useEffect(() => { setUserPage(1); }, [userSearch, userRoleFilter]);

  const handleTicketStatus = async (ticketId, status) => {
    setError("");
    setSuccess("");
    setActionLoading(ticketId);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to moderate ticket.");
      const successMsg = `Ticket ${status} successfully`;
      setSuccess(successMsg);
      toast.success(successMsg);
      fetchData();
    } catch (err) {
      const errMsg = err.message || "Action failed.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setActionLoading("");
    }
  };

  const handleAdToggle = async (ticketId, currentAdState) => {
    setError("");
    setSuccess("");
    setActionLoading(ticketId + "_ad");
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isAdvertised: !currentAdState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update advertisement slot.");
      const successMsg = `Advertisement ${!currentAdState ? "enabled" : "disabled"} successfully.`;
      setSuccess(successMsg);
      toast.success(successMsg);
      fetchData();
    } catch (err) {
      const errMsg = err.message || "Failed to toggle advertisement slot.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setActionLoading("");
    }
  };

  const executeRoleChange = async (userId, newRole) => {
    setError("");
    setSuccess("");
    setActionLoading(userId + "_role");
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change user role.");
      const msg = `User role changed to ${newRole}.`;
      setSuccess(msg);
      toast.success(msg);
      fetchData();
    } catch (err) {
      const errMsg = err.message || "Failed to change user role.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setActionLoading("");
    }
  };

  const handleRoleChange = (userId, newRole) => {
    triggerConfirm({
      title: "Change User Role?",
      description: `Are you sure you want to change this user's role to "${newRole}"? This will alter their permissions immediately.`,
      onConfirm: () => executeRoleChange(userId, newRole),
    });
  };

  const executeFraudToggle = async (userId, currentFraudState) => {
    setError("");
    setSuccess("");
    setActionLoading(userId + "_fraud");
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isFraud: !currentFraudState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update fraud flag.");
      const msg = `Fraud status updated successfully.`;
      setSuccess(msg);
      toast.success(msg);
      fetchData();
    } catch (err) {
      const errMsg = err.message || "Failed to update fraud flag.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setActionLoading("");
    }
  };

  const handleFraudToggle = (userId, currentFraudState) => {
    triggerConfirm({
      title: currentFraudState ? "Clear Fraud Flag?" : "Mark as Fraud?",
      description: currentFraudState
        ? "Clear fraud flag? User will regain full access."
        : "Flag as fraud? User will be blocked from all operations.",
      variant: currentFraudState ? "default" : "destructive",
      onConfirm: () => executeFraudToggle(userId, currentFraudState),
    });
  };

  const executeImpersonate = async (targetUserId, targetUserName) => {
    setError("");
    setSuccess("");
    setActionLoading(targetUserId + "_impersonate");
    try {
      const res = await authClient.admin.impersonateUser({
        userId: targetUserId,
      });
      if (res?.error) {
        throw new Error(res.error.message || "Failed to log in as user.");
      }
      toast.success(`Logged in as ${targetUserName}! Redirecting...`);
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err) {
      const errMsg = err.message || "Failed to log in as user.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setActionLoading("");
    }
  };

  const handleImpersonate = (targetUserId, targetUserName, targetUserEmail) => {
    triggerConfirm({
      title: "Log In As User?",
      description: `You will temporarily log in as "${targetUserName}" (${targetUserEmail}). You can stop impersonating and return to your Admin account anytime using the top banner.`,
      variant: "default",
      onConfirm: () => executeImpersonate(targetUserId, targetUserName),
    });
  };

  // ---- Status badge helper ----
  const getStatusBadge = (status) => {
    const s = status || "pending";
    if (s === "approved") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
          <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> Approved
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3 h-3 mr-1 text-rose-400" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Clock className="w-3 h-3 mr-1 text-amber-400" /> Pending
      </span>
    );
  };

  // ---- Computed stats ----
  const totalTicketsCount = tickets.length;
  const approvedCount = tickets.filter(t => t.status === "approved").length;
  const pendingCount = tickets.filter(t => t.status === "pending").length;
  const rejectedCount = tickets.filter(t => t.status === "rejected").length;
  const activeAdsCount = tickets.filter(t =>
    t.isAdvertised &&
    t.status === "approved" &&
    t.ticketQuantity > 0 &&
    new Date(t.departureDateTime) > new Date()
  ).length;
  const totalUsersCount = users.length;
  const vendorCount = users.filter(u => u.role === "vendor").length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const fraudUsersCount = users.filter(u => u.isFraud).length;

  // ---- Filtered / paginated tickets ----
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !ticketSearch ||
      t.title?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.from?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.to?.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = ticketStatusFilter === "all" || t.status === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalTicketPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentTickets = filteredTickets.slice((ticketPage - 1) * itemsPerPage, ticketPage * itemsPerPage);

  // ---- Filtered / paginated users ----
  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  // ---- Advertise tab: only approved tickets ----
  const approvedTickets = tickets.filter(t =>
    t.status === "approved" &&
    new Date(t.departureDateTime) > new Date()
  );
  const [adPage, setAdPage] = useState(1);
  const adPerPage = 6;
  const totalAdPages = Math.ceil(approvedTickets.length / adPerPage);
  const currentAdTickets = approvedTickets.slice((adPage - 1) * adPerPage, adPage * adPerPage);

  // ---- Reusable Pagination Component ----
  const Pagination = ({ page, totalPages, setPage }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 pt-6">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2.5 rounded-2xl border border-slate-800 bg-[#0d1620] text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-9 h-9 rounded-2xl text-xs font-black transition-all ${
              p === page
                ? "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30"
                : "border border-slate-800 bg-[#0d1620] hover:bg-slate-800 text-slate-400"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2.5 rounded-2xl border border-slate-800 bg-[#0d1620] text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // ---- Skeleton loader ----
  const SkeletonRows = ({ count = 4 }) => (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-900/60 border border-slate-800/50 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Error/Success alerts */}
      {error && (
        <Alert variant="destructive" className="bg-rose-950/40 border-rose-500/30 text-rose-300">
          <ShieldAlert className="w-4 h-4" />
          <AlertTitle>Action Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-950/30 text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* ============ TAB 1: ADMIN PROFILE ============ */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          
          {/* Admin Profile Banner */}
          <section className="relative overflow-hidden nexus-card rounded-3xl p-8 border border-cyan-500/20">
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <img
                    src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt={session?.user?.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/60 shadow-xl nexus-glow-cyan"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center border-2 border-[#070c12]">
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl font-black text-white">{session?.user?.name}</h1>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">
                      SUPER ADMIN
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      {session?.user?.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">
                      <Shield className="w-3 h-3" />
                      System Access Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Time and Action */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {currentTime && (
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-[#070c12]/80 px-4 py-2.5 rounded-2xl border border-slate-800">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </span>
                )}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-5 py-2.5 nexus-pill-btn rounded-2xl text-xs flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </section>

          {/* Overview Stats Grid (NexusX Style) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Transport Routes", value: totalTicketsCount, icon: Ticket, color: "#00f2fe", pct: "+12.5%" },
              { label: "Registered Users", value: totalUsersCount, icon: Users, color: "#10b981", pct: "+8.2%" },
              { label: "Active Advertisements", value: activeAdsCount, icon: Sparkles, color: "#f59e0b", pct: "Live" },
              { label: "Fraud Flagged Users", value: fraudUsersCount, icon: AlertTriangle, color: "#f43f5e", pct: "Flagged" },
            ].map((stat, i) => (
              <div key={i} className="nexus-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">
                    {(loadingTickets && i < 2) || (loadingUsers && i >= 1) ? "..." : <CountUp end={stat.value} />}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {stat.pct}
                  </span>
                </div>
              </div>
            ))}
          </section>

          {/* Ticket Status Breakdown Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="nexus-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Tickets</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-400">
                  {loadingTickets ? "..." : <CountUp end={approvedCount} />}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {totalTicketsCount ? Math.round((approvedCount / totalTicketsCount) * 100) : 0}%
                </span>
              </div>
              <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: totalTicketsCount ? `${(approvedCount / totalTicketsCount) * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div className="nexus-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-amber-400">
                  {loadingTickets ? "..." : <CountUp end={pendingCount} />}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {totalTicketsCount ? Math.round((pendingCount / totalTicketsCount) * 100) : 0}%
                </span>
              </div>
              <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: totalTicketsCount ? `${(pendingCount / totalTicketsCount) * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div className="nexus-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected Tickets</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-rose-400">
                  {loadingTickets ? "..." : <CountUp end={rejectedCount} />}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {totalTicketsCount ? Math.round((rejectedCount / totalTicketsCount) * 100) : 0}%
                </span>
              </div>
              <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all duration-1000"
                  style={{ width: totalTicketsCount ? `${(rejectedCount / totalTicketsCount) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </section>

          {/* User Role Distribution */}
          <section className="nexus-card rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Platform Role Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Regular Passengers", count: totalUsersCount - vendorCount - adminCount, color: "#00f2fe" },
                { label: "Verified Vendors", count: vendorCount, color: "#10b981" },
                { label: "System Admins", count: adminCount, color: "#f59e0b" },
              ].map((roleItem, i) => (
                <div key={i} className="text-center p-5 rounded-2xl bg-[#091119] border border-slate-800">
                  <span className="text-3xl font-black block" style={{ color: roleItem.color }}>
                    {loadingUsers ? "..." : <CountUp end={roleItem.count} />}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{roleItem.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ============ TAB 2: MANAGE TICKETS ============ */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-cyan-400" />
              Manage Platform Tickets
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                {filteredTickets.length}
              </span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by title, from, to..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-[#0d1620] border border-slate-800 rounded-2xl text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="px-4 h-11 bg-[#0d1620] border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loadingTickets ? (
            <SkeletonRows count={5} />
          ) : filteredTickets.length === 0 ? (
            <div className="nexus-card rounded-3xl p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No tickets found matching your query.</p>
            </div>
          ) : (
            <>
              <div className="nexus-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#091119] border-b border-slate-800">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Route & Title</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Type</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Price</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Available Seats</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentTickets.map((t) => (
                        <tr key={t._id} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {t.image && (
                                <img src={t.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-700" />
                              )}
                              <div>
                                <span className="font-bold text-white block">{t.title}</span>
                                <span className="text-[10px] text-cyan-400 block">{t.from} → {t.to}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              {t.transportType}
                            </span>
                          </td>
                          <td className="p-4 font-black text-white">${t.price}</td>
                          <td className="p-4 text-slate-300 font-bold">{t.ticketQuantity}</td>
                          <td className="p-4">{getStatusBadge(t.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {t.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleTicketStatus(t._id, "approved")}
                                    disabled={actionLoading === t._id}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleTicketStatus(t._id, "rejected")}
                                    disabled={actionLoading === t._id}
                                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border border-rose-500/30 disabled:opacity-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </>
                              )}
                              {t.status === "approved" && (
                                <button
                                  onClick={() => handleTicketStatus(t._id, "rejected")}
                                  disabled={actionLoading === t._id}
                                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border border-rose-500/30 disabled:opacity-50"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Revoke
                                </button>
                              )}
                              {t.status === "rejected" && (
                                <button
                                  onClick={() => handleTicketStatus(t._id, "approved")}
                                  disabled={actionLoading === t._id}
                                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border border-emerald-500/30 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination page={ticketPage} totalPages={totalTicketPages} setPage={setTicketPage} />
            </>
          )}
        </div>
      )}

      {/* ============ TAB 3: MANAGE USERS ============ */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Manage Platform Users
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                {filteredUsers.length}
              </span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-[#0d1620] border border-slate-800 rounded-2xl text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-4 h-11 bg-[#0d1620] border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <SkeletonRows count={5} />
          ) : filteredUsers.length === 0 ? (
            <div className="nexus-card rounded-3xl p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No users found matching your query.</p>
            </div>
          ) : (
            <>
              <div className="nexus-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#091119] border-b border-slate-800">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">User Profile</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Role</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Fraud Status</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                                alt=""
                              />
                              <div>
                                <span className="font-bold text-white block">{u.name}</span>
                                <span className="text-[10px] text-cyan-400 block">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.role || "user"}
                              disabled={actionLoading === u.id + "_role" || u.id === session?.user?.id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-[#091119] text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                            >
                              <option value="user">Passenger User</option>
                              <option value="vendor">Verified Vendor</option>
                              <option value="admin">System Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            {u.isFraud ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                FRAUD FLAGGED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                                <ShieldCheck className="w-3 h-3" />
                                Clean
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {u.id !== session?.user?.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleImpersonate(u.id, u.name, u.email)}
                                  disabled={actionLoading === u.id + "_impersonate"}
                                  className="px-3.5 py-2 nexus-pill-btn rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                                  title={`Log into ${u.name}'s account`}
                                >
                                  <LogIn className="w-3.5 h-3.5" />
                                  Log In As User
                                </button>
                                <button
                                  onClick={() => handleFraudToggle(u.id, u.isFraud)}
                                  disabled={actionLoading === u.id + "_fraud"}
                                  className={`px-3 py-2 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1 border transition-colors disabled:opacity-50 ${u.isFraud
                                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                      : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                                    }`}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  {u.isFraud ? "Clear Flag" : "Flag Fraud"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic font-medium">Active Account</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination page={userPage} totalPages={totalUserPages} setPage={setUserPage} />
            </>
          )}
        </div>
      )}

      {/* ============ TAB 4: ADVERTISE TICKETS ============ */}
      {activeTab === "advertise" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Homepage Advertisement Slots
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">
                Active Ads: <span className="text-cyan-400">{activeAdsCount}</span> / 6 max
              </span>
              <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(activeAdsCount / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {loadingTickets ? (
            <SkeletonRows count={4} />
          ) : approvedTickets.length === 0 ? (
            <div className="nexus-card rounded-3xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No approved tickets available for placement.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentAdTickets.map((t) => (
                  <div
                    key={t._id}
                    className={`relative nexus-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${t.isAdvertised
                        ? "border-cyan-500/50 shadow-xl shadow-cyan-500/10"
                        : ""
                      }`}
                  >
                    {/* Live Ad Indicator */}
                    {t.isAdvertised && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg shadow-cyan-500/30">
                          <Eye className="w-3 h-3" /> LIVE AD
                        </span>
                      </div>
                    )}

                    {t.image ? (
                      <img src={t.image} alt={t.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-[#091119] flex items-center justify-center">
                        <Ticket className="w-10 h-10 text-slate-600" />
                      </div>
                    )}

                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-bold text-sm text-white truncate">{t.title}</h3>
                        <p className="text-[10px] text-cyan-400 font-medium mt-1">
                          {t.from} → {t.to} • <span className="capitalize">{t.transportType}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
                        <span className="font-black text-white">${t.price}</span>
                        <span className="text-slate-400">{t.ticketQuantity} seats</span>
                      </div>

                      {/* Ad Toggle Button */}
                      <button
                        onClick={() => handleAdToggle(t._id, t.isAdvertised)}
                        disabled={actionLoading === t._id + "_ad" || (!t.isAdvertised && activeAdsCount >= 6)}
                        className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${t.isAdvertised
                            ? "nexus-pill-btn"
                            : activeAdsCount >= 6
                              ? "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                              : "bg-[#091119] hover:bg-slate-800 text-slate-300 border border-slate-800"
                          }`}
                      >
                        {t.isAdvertised ? (
                          <><ToggleRight className="w-5 h-5" /> Featured on Homepage</>
                        ) : (
                          <><ToggleLeft className="w-5 h-5" /> Enable Ad Slot</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={adPage} totalPages={totalAdPages} setPage={setAdPage} />
            </>
          )}
        </div>
      )}

      {/* Reusable Confirm Dialog */}
      <AlertDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md nexus-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Edit Admin Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileError && (
              <div className="bg-rose-950/40 text-rose-300 p-3.5 rounded-2xl text-xs font-semibold border border-rose-500/30">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 h-11 rounded-2xl bg-[#091119] border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files[0])}
                  className="w-full px-3 py-2 rounded-2xl bg-[#091119] border border-slate-800 text-slate-300 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-3 border border-slate-800 text-slate-300 hover:bg-slate-800 font-bold rounded-2xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 py-3 nexus-pill-btn rounded-2xl text-xs flex items-center justify-center gap-2"
                >
                  {profileSaving ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-900/40 rounded-3xl animate-pulse" />
        ))}
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
