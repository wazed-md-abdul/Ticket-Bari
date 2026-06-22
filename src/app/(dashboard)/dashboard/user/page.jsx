"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, authClient, updateUser } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import CountUp from "@/components/CountUp";
import {
  User, Mail, CreditCard, Ticket, Calendar, ShieldCheck,
  Clock, ShieldAlert, Loader2, DollarSign,
  ChevronLeft, ChevronRight, Search, Filter, Activity,
  CheckCircle, XCircle, TrendingUp, Wallet, Receipt, Hash,
  Edit3, X
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

function BookingCountdown({ departureDateTime, status }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (status === "rejected") {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const difference = +new Date(departureDateTime) - +new Date();
      if (difference <= 0) return null;
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      const remaining = calculateTime();
      setTimeLeft(remaining);
      if (!remaining) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [departureDateTime, status]);

  if (status === "rejected") return null;

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-xl">
        <Clock className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Boarding Passed</span>
      </div>
    );
  }

  const units = [
    { label: "D", value: timeLeft.days },
    { label: "H", value: timeLeft.hours },
    { label: "M", value: timeLeft.minutes },
    { label: "S", value: timeLeft.seconds },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
        <Clock className="w-3 h-3 animate-pulse text-[var(--primary)]" />
        Departs in
      </div>
      <div className="flex items-center gap-1.5">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className="flex flex-col items-center min-w-[36px] bg-[var(--primary)]/8 dark:bg-[var(--primary)]/10 border border-[var(--primary)]/15 rounded-lg px-2 py-1">
              <span className="text-sm font-black text-[var(--primary)] leading-none tabular-nums">
                {String(value).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold text-[var(--primary)]/60 uppercase tracking-wider mt-0.5">
                {label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="text-[var(--primary)]/40 font-black text-xs mb-2">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


function UserDashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState("");
  const [error, setError] = useState("");

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

  // Search states
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  const activeTab = searchParams.get("tab") || "profile";

  // Pagination states
  const [bookingPage, setBookingPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const itemsPerPage = 8;

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

  useEffect(() => {
    if (!session?.user) return;

    const fetchUserDashboardData = async () => {
      const token = await getToken();

      // Confirm payment on redirect (handles local env where Stripe webhooks can't reach)
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const statusParam = sp.get("status");
        const bookingIdParam = sp.get("bookingId");

        if (statusParam === "success" && bookingIdParam) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingIdParam}/pay`, {
              method: "PUT",
              headers: { "Authorization": `Bearer ${token}` }
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err) {
            console.error("Local payment confirmation failed:", err);
          }
        }
      }

      // Fetch Bookings
      try {
        const bookingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings?as=passenger`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }
      } catch (e) {
        console.error("Error loading user bookings:", e);
      } finally {
        setLoadingBookings(false);
      }

      // Fetch Transactions
      try {
        const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }
      } catch (e) {
        console.error("Error loading user transactions:", e);
      } finally {
        setLoadingTx(false);
      }
    };

    fetchUserDashboardData();
  }, [session]);

  const handlePayNow = async (bookingId) => {
    setError("");
    setPaymentLoading(bookingId);
    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout initiation failed.");
      window.location.href = data.url;
    } catch (err) {
      const errMsg = err.message || "Payment trigger failed.";
      setError(errMsg);
      toast.error(errMsg);
      setPaymentLoading("");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accepted: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
    const icons = {
      paid: <CheckCircle className="w-3 h-3 mr-1" />,
      accepted: <ShieldCheck className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
    };
    const labels = { paid: "Paid", accepted: "Accepted", rejected: "Rejected", pending: "Pending" };
    const s = status || "pending";
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${styles[s] || styles.pending}`}>
        {icons[s] || icons.pending}
        {labels[s] || "Pending"}
      </span>
    );
  };

  // Stats
  const totalBookingsCount = bookings.length;
  const paidBookingsCount = bookings.filter(b => b.status === "paid").length;
  const acceptedCount = bookings.filter(b => b.status === "accepted").length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const totalAmountSpent = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = !bookingSearch ||
      b.ticketTitle?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.transportType?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalBookingPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice((bookingPage - 1) * itemsPerPage, bookingPage * itemsPerPage);

  // Paginated transactions
  const totalTxPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);

  // Reusable Pagination
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
          <ShieldAlert className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ============ TAB 1: USER PROFILE ============ */}
      {activeTab === "profile" && (
        <div className="space-y-8">

          {/* Profile Banner */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-8 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <img
                    src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt={session?.user?.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center border-2 border-slate-900">
                    <User className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h1 className="text-2xl font-black text-white">{session?.user?.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-slate-300">
                      <Mail className="w-3.5 h-3.5" />
                      {session?.user?.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                      <User className="w-3 h-3" />
                      Passenger Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Time and Action */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {currentTime && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
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

          {/* Overview Stats Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: totalBookingsCount, icon: Ticket, color: "var(--primary)", loading: loadingBookings },
              { label: "Paid Trips", value: paidBookingsCount, icon: CheckCircle, color: "#10b981", loading: loadingBookings },
              { label: "Awaiting Payment", value: acceptedCount, icon: Wallet, color: "#6366f1", loading: loadingBookings },
              { label: "Total Spent", value: totalAmountSpent, icon: DollarSign, color: "#f59e0b", loading: loadingTx, prefix: "$" },
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

          {/* Booking Status Breakdown */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Paid", count: paidBookingsCount, color: "#10b981", icon: CheckCircle },
              { label: "Pending", count: pendingCount, color: "#f59e0b", icon: Clock },
              { label: "Accepted", count: acceptedCount, color: "#6366f1", icon: ShieldCheck },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="text-2xl font-black" style={{ color: item.color }}>
                  {loadingBookings ? "..." : <CountUp end={item.count} />}
                </span>
                <div className="mt-3 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ backgroundColor: item.color, width: totalBookingsCount ? `${(item.count / totalBookingsCount) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Recent Activity */}
          <section className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              Recent Bookings
            </h3>
            {loadingBookings ? (
              <SkeletonRows count={3} />
            ) : bookings.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No bookings yet. Start exploring tickets!</p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                        <Ticket className="w-4 h-4 text-[var(--primary)]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{b.ticketTitle}</span>
                        <span className="text-[10px] text-gray-400 capitalize">{b.transportType} • {b.bookedQuantity} seats</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">${b.totalPrice}</span>
                      {getStatusBadge(b.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ============ TAB 2: MY BOOKED TICKETS ============ */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[var(--primary)]" />
              My Booked Tickets
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {filteredBookings.length}
              </span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or transport type..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-slate-50/30 dark:bg-slate-950/30 border border-[var(--border)] rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 h-10 bg-slate-50/30 dark:bg-slate-950/30 border border-[var(--border)] rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loadingBookings ? (
            <SkeletonRows count={4} />
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-12 text-center">
              <Ticket className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No bookings found.</p>
              <p className="text-[10px] text-gray-400 mt-1">Start exploring tickets to book your first trip!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentBookings.map((booking) => {
                  const isExpired = new Date(booking.departureDateTime) < new Date();
                  return (
                    <div
                      key={booking._id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        booking.status === "paid"
                          ? "border-emerald-500/30 ring-1 ring-emerald-500/10"
                          : booking.status === "accepted"
                          ? "border-indigo-500/30 ring-1 ring-indigo-500/10"
                          : booking.status === "rejected"
                          ? "border-red-500/20"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {/* Ticket Image */}
                      {booking.image ? (
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={booking.image}
                            alt={booking.ticketTitle}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {/* Status badge over image */}
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(booking.status)}
                          </div>
                          {/* Transport type */}
                          <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {booking.transportType}
                          </span>
                        </div>
                      ) : (
                        <div className="relative h-24 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 flex items-center justify-center border-b border-[var(--border)]">
                          <Ticket className="w-8 h-8 text-[var(--primary)]/40" />
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(booking.status)}
                          </div>
                          <span className="absolute bottom-3 left-3 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {booking.transportType}
                          </span>
                        </div>
                      )}

                      <div className="p-4 flex flex-col flex-1 space-y-3">
                        {/* Title */}
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
                            {booking.ticketTitle}
                          </h3>
                        </div>

                        {/* Route: From → To */}
                        {(booking.from || booking.to) && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl">
                            <span className="truncate max-w-[80px]">{booking.from || "—"}</span>
                            <span className="text-[var(--primary)] flex-shrink-0">→</span>
                            <span className="truncate max-w-[80px]">{booking.to || "—"}</span>
                          </div>
                        )}

                        {/* Departure */}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                          <span>{new Date(booking.departureDateTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>

                        {/* Countdown */}
                        <BookingCountdown departureDateTime={booking.departureDateTime} status={booking.status} />

                        {/* Pricing + Qty */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-800/50">
                          <div className="text-[10px] text-gray-400 space-y-0.5">
                            <div>
                              <span className="font-bold text-slate-600 dark:text-slate-400">{booking.bookedQuantity}</span>
                              <span> seat{booking.bookedQuantity > 1 ? "s" : ""}</span>
                            </div>
                            {booking.unitPrice && (
                              <div>${booking.unitPrice} × {booking.bookedQuantity}</div>
                            )}
                          </div>
                          <span className="font-black text-slate-800 dark:text-slate-100 text-base">
                            ${booking.totalPrice}
                          </span>
                        </div>

                        {/* Pay Now / Expired / Status msg */}
                        {booking.status === "accepted" && (
                          <div className="mt-auto pt-1">
                            {isExpired ? (
                              <div className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                Departure Passed — Payment Locked
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePayNow(booking._id)}
                                disabled={paymentLoading === booking._id}
                                className="w-full py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/25 transition-all active:scale-[0.98] disabled:opacity-60"
                              >
                                {paymentLoading === booking._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Pay Now — ${booking.totalPrice}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination page={bookingPage} totalPages={totalBookingPages} setPage={setBookingPage} />
            </>
          )}
        </div>
      )}

      {/* ============ TAB 3: TRANSACTION HISTORY ============ */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[var(--primary)]" />
              Transaction History
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {transactions.length}
              </span>
            </h2>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Total Transactions", value: transactions.length, color: "#6366f1", icon: Hash },
              { label: "Total Spent", value: totalAmountSpent, color: "#10b981", icon: DollarSign, prefix: "$" },
              { label: "Avg per Transaction", value: transactions.length ? Math.round(totalAmountSpent / transactions.length) : 0, color: "#f59e0b", icon: TrendingUp, prefix: "$" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <span className="text-2xl font-black" style={{ color: s.color }}>
                  {loadingTx ? "..." : <>{s.prefix}<CountUp end={s.value} /></>}
                </span>
              </div>
            ))}
          </div>

          {loadingTx ? (
            <SkeletonRows count={4} />
          ) : transactions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-12 text-center">
              <Receipt className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No transactions yet.</p>
              <p className="text-[10px] text-gray-400 mt-1">Completed payments will appear here.</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)]">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Payment ID</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Email</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Amount</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                      {currentTransactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-[11px] text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-1 rounded select-all">
                              {tx.paymentIntentId}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 font-medium">{tx.email}</td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-100">${tx.amount}</td>
                          <td className="p-4 text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination page={txPage} totalPages={totalTxPages} setPage={setTxPage} />
            </>
          )}
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
                  className="w-full px-3 h-10 rounded-lg bg-[var(--input)] border border-[var(--border)] text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files[0])}
                  className="w-full px-3 py-1.5 h-10 rounded-lg bg-[var(--input)] border border-[var(--border)] text-foreground file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:opacity-80 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] flex items-center"
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

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    }>
      <UserDashboardContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
