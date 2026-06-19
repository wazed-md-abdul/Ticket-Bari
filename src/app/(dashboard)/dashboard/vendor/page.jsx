"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { 
  User, Mail, Ticket, PlusCircle, CheckCircle, XCircle, 
  AlertTriangle, DollarSign, Calendar, RefreshCw, Loader2 
} from "lucide-react";

export default function VendorDashboard() {
  const { data: session } = useSession();
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

  // Form states
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transportType, setTransportType] = useState("bus");
  const [departureDateTime, setDepartureDateTime] = useState("");
  const [price, setPrice] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!session?.user) return;
    const token = session.session?.token || "";

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
          throw new Error("ImgBB image upload failed.");
        }

        const imgData = await imgbbRes.json();
        imageUrl = imgData.data?.url || "";
      }

      // 2. Submit ticket to backend Express Server
      const token = session.session?.token || "";
      const res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          from,
          to,
          transportType,
          departureDateTime,
          price: Number(price),
          ticketQuantity: Number(ticketQuantity),
          image: imageUrl,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add ticket.");
      }

      setSuccess("Ticket added successfully! Awaiting Admin approval.");
      setTitle("");
      setFrom("");
      setTo("");
      setDepartureDateTime("");
      setPrice("");
      setTicketQuantity("");
      setImageFile(null);
      
      // Refresh ticket grid
      fetchData();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    setError("");
    setActionLoading(bookingId);

    try {
      const token = session.session?.token || "";
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update booking status.");
      }

      fetchData();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setActionLoading("");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-md">Approved</span>;
      case "rejected":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded-md">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 rounded-md">Pending Approval</span>;
    }
  };

  const COLORS = ["#6366f1", "#06b6d4", "#10b981"];

  return (
    <div className="space-y-10">
      
      {/* Profile Banner */}
      <section className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <img
            src={session?.user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
            alt={session?.user?.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-indigo-500 shadow-sm"
          />
          <div className="space-y-0.5">
            <h1 className="text-xl font-black">{session?.user?.name}</h1>
            <span className="text-xs text-gray-500 block">{session?.user?.email}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Vendor Business Account</span>
          </div>
        </div>
        
        {isFraud && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>ACCOUNT SUSPENDED: FRAUD FLAGGED</span>
          </div>
        )}
      </section>

      {/* Stats and Analytics Charts */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Total Revenue</span>
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                ${loadingStats ? "..." : stats.revenue}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold mt-4 block">Calculated from completed card checkout sessions.</span>
          </div>

          {/* Recharts stats chart */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 lg:col-span-2 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500">Revenue Split by Vehicle</h3>
            <div className="h-44 w-full">
              {!loadingStats && stats.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No revenue data available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ticket List and Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Ticket Form */}
        <div className="lg:col-span-1">
          <form 
            onSubmit={handleAddTicket}
            className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
          >
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center space-x-2">
              <PlusCircle className="w-4.5 h-4.5" />
              <span>Add New Ticket</span>
            </h2>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold">
                {success}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Route Title</label>
              <input
                type="text"
                required
                disabled={isFraud || formLoading}
                placeholder="e.g. Non-Stop Air Coach"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">From</label>
                <input
                  type="text"
                  required
                  disabled={isFraud || formLoading}
                  placeholder="Dhaka"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-205 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">To</label>
                <input
                  type="text"
                  required
                  disabled={isFraud || formLoading}
                  placeholder="Cox's Bazar"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-205 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Transport Vehicle</label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                disabled={isFraud || formLoading}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-205 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="bus">Coach (Bus)</option>
                <option value="train">Train</option>
                <option value="air">Flight (Air)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Departure Schedule</label>
              <input
                type="datetime-local"
                required
                disabled={isFraud || formLoading}
                value={departureDateTime}
                onChange={(e) => setDepartureDateTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-205 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Price ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  disabled={isFraud || formLoading}
                  placeholder="25"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-205 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Seats Qty</label>
                <input
                  type="number"
                  required
                  min="1"
                  disabled={isFraud || formLoading}
                  placeholder="40"
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-205 dark:border-slate-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Ticket Banner Image</label>
              <input
                type="file"
                accept="image/*"
                disabled={isFraud || formLoading}
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={isFraud || formLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all-300 shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Add Ticket</span>
              )}
            </button>
          </form>
        </div>

        {/* My Tickets List (2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-indigo-500" />
              <span>My Listed Tickets</span>
            </h2>

            {loadingTickets ? (
              <div className="h-40 bg-gray-250 animate-pulse rounded-2xl" />
            ) : tickets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-8 text-center text-gray-500 text-xs font-medium">
                No tickets listed by your company yet.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 font-bold uppercase text-gray-500 tracking-wider">
                        <th className="p-4">Route Title</th>
                        <th className="p-4">Transport</th>
                        <th className="p-4">Seat price</th>
                        <th className="p-4">Quantity</th>
                        <th className="p-4">Approval Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                      {tickets.map((t) => (
                        <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.title}</span>
                            <span className="text-[10px] text-gray-400 block">{t.from} ➔ {t.to}</span>
                          </td>
                          <td className="p-4 capitalize">{t.transportType}</td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-100">${t.price}</td>
                          <td className="p-4">{t.ticketQuantity} remaining</td>
                          <td className="p-4">{getStatusBadge(t.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Requested Bookings */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>Requested Customer Bookings</span>
            </h2>

            {loadingBookings ? (
              <div className="h-40 bg-gray-250 animate-pulse rounded-2xl" />
            ) : bookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-8 text-center text-gray-500 text-xs font-medium">
                No booking requests received from travelers.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 font-bold uppercase text-gray-500 tracking-wider">
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Ticket</th>
                        <th className="p-4">Bill Details</th>
                        <th className="p-4">Status / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                      {bookings.map((b) => (
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
                            {b.status === "requested" ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleBookingAction(b._id, "accepted")}
                                  disabled={actionLoading === b._id}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleBookingAction(b._id, "rejected")}
                                  disabled={actionLoading === b._id}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center space-x-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <div className="capitalize text-slate-650 dark:text-slate-400">
                                {b.status === "paid" ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-lg">Paid</span>
                                ) : b.status === "accepted" ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded-lg">Accepted</span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded-lg font-bold">Rejected</span>
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
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
export const dynamic = "force-dynamic";
