"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useSearchParams, useRouter } from "next/navigation";
import CountUp from "@/components/CountUp";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  User, Mail, Ticket, PlusCircle, CheckCircle, XCircle, 
  AlertTriangle, DollarSign, Calendar, RefreshCw, Loader2, BarChart3, Edit, Trash2
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

function VendorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Tab State via Search Params
  const activeTab = searchParams.get("tab") || "profile";

  // Pagination states
  const [ticketPage, setTicketPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const itemsPerPage = 6;

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session } = authClient.useSession();

  const fetchData = async () => {
    if (!session?.user) return;
    let token = "";
    try {
      const tokenRes = await authClient.token();
      token = tokenRes?.data?.token || "";
    } catch (e) {
      console.error("Error retrieving JWT token:", e);
    }

    // Check if user is fraud
    try {
      const usersRes = await fetch("http://localhost:5000/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const users = await usersRes.json();
        const me = users.find(u => u.id === session.user.id);
        if (me?.isFraud) {
          setIsFraud(true);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Load Tickets
    try {
      const ticketsRes = await fetch("http://localhost:5000/api/vendor/tickets", {
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

    // Load Bookings
    try {
      const bookingsRes = await fetch("http://localhost:5000/api/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBookings(false);
    }

    // Load Stats
    try {
      const statsRes = await fetch("http://localhost:5000/api/vendor/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

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

      // 1. Upload ticket image to ImgBB
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "e137d11ae145b9f6610a6d8377ef5413";
        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData,
        });

        if (!imgbbRes.ok) {
          const errData = await imgbbRes.json().catch(() => ({}));
          const errMsg = errData.error?.message || `ImgBB image upload failed (status ${imgbbRes.status}).`;
          throw new Error(errMsg);
        }

        const imgData = await imgbbRes.json();
        imageUrl = imgData.data?.url || "";
      }

      // 2. Submit ticket to backend Express Server
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }

      const isEdit = !!editingTicketId;
      const url = isEdit 
        ? `http://localhost:5000/api/tickets/${editingTicketId}`
        : "http://localhost:5000/api/tickets";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title,
        from,
        to,
        transportType,
        departureDateTime,
        price: Number(price),
        ticketQuantity: Number(ticketQuantity),
        perks,
      };

      if (imageUrl) {
        payload.image = imageUrl;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ticket.");
      }

      const successMsg = isEdit 
        ? "Ticket updated successfully! Awaiting Admin approval."
        : "Ticket added successfully! Awaiting Admin approval.";

      setSuccess(successMsg);
      toast.success(successMsg);
      
      // Reset form
      setTitle("");
      setFrom("");
      setTo("");
      setDepartureDateTime("");
      setPrice("");
      setTicketQuantity("");
      setImageFile(null);
      setPerks([]);
      setEditingTicketId(null);
      
      // Refresh tickets
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
    
    // Format date string for datetime-local input
    if (ticket.departureDateTime) {
      const dateObj = new Date(ticket.departureDateTime);
      const localISO = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDepartureDateTime(localISO);
    } else {
      setDepartureDateTime("");
    }

    setPrice(ticket.price.toString());
    setTicketQuantity(ticket.ticketQuantity.toString());
    setPerks(ticket.perks || []);
    
    router.push("/dashboard/vendor?tab=add-ticket");
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
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
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete ticket.");
      }

      toast.success("Ticket deleted successfully.");
      fetchData();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    setError("");
    setActionLoading(bookingId);

    try {
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      toast.success(`Booking successfully ${status}!`);
      fetchData();
    } catch (err) {
      const errMsg = err.message || "Action failed.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setActionLoading("");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-md">Approved</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded-md">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 rounded-md">Pending</span>;
    }
  };

  const COLORS = ["#386629", "#80B5D2", "#3D54AC"];

  // Pagination filters
  const indexOfLastTicket = ticketPage * itemsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - itemsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalTicketPages = Math.ceil(tickets.length / itemsPerPage);

  const indexOfLastBooking = bookingPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalBookingPages = Math.ceil(bookings.length / itemsPerPage);

  return (
    <div className="space-y-10">
      
      {error && (
        <Alert variant="destructive" className="liftup">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Operation error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-250 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 liftup animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* 1. Vendor Profile Workspace Tab */}
      {activeTab === "profile" && (
        <>
          <section className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 liftup">
            <div className="flex items-center space-x-6">
              <img
                src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt={session?.user?.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-[var(--primary)] shadow-sm"
              />
              <div className="space-y-0.5">
                <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">{session?.user?.name}</h1>
                <span className="text-xs text-gray-500 block">{session?.user?.email}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">Vendor Business Account</span>
              </div>
            </div>
            
            {isFraud && (
              <Alert variant="destructive" className="animate-pulse max-w-xs">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Suspended</AlertTitle>
                <AlertDescription>ACCOUNT SUSPENDED: FRAUD FLAGGED</AlertDescription>
              </Alert>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between shadow-sm liftup">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Total Revenue</span>
                <span className="text-4xl font-black text-[var(--primary)]">
                  ${loadingStats ? "..." : <CountUp end={stats.revenue} />}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold mt-4 block">Calculated from completed checkout sessions.</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between shadow-sm liftup">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Customer Bookings</span>
                <span className="text-4xl font-black text-[var(--accent)]">
                  {loadingStats ? "..." : <CountUp end={stats.totalBookings} />}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold mt-4 block">Total tickets reserved by commuters.</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between shadow-sm liftup">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Listed Routes</span>
                <span className="text-4xl font-black text-[var(--primary)]">
                  {loadingTickets ? "..." : <CountUp end={tickets.length} />}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold mt-4 block">Routes currently online or pending review.</span>
            </div>
          </section>
        </>
      )}

      {/* 2. Add Ticket Tab */}
      {activeTab === "add-ticket" && (
        <section className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-[var(--primary)]" />
            <span>{editingTicketId ? "Modify Listed Route" : "List New Commute Route"}</span>
          </h2>

          <form 
            onSubmit={handleAddTicket}
            className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 liftup"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Route Title</label>
              <Input
                type="text"
                required
                disabled={isFraud || formLoading}
                placeholder="AC Premium Express Class"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 text-xs"
              />
            </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-400">Leaving From</label>
                 <Input
                   type="text"
                   required
                   disabled={isFraud || formLoading}
                   placeholder="Dhaka"
                   value={from}
                   onChange={(e) => setFrom(e.target.value)}
                   className="h-11 text-xs"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-400">Going To</label>
                 <Input
                   type="text"
                   required
                   disabled={isFraud || formLoading}
                   placeholder="Cox's Bazar"
                   value={to}
                   onChange={(e) => setTo(e.target.value)}
                   className="h-11 text-xs"
                 />
               </div>
             </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Transport Type</label>
              <Select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                disabled={isFraud || formLoading}
                className="h-11 text-xs"
              >
                <option value="bus">Coach (Bus)</option>
                <option value="train">Train</option>
                <option value="air">Flight (Air)</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Departure Schedule</label>
              <Input
                type="datetime-local"
                required
                disabled={isFraud || formLoading}
                value={departureDateTime}
                onChange={(e) => setDepartureDateTime(e.target.value)}
                className="h-11 text-xs text-slate-800 dark:text-slate-100"
              />
            </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-400">Seat Price ($)</label>
                 <Input
                   type="number"
                   required
                   min="1"
                   disabled={isFraud || formLoading}
                   placeholder="25"
                   value={price}
                   onChange={(e) => setPrice(e.target.value)}
                   className="h-11 text-xs"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-400">Available Seats Qty</label>
                 <Input
                   type="number"
                   required
                   min="1"
                   disabled={isFraud || formLoading}
                   placeholder="40"
                   value={ticketQuantity}
                   onChange={(e) => setTicketQuantity(e.target.value)}
                   className="h-11 text-xs"
                 />
               </div>
             </div>

            {/* Perks checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 block">Amenities / Perks</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--input)]/40 p-4 rounded-xl border border-[var(--border)]/50">
                {["AC", "Wi-Fi", "Water", "Snacks"].map((perk) => (
                  <label key={perk} className="flex items-center space-x-2 text-xs font-bold text-foreground/70 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={perks.includes(perk)}
                      onChange={() => handlePerkChange(perk)}
                      disabled={isFraud || formLoading}
                      className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                    />
                    <span>{perk}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Ticket Banner Image</label>
              <Input
                type="file"
                accept="image/*"
                disabled={isFraud || formLoading}
                onChange={(e) => setImageFile(e.target.files[0])}
                className="h-11 text-xs file:mr-4 file:py-2 file:px-3 file:border-0 file:bg-white/10 file:text-[10px] file:font-bold file:text-[var(--primary)] hover:file:opacity-80 flex items-center"
              />
            </div>

            <div className="flex space-x-3">
              {editingTicketId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTicketId(null);
                    setTitle("");
                    setFrom("");
                    setTo("");
                    setDepartureDateTime("");
                    setPrice("");
                    setTicketQuantity("");
                    setPerks([]);
                    setImageFile(null);
                    router.push("/dashboard/vendor?tab=tickets");
                  }}
                  className="flex-1 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={isFraud || formLoading}
                className="flex-1 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-450 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{editingTicketId ? "Save Changes" : "Create Ticket"}</span>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 3. My Added Tickets Tab */}
      {activeTab === "tickets" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-[var(--primary)]" />
              <span>My Listed Commutes</span>
            </h2>
            <button
              onClick={() => router.push("/dashboard/vendor?tab=add-ticket")}
              className="py-2 px-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Route</span>
            </button>
          </div>

          {loadingTickets ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-60 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-12 text-center text-gray-500 text-sm font-medium liftup">
              No tickets listed by your company yet.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentTickets.map((t) => {
                  const isRejected = t.status === "rejected";
                  return (
                    <div 
                      key={t._id} 
                      className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-5 flex flex-col justify-between shadow-sm liftup"
                    >
                      <div className="space-y-4">
                        <img 
                          src={t.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400"} 
                          alt={t.title} 
                          className="w-full h-36 object-cover rounded-2xl border border-[var(--border)]/30"
                        />
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-[var(--primary)] tracking-wider">
                          <span>{t.transportType} Class</span>
                          {getStatusBadge(t.status)}
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">{t.title}</h3>
                          <p className="text-xs text-gray-500 font-medium">{t.from} ➔ {t.to}</p>
                          <p className="text-xs text-gray-400 font-semibold">Departs: {new Date(t.departureDateTime).toLocaleString()}</p>
                          {t.perks && t.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {t.perks.map(p => (
                                <span key={p} className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-[9px] font-extrabold tracking-wider">{p}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800/80 mt-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 font-bold">Fare: <strong>${t.price}</strong></span>
                          <span className="text-gray-400 font-bold">Seats: <strong>{t.ticketQuantity} left</strong></span>
                        </div>
                        <div className="flex space-x-2 pt-1">
                          <button
                            onClick={() => handleSelectUpdate(t)}
                            disabled={isRejected || actionLoading === t._id}
                            className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 font-bold text-xs rounded-xl border border-indigo-100/50 dark:border-indigo-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Update</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(t._id)}
                            disabled={isRejected || actionLoading === t._id}
                            className="flex-1 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-100/50 dark:border-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ticket list pagination */}
              {totalTicketPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-4">
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

      {/* 4. Requested Bookings Tab */}
      {activeTab === "bookings" && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold flex items-center space-x-2 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            <span>Requested Customer Bookings</span>
          </h2>

          {loadingBookings ? (
            <div className="h-40 bg-gray-250 animate-pulse rounded-2xl" />
          ) : bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-8 text-center text-gray-500 text-xs font-medium liftup">
              No booking requests received from travelers.
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm liftup">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)] font-bold uppercase text-gray-500 tracking-wider">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Ticket Route</th>
                        <th className="p-4">Bill Details</th>
                        <th className="p-4">Status / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                      {currentBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{b.userName}</span>
                            <span className="text-[10px] text-gray-400 block">{b.userEmail}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold block">{b.ticketTitle}</span>
                            <span className="text-[10px] text-gray-400 capitalize block">{b.transportType} travel</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold block">{b.bookedQuantity} seats</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">${b.totalPrice}</span>
                          </td>
                          <td className="p-4">
                            {b.status === "pending" ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleBookingAction(b._id, "accepted")}
                                  disabled={actionLoading === b._id}
                                  className="px-2.5 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleBookingAction(b._id, "rejected")}
                                  disabled={actionLoading === b._id}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center space-x-1 border border-red-100"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <div className="capitalize text-slate-600 dark:text-slate-400">
                                {b.status === "paid" ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-lg">Paid</span>
                                ) : b.status === "accepted" ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded-lg">Accepted</span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded-lg">Rejected</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bookings pagination */}
              {totalBookingPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-4">
                  <button
                    onClick={() => setBookingPage(prev => Math.max(prev - 1, 1))}
                    disabled={bookingPage === 1}
                    className="px-3.5 py-1.5 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {bookingPage} of {totalBookingPages}
                  </span>
                  <button
                    onClick={() => setBookingPage(prev => Math.min(prev + 1, totalBookingPages))}
                    disabled={bookingPage === totalBookingPages}
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

      {/* 5. Revenue Overview Tab */}
      {activeTab === "revenue" && mounted && (
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
            <span>Revenue Breakdown Dashboard</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between shadow-sm liftup">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Accumulated Earnings</span>
                <span className="text-4xl font-black text-[var(--primary)]">
                  ${loadingStats ? "..." : <CountUp end={stats.revenue} />}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold mt-4 block">Based on cleared commuter card checkouts.</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between shadow-sm liftup">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Total Seats Purchased</span>
                <span className="text-4xl font-black text-[var(--accent)]">
                  {loadingStats ? "..." : <CountUp end={stats.totalBookings} />}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold mt-4 block">Commuters booked through listed classes.</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4 liftup">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500">Sales Split by Transport Type</h3>
            <div className="h-64 w-full">
              {!loadingStats && stats.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="revenue" fill="#386629" radius={[6, 6, 0, 0]}>
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No revenue split data online.</div>
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default function VendorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VendorDashboardContent />
    </Suspense>
  );
}
export const dynamic = "force-dynamic";
