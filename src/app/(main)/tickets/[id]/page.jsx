"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { 
  Plane, Bus, Train, Calendar, Clock, MapPin, 
  DollarSign, ShieldAlert, Sparkles, AlertCircle, ShoppingBag 
} from "lucide-react";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingQty, setBookingQty] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load ticket details.");
        }
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  // Countdown timer logic
  useEffect(() => {
    if (!ticket?.departureDateTime) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(ticket.departureDateTime) - +new Date();
      if (difference <= 0) return null;

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setError("");
    setBookingLoading(true);

    try {
      let token = "";
      try {
        const tokenRes = await authClient.token();
        token = tokenRes?.data?.token || "";
      } catch (e) {
        console.error("Error retrieving JWT token:", e);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass authorization credentials
          ...((token && typeof window !== "undefined") ? {
            "Authorization": `Bearer ${token}`
          } : {})
        },
        body: JSON.stringify({
          ticketId: ticket._id,
          bookedQuantity: bookingQty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book ticket.");
      }

      setBookingSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/user");
      }, 1500);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setBookingLoading(false);
    }
  };

  const getTransportIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "air":
        return <Plane className="w-6 h-6 text-indigo-500" />;
      case "train":
        return <Train className="w-6 h-6 text-indigo-500" />;
      default:
        return <Bus className="w-6 h-6 text-indigo-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-150 flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const isExpired = new Date(ticket?.departureDateTime) < new Date();
  const isSoldOut = ticket?.ticketQuantity <= 0;
  const isBookingDisabled = isExpired || isSoldOut || ticket?.isVendorFraud;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <span className="text-xs font-extrabold uppercase px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg inline-flex items-center space-x-1.5">
                {getTransportIcon(ticket.transportType)}
                <span className="capitalize">{ticket.transportType} Travel</span>
              </span>
              
              {/* Status Alert badges */}
              {ticket.isVendorFraud && (
                <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 rounded-lg">Blocked (Fraud Vendor)</span>
              )}
              {isExpired && (
                <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">Schedule Expired</span>
              )}
              {isSoldOut && !isExpired && (
                <span className="text-xs font-bold px-3 py-1 bg-yellow-100 text-yellow-750 rounded-lg">Sold Out</span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">{ticket.title}</h1>

            <img
              src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}
              alt={ticket.title}
              className="w-full h-80 object-cover rounded-2xl border border-gray-100 dark:border-slate-800"
            />

            {/* Travel route detail boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100/50 dark:border-slate-800/50">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Departure Station</span>
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span className="font-extrabold text-sm">{ticket.from}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Destination Station</span>
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                  <MapPin className="w-5 h-5 text-cyan-500" />
                  <span className="font-extrabold text-sm">{ticket.to}</span>
                </div>
              </div>
            </div>

            {/* Timings */}
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800 pt-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Departure Date & Time:</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {new Date(ticket.departureDateTime).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Booking Card & Countdown */}
        <div className="space-y-6">
          
          {/* Countdown Clock (only if not expired) */}
          {!isExpired && timeLeft && (
            <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-xs opacity-90">
                <Clock className="w-4 h-4" />
                <span>Time Remaining to Board</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="block text-2xl font-black">{timeLeft.days}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Days</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="block text-2xl font-black">{timeLeft.hours}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Hours</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="block text-2xl font-black">{timeLeft.minutes}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Mins</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="block text-2xl font-black">{timeLeft.seconds}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Secs</span>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Booking Actions Box */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price per seat</span>
              <div className="flex items-baseline text-slate-850 dark:text-slate-100">
                <span className="text-3xl font-black">${ticket.price}</span>
                <span className="text-xs text-gray-500 ml-1">USD</span>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800" />

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Number of tickets</label>
                <input
                  type="number"
                  min="1"
                  max={ticket.ticketQuantity}
                  value={bookingQty}
                  onChange={(e) => setBookingQty(Math.min(ticket.ticketQuantity, Math.max(1, Number(e.target.value))))}
                  disabled={isBookingDisabled}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-medium">Subtotal</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">${ticket.price * bookingQty} USD</span>
              </div>

              {bookingSuccess ? (
                <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 p-3 rounded-xl text-xs font-semibold text-center border border-emerald-150">
                  🎉 Booking requested successfully! Redirecting...
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isBookingDisabled || bookingLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{session ? "Request Booking" : "Sign In to Book"}</span>
                </button>
              )}
            </form>

            {error && (
              <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold border border-red-150">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
