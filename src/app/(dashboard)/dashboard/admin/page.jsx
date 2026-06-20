"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import CountUp from "@/components/CountUp";
import {
  User, Mail, Shield, ShieldAlert, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, AlertTriangle, ShieldCheck, Ticket, Users, Sparkles,
  TrendingUp, Clock, Eye, Ban, Search, ChevronLeft, ChevronRight,
  BarChart3, Activity, Globe, Calendar, Filter
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
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
    onConfirm: () => {},
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
      const usersRes = await fetch("http://localhost:5000/api/admin/users", {
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
      const ticketsRes = await fetch("http://localhost:5000/api/admin/tickets", {
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
      const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
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
      const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
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
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
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
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
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

  // ---- Status badge helper ----
  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
    const labels = { approved: "Approved", rejected: "Rejected", pending: "Pending" };
    const s = status || "pending";
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${styles[s] || styles.pending}`}>
        {s === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
        {s === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
        {s === "pending" && <Clock className="w-3 h-3 mr-1" />}
        {labels[s] || "Pending"}
      </span>
    );
  };

  // ---- Computed stats ----
  const totalTicketsCount = tickets.length;
  const approvedCount = tickets.filter(t => t.status === "approved").length;
  const pendingCount = tickets.filter(t => t.status === "pending").length;
  const rejectedCount = tickets.filter(t => t.status === "rejected").length;
  const activeAdsCount = tickets.filter(t => t.isAdvertised && t.status === "approved").length;
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
  const approvedTickets = tickets.filter(t => t.status === "approved");
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
          className="p-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
              p === page
                ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25"
                : "border border-[var(--border)] bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
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
        <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Error/Success alerts */}
      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* ============ TAB 1: ADMIN PROFILE ============ */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          
          {/* Admin Profile Banner */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-8 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img
                  src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                  alt={session?.user?.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-slate-900">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h1 className="text-2xl font-black text-white">{session?.user?.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-slate-300">
                    <Mail className="w-3.5 h-3.5" />
                    {session?.user?.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-xs font-bold uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    System Administrator
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Overview Stats Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Routes", value: totalTicketsCount, icon: Ticket, color: "var(--primary)", bgColor: "var(--primary)" },
              { label: "Platform Users", value: totalUsersCount, icon: Users, color: "#6366f1", bgColor: "#6366f1" },
              { label: "Active Ads", value: activeAdsCount, icon: Sparkles, color: "#10b981", bgColor: "#10b981" },
              { label: "Fraud Flagged", value: fraudUsersCount, icon: AlertTriangle, color: "#ef4444", bgColor: "#ef4444" },
            ].map((stat, i) => (
              <div key={i} className="group bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{stat.label}</span>
                    <span className="text-3xl font-black" style={{ color: stat.color }}>
                      {(loadingTickets && i < 2) || (loadingUsers && i >= 1) ? "..." : <CountUp end={stat.value} />}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: stat.bgColor + "15" }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Ticket Status Breakdown */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loadingTickets ? "..." : <CountUp end={approvedCount} />}
              </span>
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: totalTicketsCount ? `${(approvedCount / totalTicketsCount) * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {loadingTickets ? "..." : <CountUp end={pendingCount} />}
              </span>
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: totalTicketsCount ? `${(pendingCount / totalTicketsCount) * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rejected</span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-2xl font-black text-red-600 dark:text-red-400">
                {loadingTickets ? "..." : <CountUp end={rejectedCount} />}
              </span>
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-1000"
                  style={{ width: totalTicketsCount ? `${(rejectedCount / totalTicketsCount) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </section>

          {/* User Role Breakdown */}
          <section className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              User Role Distribution
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Regular Users", count: totalUsersCount - vendorCount - adminCount, color: "#6366f1" },
                { label: "Vendors", count: vendorCount, color: "#10b981" },
                { label: "Admins", count: adminCount, color: "#f59e0b" },
              ].map((role, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  <span className="text-2xl font-black block" style={{ color: role.color }}>
                    {loadingUsers ? "..." : <CountUp end={role.count} />}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">{role.label}</span>
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
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[var(--primary)]" />
              Manage Platform Tickets
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {filteredTickets.length}
              </span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, from, to..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
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
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-12 text-center">
              <Ticket className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No tickets found.</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)]">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Route</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Type</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Price</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Seats</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Status</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                      {currentTickets.map((t) => (
                        <tr key={t._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {t.image && (
                                <img src={t.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-[var(--border)]/30" />
                              )}
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.title}</span>
                                <span className="text-[10px] text-gray-400 block">{t.from} → {t.to}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              {t.transportType}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-100">${t.price}</td>
                          <td className="p-4 text-gray-500 font-medium">{t.ticketQuantity}</td>
                          <td className="p-4">{getStatusBadge(t.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {t.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleTicketStatus(t._id, "approved")}
                                    disabled={actionLoading === t._id}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleTicketStatus(t._id, "rejected")}
                                    disabled={actionLoading === t._id}
                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-red-500/20 disabled:opacity-50"
                                  >
                                    <XCircle className="w-3 h-3" /> Reject
                                  </button>
                                </>
                              )}
                              {t.status === "approved" && (
                                <button
                                  onClick={() => handleTicketStatus(t._id, "rejected")}
                                  disabled={actionLoading === t._id}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-red-500/20 disabled:opacity-50"
                                >
                                  <Ban className="w-3 h-3" /> Revoke
                                </button>
                              )}
                              {t.status === "rejected" && (
                                <button
                                  onClick={() => handleTicketStatus(t._id, "approved")}
                                  disabled={actionLoading === t._id}
                                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-emerald-500/20 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3 h-3" /> Approve
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
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--primary)]" />
              Manage Platform Users
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {filteredUsers.length}
              </span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: totalUsersCount, color: "#6366f1" },
              { label: "Vendors", value: vendorCount, color: "#10b981" },
              { label: "Admins", value: adminCount, color: "#f59e0b" },
              { label: "Flagged", value: fraudUsersCount, color: "#ef4444" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl p-3 text-center">
                <span className="text-xl font-black block" style={{ color: s.color }}>
                  {loadingUsers ? "..." : <CountUp end={s.value} />}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>

          {loadingUsers ? (
            <SkeletonRows count={5} />
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No users found.</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)]">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">User</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Role</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Fraud Status</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                      {currentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                                className="w-9 h-9 rounded-xl object-cover border border-[var(--border)]"
                                alt=""
                              />
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{u.name}</span>
                                <span className="text-[10px] text-gray-400 block">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.role || "user"}
                              disabled={actionLoading === u.id + "_role" || u.id === session?.user?.id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-gray-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="user">User</option>
                              <option value="vendor">Vendor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            {u.isFraud ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                FRAUD
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3" />
                                Clean
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {u.id !== session?.user?.id ? (
                              <button
                                onClick={() => handleFraudToggle(u.id, u.isFraud)}
                                disabled={actionLoading === u.id + "_fraud"}
                                className={`px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 border transition-colors disabled:opacity-50 ${
                                  u.isFraud
                                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/20"
                                    : "bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-500/20"
                                }`}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                {u.isFraud ? "Clear Flag" : "Flag Fraud"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic font-medium">Your Account</span>
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
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Homepage Advertisement Slots
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">
                Active Ads: <span className="text-emerald-500">{activeAdsCount}</span> / 6 max
              </span>
              <div className="w-24 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(activeAdsCount / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ad Info Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Globe className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Premium Homepage Placements</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Toggle the advertisement switch on any approved ticket to feature it on the homepage hero carousel. Maximum 6 slots available.
                </p>
              </div>
            </div>
          </div>

          {loadingTickets ? (
            <SkeletonRows count={4} />
          ) : approvedTickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-12 text-center">
              <Sparkles className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No approved tickets to advertise.</p>
              <p className="text-[10px] text-gray-400 mt-1">Approve tickets from the Manage Tickets tab first.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAdTickets.map((t) => (
                  <div
                    key={t._id}
                    className={`relative bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                      t.isAdvertised
                        ? "border-emerald-500/30 ring-1 ring-emerald-500/20"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {/* Ad Active Indicator */}
                    {t.isAdvertised && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                          <Eye className="w-2.5 h-2.5" /> LIVE
                        </span>
                      </div>
                    )}

                    {/* Ticket Image */}
                    {t.image ? (
                      <img src={t.image} alt={t.title} className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                        <Ticket className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{t.title}</h3>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {t.from} → {t.to} • <span className="capitalize">{t.transportType}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-100">${t.price}</span>
                        <span className="text-gray-400">{t.ticketQuantity} seats</span>
                      </div>

                      {/* Ad Toggle Button */}
                      <button
                        onClick={() => handleAdToggle(t._id, t.isAdvertised)}
                        disabled={actionLoading === t._id + "_ad"}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                          t.isAdvertised
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                        }`}
                      >
                        {t.isAdvertised ? (
                          <><ToggleRight className="w-5 h-5" /> Advertised</>
                        ) : (
                          <><ToggleLeft className="w-5 h-5" /> Enable Ad</>
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
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
