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
  Edit3, X, Zap
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
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-xl">
        <Clock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
        <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Departure Passed</span>
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
      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        <Clock className="w-3 h-3 animate-pulse text-cyan-400" />
        Departs in
      </div>
      <div className="flex items-center gap-1.5">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className="flex flex-col items-center min-w-[34px] bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-2 py-1">
              <span className="text-xs font-black text-cyan-400 leading-none tabular-nums">
                {String(value).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold text-cyan-400/60 uppercase tracking-wider mt-0.5">
                {label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="text-cyan-400/40 font-black text-xs mb-1">:</span>
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

  // Profile Modal states
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

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPage, setBookingPage] = useState(1);

  const [txSearch, setTxSearch] = useState("");
  const [txPage, setTxPage] = useState(1);

  const itemsPerPage = 6;

  const getToken = async () => {
    try {
      const tokenRes = await authClient.token();
      return tokenRes?.data?.token || "";
    } catch (e) {
      console.error("Error retrieving JWT token:", e);
      return "";
    }
  };

  const fetchUserData = async () => {
    if (!session?.user) return;
    const token = await getToken();

    // Fetch User Bookings
    try {
      const bookingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings?as=passenger`, {
        headers: { Authorization: `Bearer ${token}` },
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

    // Fetch User Transactions
    try {
      const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  useEffect(() => {
    const status = searchParams?.get("status");
    const bookingId = searchParams?.get("bookingId");

    if (status === "success") {
      if (bookingId) {
        fetch("/api/checkout_sessions/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              toast.success("Payment completed successfully! Booking confirmed.");
            } else {
              toast.error(data.error || "Payment completed, syncing status...");
            }
            fetchUserData();
          })
          .catch(() => {
            fetchUserData();
          });
      } else {
        toast.success("Payment completed successfully!");
        fetchUserData();
      }
    } else if (status === "cancel") {
      toast.error("Payment process was cancelled.");
    }
  }, [searchParams]);

  const handlePayNow = async (bookingId) => {
    setPaymentLoading(bookingId);
    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment session initialization failed.");

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No Stripe checkout URL received.");
      }
    } catch (err) {
      toast.error(err.message || "Payment failed.");
      setPaymentLoading("");
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !bookingSearch ||
      b.ticketTitle?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.from?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.to?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBookingPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice((bookingPage - 1) * itemsPerPage, bookingPage * itemsPerPage);

  // Filtered Transactions
  const filteredTx = transactions.filter((t) => {
    return (
      !txSearch ||
      t.paymentIntentId?.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.bookingId?.toLowerCase().includes(txSearch.toLowerCase())
    );
  });

  const totalTxPages = Math.ceil(filteredTx.length / itemsPerPage);
  const currentTx = filteredTx.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);

  // Computed stats
  const totalExpenditure = bookings
    .filter((b) => b.status === "paid")
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  const activeTripsCount = bookings.filter(
    (b) => b.status === "paid" && new Date(b.departureDateTime) > new Date()
  ).length;

  const getStatusBadge = (status) => {
    const s = status || "pending";
    if (s === "paid" || s === "accepted") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3 mr-1" /> {s}
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Clock className="w-3 h-3 mr-1" /> Pending Approval
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
      {/* User Profile / Hero Banner */}
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
                      PASSENGER ACCOUNT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-5 py-2.5 nexus-pill-btn rounded-2xl text-xs flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </section>

          {/* User Overview Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: "Total Booked Tickets", value: bookings.length, icon: Ticket, color: "#00f2fe" },
              { label: "Active Upcoming Trips", value: activeTripsCount, icon: Calendar, color: "#10b981" },
              { label: "Total Expenditure", value: `$${totalExpenditure.toLocaleString()}`, icon: DollarSign, color: "#f59e0b" },
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

      {/* ============ TAB: MY BOOKED TICKETS ============ */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-cyan-400" /> My Booked Tickets
            </h2>
          </div>

          {loadingBookings ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-900/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : currentBookings.length === 0 ? (
            <div className="nexus-card rounded-3xl p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No ticket bookings found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentBookings.map((b) => (
                  <div key={b._id} className="nexus-card rounded-3xl overflow-hidden space-y-4 p-5 flex flex-col justify-between">
                    <div>
                      {b.image && (
                        <img src={b.image} alt={b.ticketTitle} className="w-full h-36 object-cover rounded-2xl mb-3" />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase">
                          {b.transportType || "Ticket"}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">{b.ticketTitle}</h3>
                      <p className="text-xs text-cyan-400 font-medium mt-0.5">{b.from} → {b.to}</p>

                      <div className="mt-3 pt-3 border-t border-slate-800/80">
                        <BookingCountdown departureDateTime={b.departureDateTime} status={b.status} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-white">${b.totalPrice}</span>
                        <span className="text-[10px] text-slate-500 block">{b.bookedQuantity} seats</span>
                      </div>
                      {b.status === "accepted" && (
                        <button
                          onClick={() => handlePayNow(b._id)}
                          disabled={paymentLoading === b._id}
                          className="px-4 py-2 nexus-pill-btn rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                        >
                          {paymentLoading === b._id ? "Processing..." : "Confirm & Pay"}
                        </button>
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

      {/* ============ TAB: TRANSACTION HISTORY ============ */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" /> Transaction Payment History
            </h2>
          </div>

          {loadingTx ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-900/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : currentTx.length === 0 ? (
            <div className="nexus-card rounded-3xl p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No payment transactions found.</p>
            </div>
          ) : (
            <>
              <div className="nexus-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#091119] border-b border-slate-800">
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Payment ID</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Booking Reference</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Amount Paid</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Date</th>
                        <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentTx.map((tx) => (
                        <tr key={tx._id} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="p-4 font-mono text-cyan-400 text-xs">{tx.paymentIntentId || tx._id}</td>
                          <td className="p-4 text-slate-300 font-medium">{tx.bookingId}</td>
                          <td className="p-4 font-black text-white">${tx.amount}</td>
                          <td className="p-4 text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3 mr-1" /> PAID
                            </span>
                          </td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md nexus-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Edit Profile</h2>
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
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-900/40 rounded-3xl animate-pulse" />
        ))}
      </div>
    }>
      <UserDashboardContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
