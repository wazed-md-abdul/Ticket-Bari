"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient, updateUser } from "@/lib/auth-client";
import { useSearchParams, useRouter } from "next/navigation";
import CountUp from "@/components/CountUp";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid
} from "recharts";
import {
  User, Mail, Ticket, PlusCircle, CheckCircle, XCircle,
  AlertTriangle, DollarSign, Calendar, Loader2, BarChart3, Edit, Trash2,
  ChevronLeft, ChevronRight, Search, Filter, Activity, Clock,
  ShieldCheck, TrendingUp, Package, Users, Edit3, X, Zap
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

const CustomTooltip = ({ active, payload, label, activeMetric }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const metricLabel =
      activeMetric === "revenue" ? "Revenue" :
        activeMetric === "bookings" ? "Bookings" : "Tickets Sold";
    const formattedValue = activeMetric === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString();

    return (
      <div className="bg-[#091119]/95 text-slate-100 border border-cyan-500/30 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-cyan-400 mb-1 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">{metricLabel}:</span>
          <span className="text-sm font-black text-white ml-auto">{formattedValue}</span>
        </div>
      </div>
    );
  }
  return null;
};

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

  // Chart state
  const [activeMetric, setActiveMetric] = useState("revenue");

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

  const activeTab = searchParams.get("tab") || "profile";

  // Data states
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, totalTicketsSold: 0, chartData: [] });
  const [myTickets, setMyTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states for Add Ticket
  const [formData, setFormData] = useState({
    title: "",
    from: "",
    to: "",
    transportType: "bus",
    departureDateTime: "",
    price: "",
    ticketQuantity: "",
    image: "",
    perks: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Edit ticket modal state
  const [editingTicket, setEditingTicket] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Filters & Pagination for tickets
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [ticketPage, setTicketPage] = useState(1);
  const itemsPerPage = 6;

  // Filters & Pagination for bookings
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPage, setBookingPage] = useState(1);

  const getToken = async () => {
    try {
      const tokenRes = await authClient.token();
      return tokenRes?.data?.token || "";
    } catch (e) {
      console.error("Error fetching auth token:", e);
      return "";
    }
  };

  const fetchVendorData = async () => {
    if (!session?.user) return;
    setLoadingData(true);
    const token = await getToken();

    try {
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const ticketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setMyTickets(ticketsData);
      }

      const bookingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, [session]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const token = await getToken();
      const perksArray = formData.perks
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const payload = {
        ...formData,
        perks: perksArray,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ticket");

      const successMsg = "Ticket added successfully! Waiting for admin approval.";
      setFormSuccess(successMsg);
      toast.success(successMsg);
      setFormData({
        title: "",
        from: "",
        to: "",
        transportType: "bus",
        departureDateTime: "",
        price: "",
        ticketQuantity: "",
        image: "",
        perks: "",
      });

      fetchVendorData();
    } catch (err) {
      const errMsg = err.message || "Something went wrong.";
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update booking status");

      toast.success(`Booking ${newStatus} successfully!`);
      fetchVendorData();
    } catch (err) {
      toast.error(err.message || "Failed to update booking.");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete ticket");

      toast.success("Ticket deleted successfully.");
      fetchVendorData();
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket.");
    }
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setEditFormData({
      title: ticket.title || "",
      from: ticket.from || "",
      to: ticket.to || "",
      transportType: ticket.transportType || "bus",
      departureDateTime: ticket.departureDateTime ? ticket.departureDateTime.slice(0, 16) : "",
      price: ticket.price || "",
      ticketQuantity: ticket.ticketQuantity || "",
      image: ticket.image || "",
      perks: Array.isArray(ticket.perks) ? ticket.perks.join(", ") : ticket.perks || "",
    });
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setEditSubmitting(true);

    try {
      const token = await getToken();
      const perksArray = typeof editFormData.perks === "string"
        ? editFormData.perks.split(",").map((p) => p.trim()).filter((p) => p.length > 0)
        : editFormData.perks;

      const payload = {
        ...editFormData,
        perks: perksArray,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${editingTicket._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update ticket");

      toast.success("Ticket updated! Reset to pending approval.");
      setEditingTicket(null);
      fetchVendorData();
    } catch (err) {
      toast.error(err.message || "Failed to update ticket.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Filtered tickets
  const filteredTickets = myTickets.filter((t) => {
    const matchesSearch =
      !ticketSearch ||
      t.title?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.from?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.to?.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = ticketStatusFilter === "all" || t.status === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTicketPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentTickets = filteredTickets.slice((ticketPage - 1) * itemsPerPage, ticketPage * itemsPerPage);

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !bookingSearch ||
      b.ticketTitle?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBookingPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice((bookingPage - 1) * itemsPerPage, bookingPage * itemsPerPage);

  const getStatusBadge = (status) => {
    const s = status || "pending";
    if (s === "approved" || s === "accepted" || s === "paid") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3 mr-1" /> {s}
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3 h-3 mr-1" /> {s}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Clock className="w-3 h-3 mr-1" /> {s}
      </span>
    );
  };

  const Pagination = ({ page, totalPages, setPage }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 pt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2.5 rounded-2xl border border-slate-800 bg-[#0d1620] text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-9 h-9 rounded-2xl text-xs font-black transition-all ${
              p === page
                ? "nexus-pill-btn shadow-lg"
                : "border border-slate-800 bg-[#0d1620] text-slate-400 hover:bg-slate-800"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2.5 rounded-2xl border border-slate-800 bg-[#0d1620] text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Profile / Hero Banner */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          <section className="nexus-card rounded-3xl p-8 border border-cyan-500/20 relative overflow-hidden">
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
                      VENDOR ACCOUNT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    {session?.user?.email}
                  </p>
                </div>
              </div>

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
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            </div>
          </section>

          {/* Stats Overview */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Revenue Generated", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "#00f2fe" },
              { label: "Total Customer Bookings", value: stats.totalBookings, icon: Calendar, color: "#10b981" },
              { label: "Tickets Sold Count", value: stats.totalTicketsSold, icon: Package, color: "#f59e0b" },
              { label: "Active Added Routes", value: myTickets.length, icon: Ticket, color: "#ec4899" },
            ].map((st, i) => (
              <div key={i} className="nexus-card rounded-3xl p-6">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{st.label}</span>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <st.icon className="w-5 h-5" style={{ color: st.color }} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-white">{st.value}</span>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ============ TAB: REVENUE OVERVIEW ============ */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> Revenue & Transport Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">Breakdown of earnings and bookings by transport category</p>
            </div>

            {/* Metric Switcher Pills */}
            <div className="flex items-center gap-2 bg-[#0d1620] p-1.5 rounded-2xl border border-slate-800">
              {[
                { id: "revenue", label: "Revenue" },
                { id: "bookings", label: "Bookings" },
                { id: "ticketsSold", label: "Tickets Sold" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMetric === m.id
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Container */}
          <div className="nexus-card rounded-3xl p-6 space-y-4">
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip activeMetric={activeMetric} />} />
                  <Bar dataKey={activeMetric} radius={[8, 8, 0, 0]}>
                    {(stats.chartData || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#00f2fe" : index === 1 ? "#10b981" : "#ec4899"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB: ADD TICKET ============ */}
      {activeTab === "add-ticket" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="nexus-card rounded-3xl p-8 border border-cyan-500/20 space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" /> Create New Ticket Listing
              </h2>
              <p className="text-xs text-slate-400 mt-1">List your bus, train, or flight service for passenger booking</p>
            </div>

            {formError && (
              <div className="bg-rose-950/40 text-rose-300 p-3.5 rounded-2xl text-xs font-semibold border border-rose-500/30">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-950/40 text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold border border-emerald-500/30">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Line Scania Multi-Axle AC Sleeper"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">From (Origin)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">To (Destination)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cox's Bazar"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Transport Type</label>
                  <select
                    value={formData.transportType}
                    onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                    className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="air">Air Flight</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Available Seats</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 30"
                    value={formData.ticketQuantity}
                    onChange={(e) => setFormData({ ...formData, ticketQuantity: e.target.value })}
                    className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.departureDateTime}
                  onChange={(e) => setFormData({ ...formData, departureDateTime: e.target.value })}
                  className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Perks (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. AC, Free WiFi, Snacks, Water, Reclining Seats"
                  value={formData.perks}
                  onChange={(e) => setFormData({ ...formData, perks: e.target.value })}
                  className="w-full px-4 h-11 bg-[#091119] border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 nexus-pill-btn rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <><PlusCircle className="w-4 h-4" /> Submit Ticket for Approval</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============ TAB: MY ADDED TICKETS ============ */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-cyan-400" /> My Added Ticket Listings
            </h2>
          </div>

          {loadingData ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-900/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : currentTickets.length === 0 ? (
            <div className="nexus-card rounded-3xl p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No ticket listings found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentTickets.map((t) => (
                  <div key={t._id} className="nexus-card rounded-3xl overflow-hidden space-y-3 p-5 flex flex-col justify-between">
                    <div>
                      {t.image && (
                        <img src={t.image} alt={t.title} className="w-full h-36 object-cover rounded-2xl mb-3" />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase">
                          {t.transportType}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">{t.title}</h3>
                      <p className="text-xs text-cyan-400 font-medium mt-0.5">{t.from} → {t.to}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-white">${t.price}</span>
                        <span className="text-[10px] text-slate-500 block">{t.ticketQuantity} seats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(t._id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={ticketPage} totalPages={totalTicketPages} setPage={setTicketPage} />
            </>
          )}
        </div>
      )}

      {/* ============ TAB: REQUESTED BOOKINGS ============ */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" /> Requested Customer Bookings
            </h2>
          </div>

          {loadingData ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-900/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : currentBookings.length === 0 ? (
            <div className="nexus-card rounded-3xl p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No booking requests found.</p>
            </div>
          ) : (
            <>
              <div className="nexus-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#091119] border-b border-slate-800">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Service Route</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Passenger</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Seats</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Total Price</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-white block">{b.ticketTitle}</span>
                            <span className="text-[10px] text-cyan-400">{b.from} → {b.to}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-200 block">{b.userName}</span>
                            <span className="text-[10px] text-slate-500">{b.userEmail}</span>
                          </td>
                          <td className="p-4 text-slate-300 font-bold">{b.bookedQuantity} seats</td>
                          <td className="p-4 font-black text-white">${b.totalPrice}</td>
                          <td className="p-4">{getStatusBadge(b.status)}</td>
                          <td className="p-4">
                            {b.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleBookingAction(b._id, "accepted")}
                                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleBookingAction(b._id, "rejected")}
                                  className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-black uppercase"
                                >
                                  Reject
                                </button>
                              </div>
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

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md nexus-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Edit Vendor Profile</h2>
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

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg nexus-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative border border-cyan-500/30 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Edit Ticket Listing</h2>
              <button onClick={() => setEditingTicket(null)} className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Service Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 h-10 bg-[#091119] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">From</label>
                  <input
                    type="text"
                    required
                    value={editFormData.from}
                    onChange={(e) => setEditFormData({ ...editFormData, from: e.target.value })}
                    className="w-full px-4 h-10 bg-[#091119] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">To</label>
                  <input
                    type="text"
                    required
                    value={editFormData.to}
                    onChange={(e) => setEditFormData({ ...editFormData, to: e.target.value })}
                    className="w-full px-4 h-10 bg-[#091119] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full px-4 h-10 bg-[#091119] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Seats</label>
                  <input
                    type="number"
                    required
                    value={editFormData.ticketQuantity}
                    onChange={(e) => setEditFormData({ ...editFormData, ticketQuantity: e.target.value })}
                    className="w-full px-4 h-10 bg-[#091119] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="flex-1 py-3 border border-slate-800 text-slate-300 hover:bg-slate-800 font-bold rounded-2xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-3 nexus-pill-btn rounded-2xl text-xs flex items-center justify-center gap-2"
                >
                  {editSubmitting ? (
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

export default function VendorDashboard() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-900/40 rounded-3xl animate-pulse" />
        ))}
      </div>
    }>
      <VendorDashboardContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
