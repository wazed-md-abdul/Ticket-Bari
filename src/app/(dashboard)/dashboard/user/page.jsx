"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import CountUp from "@/components/CountUp";
import {
  User, Mail, CreditCard, Ticket, Calendar, ShieldCheck,
  Clock, ShieldAlert, Loader2, DollarSign,
  ChevronLeft, ChevronRight, Search, Filter, Activity,
  CheckCircle, XCircle, TrendingUp, Wallet, Receipt, Hash
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
    return <span className="text-[10px] font-bold text-red-500 uppercase">Boarding Passed</span>;
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--primary)] mt-1">
      <Clock className="w-3.5 h-3.5 animate-pulse" />
      <span>Boarding in:</span>
      <span className="font-black bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
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
        const bookingsRes = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/bookings", {
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
        const txRes = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/transactions", {
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
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                      booking.status === "paid"
                        ? "border-emerald-500/30 ring-1 ring-emerald-500/10"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {booking.transportType}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{booking.ticketTitle}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>{new Date(booking.departureDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <BookingCountdown departureDateTime={booking.departureDateTime} status={booking.status} />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800/50 mt-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Qty: <strong>{booking.bookedQuantity} seats</strong></span>
                        <span className="font-black text-slate-800 dark:text-slate-100 text-sm">${booking.totalPrice}</span>
                      </div>

                      {booking.status === "accepted" && (
                        (() => {
                          const isExpired = new Date(booking.departureDateTime) < new Date();
                          return isExpired ? (
                            <span className="w-full text-center py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-400 font-bold text-xs rounded-xl block">
                              Locked (Departure Passed)
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePayNow(booking._id)}
                              disabled={paymentLoading === booking._id}
                              className="w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/25 transition-all disabled:opacity-50"
                            >
                              {paymentLoading === booking._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <><CreditCard className="w-3.5 h-3.5" /> Pay Now</>
                              )}
                            </button>
                          );
                        })()
                      )}
                    </div>
                  </div>
                ))}
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
