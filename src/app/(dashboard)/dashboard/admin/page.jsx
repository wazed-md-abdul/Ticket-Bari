"use client";

import { useState, useEffect } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { 
  User, Mail, Shield, ShieldAlert, CheckCircle, XCircle, 
  ToggleLeft, ToggleRight, Trash2, Award, AlertTriangle, ShieldCheck 
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setSuccess(`Ticket status updated to ${status}`);
      fetchData();
    } catch (err) {
      setError(err.message || "Action failed.");
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

      setSuccess(`Ticket advertisement state updated.`);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to toggle advertisement slot.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change system role to ${newRole}?`)) {
      return;
    }
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
      window.alert(msg);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to change user role.");
      window.alert(err.message || "Failed to change user role.");
    } finally {
      setActionLoading("");
    }
  };

  const handleFraudToggle = async (userId, currentFraudState) => {
    const actStr = currentFraudState ? "clear fraud flag from" : "mark as fraud";
    if (!window.confirm(`Are you sure you want to ${actStr} this user?`)) {
      return;
    }
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

      const msg = `Fraud flag successfully ${!currentFraudState ? "activated" : "cleared"}.`;
      setSuccess(msg);
      window.alert(msg);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to update fraud flag.");
      window.alert(err.message || "Failed to update fraud flag.");
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

  return (
    <div className="space-y-10">
      
      {/* Profile Banner */}
      <section className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
          alt={session?.user?.name}
          className="w-16 h-16 rounded-full object-cover border-4 border-indigo-500 shadow-sm"
        />
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-xl font-black">{session?.user?.name}</h1>
          <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-gray-500">
            <span className="flex items-center justify-center sm:justify-start space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{session?.user?.email}</span>
            </span>
            <span className="flex items-center justify-center sm:justify-start space-x-1 uppercase font-bold text-indigo-500">
              <Shield className="w-3.5 h-3.5" />
              <span>{session?.user?.role} Portal</span>
            </span>
          </div>
        </div>
      </section>

      {/* Error/Success alerts */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold border border-red-200">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-xs font-semibold border border-emerald-150">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Manage Tickets */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <span>Manage Platform Tickets</span>
        </h2>

        {loadingTickets ? (
          <div className="h-44 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        ) : tickets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-12 text-center text-gray-500 text-sm font-medium">
            No tickets listed on the platform yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                    <th className="p-4">Route Info</th>
                    <th className="p-4">Pricing & Seat Details</th>
                    <th className="p-4">Approval State</th>
                    <th className="p-4">Ad Slot</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                  {tickets.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.title}</span>
                        <span className="text-[10px] text-gray-400 block">{t.from} ➔ {t.to} | <span className="capitalize">{t.transportType}</span></span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">${t.price} USD</span>
                        <span className="text-[10px] text-gray-450 block">{t.ticketQuantity} available seats</span>
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
                              <div className="flex items-center space-x-1 text-indigo-500 font-bold">
                                <ToggleRight className="w-7 h-7" />
                                <span>Advertised</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-gray-400">
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
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleTicketStatus(t._id, "rejected")}
                              disabled={actionLoading === t._id}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-105 text-red-600 rounded-lg flex items-center space-x-1"
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
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-105 text-red-600 rounded-lg flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Revoke / Reject</span>
                          </button>
                        )}
                        {t.status === "rejected" && (
                          <button
                            onClick={() => handleTicketStatus(t._id, "approved")}
                            disabled={actionLoading === t._id}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg flex items-center space-x-1"
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
        )}
      </section>

      {/* Manage Users */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold flex items-center space-x-2">
          <User className="w-5 h-5 text-indigo-500" />
          <span>Manage Platform Users</span>
        </h2>

        {loadingUsers ? (
          <div className="h-44 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                    <th className="p-4">User profile</th>
                    <th className="p-4">System Role</th>
                    <th className="p-4">Fraud Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4 flex items-center space-x-3">
                        <img src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} className="w-8 h-8 rounded-full object-cover" />
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
                          className="bg-gray-50 dark:bg-slate-950 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-semibold"
                        >
                          <option value="user">User</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {u.isFraud ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-50 text-red-600 rounded-md inline-flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>FRAUD FLAGGED</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 rounded-md">Clean Account</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.id !== session.user.id ? (
                          <button
                            onClick={() => handleFraudToggle(u.id, u.isFraud)}
                            disabled={actionLoading === u.id + "_fraud"}
                            className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center space-x-1 ${
                              u.isFraud 
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                : "bg-red-50 hover:bg-red-100 text-red-600"
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
        )}
      </section>

    </div>
  );
}
export const dynamic = "force-dynamic";
