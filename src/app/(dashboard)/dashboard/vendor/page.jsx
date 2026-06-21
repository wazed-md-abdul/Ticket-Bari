"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient, updateUser } from "@/lib/auth-client";
import { useSearchParams, useRouter } from "next/navigation";
import CountUp from "@/components/CountUp";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell
} from "recharts";
import {
  User, Mail, Ticket, PlusCircle, CheckCircle, XCircle,
  AlertTriangle, DollarSign, Calendar, Loader2, BarChart3, Edit, Trash2,
  ChevronLeft, ChevronRight, Search, Filter, Activity, Clock,
  ShieldCheck, TrendingUp, Package, Users, Edit3, X
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

function VendorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

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

  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, chartData: [] });
  const [isFraud, setIsFraud] = useState(false);

  // Loading states
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [mounted, setMounted] = useState(false);

  // Search & filter states
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  // Tab State via Search Params
  const activeTab = searchParams.get("tab") || "profile";

  // Pagination states
  const [ticketPage, setTicketPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const itemsPerPage = 8;

  // Form states
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transportType, setTransportType] = useState("bus");
  const [departureDateTime, setDepartureDateTime] = useState("");
  const [price, setPrice] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [perks, setPerks] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePerkChange = (perk) => {
    setPerks(prev =>
      prev.includes(perk) ? prev.filter(p => p !== perk) : [...prev, perk]
    );
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setTicketPage(1); }, [ticketSearch, ticketStatusFilter]);
  useEffect(() => { setBookingPage(1); }, [bookingSearch, bookingStatusFilter]);


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

    // Check fraud
    try {
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const users = await usersRes.json();
        const me = users.find(u => u.id === session.user.id);
        if (me?.isFraud) setIsFraud(true);
      }
    } catch (e) { console.error(e); }

    // Load Tickets
    try {
      const ticketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/tickets`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
    } catch (e) { console.error(e); }
    finally { setLoadingTickets(false); }

    // Load Bookings
    try {
      const bookingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (e) { console.error(e); }
    finally { setLoadingBookings(false); }

    // Load Stats
    try {
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) { console.error(e); }
    finally { setLoadingStats(false); }
  };

  useEffect(() => { fetchData(); }, [session]);

  const handleAddTicket = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (isFraud) {
      setError("Operation blocked! Your account has been flagged as fraudulent.");
      return;
    }
    setFormLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "e137d11ae145b9f6610a6d8377ef5413";
        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
        if (!imgbbRes.ok) {
          const errData = await imgbbRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || `ImgBB upload failed (status ${imgbbRes.status}).`);
        }
        const imgData = await imgbbRes.json();
        imageUrl = imgData.data?.url || "";
      }

      const token = await getToken();
      const isEdit = !!editingTicketId;
      const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${editingTicketId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/tickets`;
      const method = isEdit ? "PUT" : "POST";
      const payload = { title, from, to, transportType, departureDateTime, price: Number(price), ticketQuantity: Number(ticketQuantity), perks };
      if (imageUrl) payload.image = imageUrl;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit ticket.");

      const successMsg = isEdit ? "Ticket updated! Awaiting Admin approval." : "Ticket created! Awaiting Admin approval.";
      setSuccess(successMsg);
      toast.success(successMsg);
      setTitle(""); setFrom(""); setTo(""); setDepartureDateTime(""); setPrice(""); setTicketQuantity(""); setImageFile(null); setPerks([]); setEditingTicketId(null);
      fetchData();
      router.push("/dashboard/vendor?tab=tickets");
    } catch (err) {
      const errMsg = err.message || "Something went wrong.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSelectUpdate = (ticket) => {
    setEditingTicketId(ticket._id);
    setTitle(ticket.title);
    setFrom(ticket.from);
    setTo(ticket.to);
    setTransportType(ticket.transportType);
    if (ticket.departureDateTime) {
      const dateObj = new Date(ticket.departureDateTime);
      const localISO = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDepartureDateTime(localISO);
    } else { setDepartureDateTime(""); }
    setPrice(ticket.price.toString());
    setTicketQuantity(ticket.ticketQuantity.toString());
    setPerks(ticket.perks || []);
    router.push("/dashboard/vendor?tab=add-ticket");
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    setError(""); setSuccess(""); setActionLoading(ticketId);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to delete ticket."); }
      toast.success("Ticket deleted successfully.");
      fetchData();
    } catch (err) { setError(err.message); toast.error(err.message); }
    finally { setActionLoading(""); }
  };

  const handleBookingAction = async (bookingId, status) => {
    setError(""); setActionLoading(bookingId);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      toast.success(`Booking ${status} successfully!`);
      fetchData();
    } catch (err) {
      const errMsg = err.message || "Action failed.";
      setError(errMsg);
      toast.error(errMsg);
    } finally { setActionLoading(""); }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accepted: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    };
    const icons = {
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      accepted: <ShieldCheck className="w-3 h-3 mr-1" />,
      paid: <CheckCircle className="w-3 h-3 mr-1" />,
    };
    const s = status || "pending";
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${styles[s] || styles.pending}`}>
        {icons[s] || icons.pending}
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  const COLORS = ["#386629", "#80B5D2", "#3D54AC"];

  // Computed stats
  const approvedCount = tickets.filter(t => t.status === "approved").length;
  const pendingTicketCount = tickets.filter(t => t.status === "pending").length;
  const rejectedTicketCount = tickets.filter(t => t.status === "rejected").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const paidBookings = bookings.filter(b => b.status === "paid").length;

  // Filtered tickets
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

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = !bookingSearch ||
      b.userName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.ticketTitle?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalBookingPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice((bookingPage - 1) * itemsPerPage, bookingPage * itemsPerPage);

  // Pagination Component
  const Pagination = ({ page, totalPages, setPage }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 pt-6">
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
          className="p-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
              p === page
                ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25"
                : "border border-[var(--border)] bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500"
            }`}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
          className="p-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const SkeletonRows = ({ count = 4 }) => (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
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

      {/* ============ TAB 1: VENDOR PROFILE ============ */}
      {activeTab === "profile" && (
        <div className="space-y-8">

          {/* Profile Banner */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-8 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt={session?.user?.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-slate-900">
                    <Package className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h1 className="text-2xl font-black text-white">{session?.user?.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-slate-300">
                      <Mail className="w-3.5 h-3.5" />
                      {session?.user?.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                      <Package className="w-3 h-3" />
                      Vendor Business
                    </span>
                  </div>
                </div>
              </div>

              {/* Fraud and Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {isFraud && (
                  <div className="px-4 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl animate-pulse">
                    <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">
                      Fraud Flagged
                    </span>
                  </div>
                )}
                {currentTime && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </span>
                )}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 shadow-lg active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </section>

          {/* Overview Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: stats.revenue, icon: DollarSign, color: "var(--primary)", loading: loadingStats, prefix: "$" },
              { label: "Customer Bookings", value: stats.totalBookings, icon: Users, color: "#6366f1", loading: loadingStats },
              { label: "Listed Routes", value: tickets.length, icon: Ticket, color: "#10b981", loading: loadingTickets },
              { label: "Pending Bookings", value: pendingBookings, icon: Clock, color: "#f59e0b", loading: loadingBookings },
            ].map((stat, i) => (
              <div key={i} className="group bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{stat.label}</span>
                    <span className="text-3xl font-black" style={{ color: stat.color }}>
                      {stat.loading ? "..." : <>{stat.prefix}<CountUp end={stat.value} /></>}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: stat.color + "15" }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Ticket Status Breakdown */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Approved", count: approvedCount, color: "#10b981", icon: CheckCircle },
              { label: "Pending Review", count: pendingTicketCount, color: "#f59e0b", icon: Clock },
              { label: "Rejected", count: rejectedTicketCount, color: "#ef4444", icon: XCircle },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="text-2xl font-black" style={{ color: item.color }}>
                  {loadingTickets ? "..." : <CountUp end={item.count} />}
                </span>
                <div className="mt-3 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ backgroundColor: item.color, width: tickets.length ? `${(item.count / tickets.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ============ TAB 2: ADD TICKET ============ */}
      {activeTab === "add-ticket" && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[var(--primary)]" />
            {editingTicketId ? "Modify Listed Route" : "List New Commute Route"}
          </h2>

          <form
            onSubmit={handleAddTicket}
            className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Route Title</label>
              <Input type="text" required disabled={isFraud || formLoading} placeholder="AC Premium Express Class"
                value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leaving From</label>
                <Input type="text" required disabled={isFraud || formLoading} placeholder="Dhaka"
                  value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Going To</label>
                <Input type="text" required disabled={isFraud || formLoading} placeholder="Cox's Bazar"
                  value={to} onChange={(e) => setTo(e.target.value)} className="h-11 text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transport Type</label>
              <Select value={transportType} onChange={(e) => setTransportType(e.target.value)}
                disabled={isFraud || formLoading} className="h-11 text-xs">
                <option value="bus">Coach (Bus)</option>
                <option value="train">Train</option>
                <option value="air">Flight (Air)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Departure Schedule</label>
              <Input type="datetime-local" required disabled={isFraud || formLoading}
                value={departureDateTime} onChange={(e) => setDepartureDateTime(e.target.value)}
                className="h-11 text-xs text-slate-800 dark:text-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seat Price ($)</label>
                <Input type="number" required min="1" disabled={isFraud || formLoading} placeholder="25"
                  value={price} onChange={(e) => setPrice(e.target.value)} className="h-11 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Seats</label>
                <Input type="number" required min="1" disabled={isFraud || formLoading} placeholder="40"
                  value={ticketQuantity} onChange={(e) => setTicketQuantity(e.target.value)} className="h-11 text-xs" />
              </div>
            </div>

            {/* Perks */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Amenities / Perks</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-[var(--border)]/30">
                {["AC", "Wi-Fi", "Water", "Snacks"].map((perk) => (
                  <label key={perk} className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={perks.includes(perk)} onChange={() => handlePerkChange(perk)}
                      disabled={isFraud || formLoading}
                      className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" />
                    <span>{perk}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Banner Image</label>
              <Input type="file" accept="image/*" disabled={isFraud || formLoading}
                onChange={(e) => setImageFile(e.target.files[0])}
                className="h-11 text-xs file:mr-4 file:py-2 file:px-3 file:border-0 file:bg-white/10 file:text-[10px] file:font-bold file:text-[var(--primary)] hover:file:opacity-80 flex items-center" />
            </div>

            <div className="flex gap-3 pt-2">
              {editingTicketId && (
                <button type="button"
                  onClick={() => {
                    setEditingTicketId(null); setTitle(""); setFrom(""); setTo(""); setDepartureDateTime(""); setPrice(""); setTicketQuantity(""); setPerks([]); setImageFile(null);
                    router.push("/dashboard/vendor?tab=tickets");
                  }}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={isFraud || formLoading}
                className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[var(--primary)]/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{editingTicketId ? "Save Changes" : "Create Ticket"}</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============ TAB 3: MY TICKETS ============ */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[var(--primary)]" />
              My Listed Routes
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {filteredTickets.length}
              </span>
            </h2>
            <button
              onClick={() => router.push("/dashboard/vendor?tab=add-ticket")}
              className="py-2.5 px-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--primary)]/25 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> List Route
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by title, from, to..."
                value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={ticketStatusFilter} onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loadingTickets ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-60 bg-gray-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-12 text-center">
              <Ticket className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No tickets found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentTickets.map((t) => {
                  const isRejected = t.status === "rejected";
                  return (
                    <div key={t._id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                        t.status === "approved" ? "border-emerald-500/30" : "border-[var(--border)]"
                      }`}>
                      {t.image ? (
                        <img src={t.image} alt={t.title} className="w-full h-36 object-cover" />
                      ) : (
                        <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                          <Ticket className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {t.transportType}
                          </span>
                          {getStatusBadge(t.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{t.title}</h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">{t.from} → {t.to}</p>
                          <p className="text-[10px] text-gray-400">Departs: {new Date(t.departureDateTime).toLocaleString()}</p>
                          {t.perks && t.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {t.perks.map(p => (
                                <span key={p} className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-[9px] font-extrabold tracking-wider">{p}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="pt-3 border-t border-gray-100 dark:border-slate-800/50 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-bold">Fare: <strong>${t.price}</strong></span>
                            <span className="text-gray-400 font-bold">Seats: <strong>{t.ticketQuantity}</strong></span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleSelectUpdate(t)} disabled={isRejected || actionLoading === t._id}
                              className="flex-1 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider rounded-xl border border-indigo-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                              <Edit className="w-3.5 h-3.5" /> Update
                            </button>
                            <button onClick={() => handleDeleteTicket(t._id)} disabled={isRejected || actionLoading === t._id}
                              className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-xl border border-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination page={ticketPage} totalPages={totalTicketPages} setPage={setTicketPage} />
            </>
          )}
        </div>
      )}

      {/* ============ TAB 4: REQUESTED BOOKINGS ============ */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
              Customer Booking Requests
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {filteredBookings.length}
              </span>
            </h2>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: bookings.length, color: "#6366f1" },
              { label: "Pending", value: pendingBookings, color: "#f59e0b" },
              { label: "Accepted", value: bookings.filter(b => b.status === "accepted").length, color: "#10b981" },
              { label: "Paid", value: paidBookings, color: "#059669" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl p-3 text-center">
                <span className="text-xl font-black block" style={{ color: s.color }}>
                  {loadingBookings ? "..." : <CountUp end={s.value} />}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by customer or ticket..."
                value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loadingBookings ? (
            <SkeletonRows count={5} />
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-12 text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No booking requests found.</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)]">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Customer</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Route</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Details</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                      {currentBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{b.userName}</span>
                            <span className="text-[10px] text-gray-400 block">{b.userEmail}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-slate-700 dark:text-slate-300 block">{b.ticketTitle}</span>
                            <span className="text-[10px] text-gray-400 capitalize block">{b.transportType}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium block">{b.bookedQuantity} seats</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">${b.totalPrice}</span>
                          </td>
                          <td className="p-4">
                            {b.status === "pending" ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleBookingAction(b._id, "accepted")} disabled={actionLoading === b._id}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50">
                                  <CheckCircle className="w-3 h-3" /> Accept
                                </button>
                                <button onClick={() => handleBookingAction(b._id, "rejected")} disabled={actionLoading === b._id}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-red-500/20 disabled:opacity-50">
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </div>
                            ) : (
                              getStatusBadge(b.status)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination page={bookingPage} totalPages={totalBookingPages} setPage={setBookingPage} />
            </>
          )}
        </div>
      )}

      {/* ============ TAB 5: REVENUE OVERVIEW ============ */}
      {activeTab === "revenue" && mounted && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
            Revenue Dashboard
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Earnings", value: stats.revenue, color: "var(--primary)", icon: DollarSign, prefix: "$" },
              { label: "Paid Bookings", value: stats.totalBookings, color: "#10b981", icon: CheckCircle },
              { label: "Avg per Booking", value: stats.totalBookings ? Math.round(stats.revenue / stats.totalBookings) : 0, color: "#6366f1", icon: TrendingUp, prefix: "$" },
              { label: "Listed Routes", value: tickets.length, color: "#f59e0b", icon: Ticket },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <span className="text-2xl font-black" style={{ color: stat.color }}>
                  {loadingStats ? "..." : <>{stat.prefix}<CountUp end={stat.value} /></>}
                </span>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              Revenue by Transport Type
            </h3>
            <div className="h-64 w-full">
              {!loadingStats && stats.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="revenue" fill="#386629" radius={[8, 8, 0, 0]}>
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No revenue data available yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">Edit Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-1 hover:bg-[var(--border)] rounded-lg transition-colors text-foreground/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {profileError && (
              <div className="bg-red-55 dark:bg-red-955/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold border border-red-200/50">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4.5 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files[0])}
                  className="w-full px-4.5 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] text-foreground file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:opacity-80 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] flex items-center"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-3 border border-[var(--border)] text-foreground hover:bg-[var(--input)] font-semibold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 py-3 bg-[var(--primary)] hover:opacity-95 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {profileSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
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

export default function VendorDashboard() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    }>
      <VendorDashboardContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
