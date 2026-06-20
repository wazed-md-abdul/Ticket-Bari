"use client";

import { useState, useEffect } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import CountUp from "@/components/CountUp";
import { 
  User, Mail, Shield, ShieldAlert, CheckCircle, XCircle, 
  ToggleLeft, ToggleRight, AlertTriangle, ShieldCheck, Ticket, Users, Sparkles
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Alert Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "default"
  });

  const triggerConfirm = ({ title, description, onConfirm, variant = "default" }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant
    });
  };

  // Tab State: "tickets" | "users"
  const [activeTab, setActiveTab] = useState("tickets");

  // Pagination states
  const [ticketPage, setTicketPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = async () => {
    if (!session?.user) return;
    let token = "";
    try {
      const tokenRes = await authClient.token();
      token = tokenRes?.data?.token || "";
    } catch (e) {
      console.error("Error retrieving JWT token:", e);
    }

    // 1. Fetch all users
    try {
      const usersRes = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
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

    // 2. Fetch all tickets
    try {
      const ticketsRes = await fetch("http://localhost:5000/api/admin/tickets", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
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

  const handleTicketStatus = async (ticketId, status) => {
    setError("");
    setSuccess("");
    setActionLoading(ticketId);

    try {
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }
      const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to moderate ticket.");
      }

      const successMsg = `Ticket status successfully updated to ${status}`;
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
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }
      const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isAdvertised: !currentAdState }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update advertisement slot.");
      }

      const successMsg = `Ticket advertisement state updated successfully.`;
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
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change user role.");
      }

      const msg = "User role updated successfully.";
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
      description: `Are you sure you want to change this user's system role to ${newRole}? This will alter their permission sets immediately.`,
      onConfirm: () => executeRoleChange(userId, newRole),
    });
  };

  const handleFraudToggle = (userId, currentFraudState) => {
    triggerConfirm({
      title: currentFraudState ? "Clear Fraud Flag?" : "Mark as Fraud?",
      description: currentFraudState
        ? "Are you sure you want to clear the fraud flag for this user? They will be allowed to perform operations again."
        : "Are you sure you want to flag this user as fraud? They will be blocked from performing operations and their active tickets will be filtered out.",
      variant: currentFraudState ? "default" : "destructive",
      onConfirm: () => executeFraudToggle(userId, currentFraudState),
    });
  };


  const executeFraudToggle = async (userId, currentFraudState) => {
    setError("");
    setSuccess("");
    setActionLoading(userId + "_fraud");

    try {
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isFraud: !currentFraudState }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update fraud flag.");
      }

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-lg">Approved</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded-lg">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 rounded-lg">Pending Review</span>;
    }
  };

  // Math for stats cards
  const totalTicketsCount = tickets.length;
  const activeAdsCount = tickets.filter(t => t.isAdvertised && t.status === "approved").length;
  const totalUsersCount = users.length;
  const fraudUsersCount = users.filter(u => u.isFraud).length;

  // Pagination filters
  const indexOfLastTicket = ticketPage * itemsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - itemsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalTicketPages = Math.ceil(tickets.length / itemsPerPage);

  const indexOfLastUser = userPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(users.length / itemsPerPage);

  return (
    <div className="space-y-10">
      
      {/* Profile Banner */}
      <section className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 liftup">
        <img
          src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
          alt={session?.user?.name}
          className="w-16 h-16 rounded-full object-cover border-4 border-[var(--primary)] shadow-sm"
        />
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">{session?.user?.name}</h1>
          <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-gray-500">
            <span className="flex items-center justify-center sm:justify-start space-x-1">
              <Mail className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{session?.user?.email}</span>
            </span>
            <span className="flex items-center justify-center sm:justify-start space-x-1 uppercase font-bold text-[var(--primary)]">
              <Shield className="w-3.5 h-3.5" />
              <span>{session?.user?.role} Portal</span>
            </span>
          </div>
        </div>
      </section>

      {/* Analytics Summary Stats (React CountUp) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm flex items-center justify-between liftup">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Routes</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {loadingTickets ? "..." : <CountUp end={totalTicketsCount} />}
            </span>
          </div>
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm flex items-center justify-between liftup">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Advertisements</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {loadingTickets ? "..." : <CountUp end={activeAdsCount} />}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm flex items-center justify-between liftup">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Platform Users</span>
            <span className="text-3xl font-black text-[var(--accent)]">
              {loadingUsers ? "..." : <CountUp end={totalUsersCount} />}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-[var(--accent)] rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm flex items-center justify-between liftup">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Fraud Flagged</span>
            <span className="text-3xl font-black text-red-650 dark:text-red-400">
              {loadingUsers ? "..." : <CountUp end={fraudUsersCount} />}
            </span>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Tabs Selector */}
      <div className="flex border-b border-[var(--border)] pb-px">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "tickets"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-gray-400 hover:text-slate-600"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Tickets Moderation</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "users"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-gray-400 hover:text-slate-600"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Accounts Moderation</span>
        </button>
      </div>

      {/* Error/Success alerts */}
      {error && (
        <Alert variant="destructive" className="liftup">
          <ShieldAlert className="w-4 h-4" />
          <AlertTitle>Admin error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-250 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 animate-pulse liftup">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <AlertTitle>Operation Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Tab 1 Content: Tickets Moderation */}
      {activeTab === "tickets" && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold flex items-center space-x-2 text-slate-800 dark:text-slate-200">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
            <span>Manage Platform Tickets</span>
          </h2>

          {loadingTickets ? (
            <div className="h-44 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ) : tickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-12 text-center text-gray-500 text-sm font-medium liftup">
              No tickets listed on the platform yet.
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm liftup">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)] font-bold uppercase tracking-wider text-gray-500">
                        <th className="p-4">Route Info</th>
                        <th className="p-4">Pricing & Seat Details</th>
                        <th className="p-4">Approval State</th>
                        <th className="p-4">Ad Slot</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                      {currentTickets.map((t) => (
                        <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.title}</span>
                            <span className="text-[10px] text-gray-400 block">{t.from} ➔ {t.to} | <span className="capitalize">{t.transportType}</span></span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">${t.price} USD</span>
                            <span className="text-[10px] text-gray-400 block">{t.ticketQuantity} available seats</span>
                          </td>
                          <td className="p-4">{getStatusBadge(t.status)}</td>
                          <td className="p-4">
                            {t.status === "approved" ? (
                              <button
                                onClick={() => handleAdToggle(t._id, t.isAdvertised)}
                                disabled={actionLoading === t._id + "_ad"}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                                title="Toggle Homepage Advertisement"
                              >
                                {t.isAdvertised ? (
                                  <div className="flex items-center space-x-1 text-[var(--primary)] font-bold">
                                    <ToggleRight className="w-7 h-7" />
                                    <span>Advertised</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-gray-405">
                                    <ToggleLeft className="w-7 h-7" />
                                    <span>Draft</span>
                                  </div>
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">Approve first</span>
                            )}
                          </td>
                          <td className="p-4">
                            {t.status === "pending" && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleTicketStatus(t._id, "approved")}
                                  disabled={actionLoading === t._id}
                                  className="px-2.5 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleTicketStatus(t._id, "rejected")}
                                  disabled={actionLoading === t._id}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center space-x-1 border border-red-100"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}
                            {t.status === "approved" && (
                              <button
                                onClick={() => handleTicketStatus(t._id, "rejected")}
                                disabled={actionLoading === t._id}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center space-x-1 border border-red-100"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Revoke / Reject</span>
                              </button>
                            )}
                            {t.status === "rejected" && (
                              <button
                                onClick={() => handleTicketStatus(t._id, "approved")}
                                disabled={actionLoading === t._id}
                                className="px-2.5 py-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg flex items-center space-x-1 border border-[var(--primary)]/20"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve Ticket</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ticket list pagination */}
              {totalTicketPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-2">
                  <button
                    onClick={() => setTicketPage(prev => Math.max(prev - 1, 1))}
                    disabled={ticketPage === 1}
                    className="px-3.5 py-1.5 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {ticketPage} of {totalTicketPages}
                  </span>
                  <button
                    onClick={() => setTicketPage(prev => Math.min(prev + 1, totalTicketPages))}
                    disabled={ticketPage === totalTicketPages}
                    className="px-3.5 py-1.5 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Tab 2 Content: Accounts Moderation */}
      {activeTab === "users" && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold flex items-center space-x-2 text-slate-800 dark:text-slate-200">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <span>Manage Platform Users</span>
          </h2>

          {loadingUsers ? (
            <div className="h-44 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm liftup">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)] font-bold uppercase tracking-wider text-gray-500">
                        <th className="p-4">User profile</th>
                        <th className="p-4">System Role</th>
                        <th className="p-4">Fraud Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                      {currentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="p-4 flex items-center space-x-3">
                            <img src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{u.name}</span>
                              <span className="text-[10px] text-gray-400 block">{u.email}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.role || "user"}
                              disabled={actionLoading === u.id + "_role" || u.id === session.user.id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-gray-50 dark:bg-slate-950 px-2 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold focus:outline-none"
                            >
                              <option value="user">User</option>
                              <option value="vendor">Vendor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            {u.isFraud ? (
                              <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-red-50 text-red-600 rounded-md inline-flex items-center space-x-1 border border-red-100">
                                <AlertTriangle className="w-3 h-3" />
                                <span>FRAUD FLAGGED</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">Clean Account</span>
                            )}
                          </td>
                          <td className="p-4">
                            {u.id !== session.user.id ? (
                              <button
                                onClick={() => handleFraudToggle(u.id, u.isFraud)}
                                disabled={actionLoading === u.id + "_fraud"}
                                className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center space-x-1 border transition-colors ${
                                  u.isFraud 
                                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100"
                                    : "bg-red-50 hover:bg-red-100 text-red-600 border-red-100"
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{u.isFraud ? "Clear Fraud Flag" : "Mark as Fraud"}</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">Self Account</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Users list pagination */}
              {totalUserPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-2">
                  <button
                    onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                    disabled={userPage === 1}
                    className="px-3.5 py-1.5 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {userPage} of {totalUserPages}
                  </span>
                  <button
                    onClick={() => setUserPage(prev => Math.min(prev + 1, totalUserPages))}
                    disabled={userPage === totalUserPages}
                    className="px-3.5 py-1.5 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
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
export const dynamic = "force-dynamic";
