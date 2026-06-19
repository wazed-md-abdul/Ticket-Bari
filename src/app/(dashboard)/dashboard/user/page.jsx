"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { 
  User, Mail, CreditCard, Ticket, Calendar, ShieldCheck, 
  Clock, ShieldAlert, ArrowRight, Loader2 
} from "lucide-react";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user) return;

    const fetchUserDashboardData = async () => {
      // 1. Fetch Bookings
      try {
        const token = session.session?.token || "";
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
        const token = session.session?.token || "";
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
      setError(err.message || "Payment trigger failed.");
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

  return (
    <div className="space-y-10">
      
      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
          alt={session?.user?.name}
          className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 shadow-sm"
        />
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-2xl font-black">{session?.user?.name}</h1>
          <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-gray-500">
            <span className="flex items-center justify-center sm:justify-start space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{session?.user?.email}</span>
            </span>
            <span className="flex items-center justify-center sm:justify-start space-x-1 uppercase font-bold text-indigo-500">
              <User className="w-3.5 h-3.5" />
              <span>{session?.user?.role} Account</span>
            </span>
          </div>
        </div>
      </section>

      {/* Error prompt */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold border border-red-200">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-indigo-500" />
          <span>My Reserved Tickets</span>
        </h2>

        {loadingBookings ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-12 text-center text-gray-500 text-sm font-medium">
            No booking requests made yet. Go grab some tickets!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking._id}
                className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                    {booking.transportType} Travel
                  </span>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm truncate">{booking.ticketTitle}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(booking.departureDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-gray-100 dark:border-slate-800/80 pt-3">
                  <span className="text-gray-400">Qty: <strong>{booking.bookedQuantity} seats</strong></span>
                  <span className="font-extrabold">${booking.totalPrice}</span>
                </div>

                {/* Stripe Pay button */}
                {booking.status === "accepted" && (
                  <button
                    onClick={() => handlePayNow(booking._id)}
                    disabled={paymentLoading === booking._id}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-md transition-colors"
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
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transaction History Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <span>Payment Transactions</span>
        </h2>

        {loadingTx ? (
          <div className="h-32 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        ) : transactions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-12 text-center text-gray-500 text-sm font-medium">
            No payments logged yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 font-bold uppercase tracking-wider text-gray-500">
                    <th className="p-4">Payment Intent ID</th>
                    <th className="p-4">Billing Email</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-350">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-4 font-mono select-all text-[11px] text-indigo-500">{tx.paymentIntentId}</td>
                      <td className="p-4">{tx.email}</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-100">${tx.amount}</td>
                      <td className="p-4 text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
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
