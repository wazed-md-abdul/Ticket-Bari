import { useState, useEffect, Suspense } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import CountUp from "@/components/CountUp";
import { 
  User, Mail, CreditCard, Ticket, Calendar, ShieldCheck, 
  Clock, ShieldAlert, ArrowRight, Loader2, ListFilter, DollarSign
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
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [departureDateTime, status]);

  if (status === "rejected") return null;
  if (!timeLeft) {
    return <span className="text-[10px] font-bold text-red-500 uppercase">Boarding Passed</span>;
  }

  return (
    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-500 mt-1">
      <Clock className="w-3.5 h-3.5 animate-pulse text-[var(--primary)]" />
      <span>Boarding in:</span>
      <span className="font-black bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)] px-1.5 py-0.5 rounded">
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

  const activeTab = searchParams.get("tab") || "profile";

  // Pagination states
  const [bookingPage, setBookingPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!session?.user) return;

    const fetchUserDashboardData = async () => {
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }

      // Fallback: Confirm payment on redirect (handles local environment where Stripe webhooks can't reach)
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const statusParam = searchParams.get("status");
        const bookingIdParam = searchParams.get("bookingId");

        if (statusParam === "success" && bookingIdParam) {
          try {
            await fetch(`http://localhost:5000/api/bookings/${bookingIdParam}/pay`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            // Clean up URL query parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err) {
            console.error("Local payment confirmation failed:", err);
          }
        }
      }

      // 1. Fetch Bookings
      try {
        const bookingsRes = await fetch("http://localhost:5000/api/bookings", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
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

      // 2. Fetch Transactions
      try {
        const txRes = await fetch("http://localhost:5000/api/transactions", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout initiation failed.");
      }

      // Redirect user to Stripe Checkout window
      window.location.href = data.url;
    } catch (err) {
      const errMsg = err.message || "Payment trigger failed.";
      setError(errMsg);
      toast.error(errMsg);
      setPaymentLoading("");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">Paid</span>;
      case "accepted":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg">Accepted</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 rounded-lg">Pending Review</span>;
    }
  };

  // Math for stats cards
  const totalBookingsCount = bookings.length;
  const paidBookingsCount = bookings.filter(b => b.status === "paid").length;
  const totalAmountSpent = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);

  // Paginated bookings
  const indexOfLastBooking = bookingPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalBookingPages = Math.ceil(bookings.length / itemsPerPage);

  // Paginated transactions
  const indexOfLastTx = txPage * itemsPerPage;
  const indexOfFirstTx = indexOfLastTx - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTx, indexOfLastTx);
  const totalTxPages = Math.ceil(transactions.length / itemsPerPage);

  return (
    <div className="space-y-10">
      
      {error && (
        <Alert variant="destructive" className="liftup">
          <ShieldAlert className="w-4 h-4" />
          <AlertTitle>Error Alert</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 1. Profile Workspace Tab */}
      {activeTab === "profile" && (
        <>
          <section className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 liftup">
            <img
              src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
              alt={session?.user?.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-[var(--primary)] shadow-sm"
            />
            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">{session?.user?.name}</h1>
              <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-gray-500">
                <span className="flex items-center justify-center sm:justify-start space-x-1">
                  <Mail className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>{session?.user?.email}</span>
                </span>
                <span className="flex items-center justify-center sm:justify-start space-x-1 uppercase font-bold text-[var(--primary)]">
                  <User className="w-3.5 h-3.5" />
                  <span>{session?.user?.role} Account</span>
                </span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm flex items-center justify-between liftup">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Bookings</span>
                <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                  {loadingBookings ? "..." : <CountUp end={totalBookingsCount} />}
                </span>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl">
                <Ticket className="w-6 h-6" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm flex items-center justify-between liftup">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Paid Bookings</span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {loadingBookings ? "..." : <CountUp end={paidBookingsCount} />}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-6 shadow-sm flex items-center justify-between liftup">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Spent</span>
                <span className="text-3xl font-black text-[var(--accent)]">
                  ${loadingTx ? "..." : <CountUp end={totalAmountSpent} />}
                </span>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-[var(--accent)] rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </section>
        </>
      )}

      {/* 2. Booked Tickets Tab */}
      {activeTab === "bookings" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-[var(--primary)]" />
              <span>My Booked Tickets</span>
            </h2>
          </div>

          {loadingBookings ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-12 text-center text-gray-500 text-sm font-medium liftup">
              No booking requests made yet. Go grab some tickets!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentBookings.map((booking) => (
                  <div 
                    key={booking._id}
                    className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between liftup"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-[var(--primary)] tracking-wider">
                          {booking.transportType} Travel
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm truncate text-slate-800 dark:text-slate-100">{booking.ticketTitle}</h3>
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                            <span>{new Date(booking.departureDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          {/* Live Countdown */}
                          <BookingCountdown departureDateTime={booking.departureDateTime} status={booking.status} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800/80">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Qty: <strong>{booking.bookedQuantity} seats</strong></span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">${booking.totalPrice}</span>
                      </div>

                      {/* Stripe Pay button */}
                      {booking.status === "accepted" && (
                        (() => {
                          const isExpired = new Date(booking.departureDateTime) < new Date();
                          return isExpired ? (
                            <span className="w-full text-center py-2 bg-gray-100 dark:bg-slate-805 text-gray-400 font-bold text-xs rounded-xl block border border-gray-200/50 dark:border-slate-800/50">
                              Locked (Departure Passed)
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePayNow(booking._id)}
                              disabled={paymentLoading === booking._id}
                              className="w-full py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-md transition-colors"
                            >
                              {paymentLoading === booking._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay Now</span>
                                </>
                              )}
                            </button>
                          );
                        })()
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bookings Pagination */}
              {totalBookingPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-4">
                  <button
                    onClick={() => setBookingPage(prev => Math.max(prev - 1, 1))}
                    disabled={bookingPage === 1}
                    className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {bookingPage} of {totalBookingPages}
                  </span>
                  <button
                    onClick={() => setBookingPage(prev => Math.min(prev + 1, totalBookingPages))}
                    disabled={bookingPage === totalBookingPages}
                    className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* 3. Payments History Tab */}
      {activeTab === "transactions" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
              <span>Payments Transaction History</span>
            </h2>
          </div>

          {loadingTx ? (
            <div className="h-32 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ) : transactions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl p-12 text-center text-gray-500 text-sm font-medium liftup">
              No payments logged yet.
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm liftup">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-[var(--border)] font-bold uppercase tracking-wider text-gray-500">
                        <th className="p-4">Payment Intent ID</th>
                        <th className="p-4">Billing Email</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-350">
                      {currentTransactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="p-4 font-mono select-all text-[11px] text-[var(--accent)]">{tx.paymentIntentId}</td>
                          <td className="p-4">{tx.email}</td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-100">${tx.amount}</td>
                          <td className="p-4 text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Pagination */}
              {totalTxPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-4">
                  <button
                    onClick={() => setTxPage(prev => Math.max(prev - 1, 1))}
                    disabled={txPage === 1}
                    className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {txPage} of {totalTxPages}
                  </span>
                  <button
                    onClick={() => setTxPage(prev => Math.min(prev + 1, totalTxPages))}
                    disabled={txPage === totalTxPages}
                    className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <UserDashboardContent />
    </Suspense>
  );
}
