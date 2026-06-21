"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CountUp from "@/components/CountUp";
import { 
  Search, ShieldCheck, Ticket, Users, Clock, Headset, 
  MapPin, Calendar, Plane, Bus, Train, ArrowRight, Star, 
  Award, ShieldAlert, Sparkles, BookOpen, Navigation, CheckCircle2,
  TrendingUp, Award as BadgeIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const lightImages = [
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1920", // Luxury Bus Coach
  "https://images.unsplash.com/photo-1532103054090-334e6e60ab29?auto=format&fit=crop&q=80&w=1920", // Scenic Train
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1920"  // Flight / Airplane
];

const darkImages = [
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1920", // Night Highway / Traffic Trails
  "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=1920", // Night Train / Rail
  "https://images.unsplash.com/photo-1483450388369-9ed95738483c?auto=format&fit=crop&q=80&w=1920"  // Night Flight / Cabin View
];

export default function HomePage() {
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [latestTickets, setLatestTickets] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  // Live monitor simulation stats
  const [liveDepartureCount, setLiveDepartureCount] = useState(148);
  const [liveBookingCount, setLiveBookingCount] = useState(3842);

  // Search form state
  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    transportType: "",
    date: "",
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // Watch for theme class changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Slideshow interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch advertisements and latest tickets
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const adsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advertisements`);
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAds(adsData);
        }
      } catch (e) {
        console.error("Ads fetch error:", e);
      } finally {
        setLoadingAds(false);
      }

      try {
        const latestRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets?limit=8`);
        if (latestRes.ok) {
          const latestData = await latestRes.json();
          setLatestTickets(latestData.tickets || []);
        }
      } catch (e) {
        console.error("Latest tickets fetch error:", e);
      } finally {
        setLoadingLatest(false);
      }
    };
    fetchHomeData();

    // Live monitor simulation ticks
    const interval = setInterval(() => {
      setLiveDepartureCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setLiveBookingCount(prev => prev + (Math.random() > 0.4 ? 1 : 0));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchForm.from) query.set("from", searchForm.from);
    if (searchForm.to) query.set("to", searchForm.to);
    if (searchForm.transportType) query.set("transportType", searchForm.transportType);
    if (searchForm.date) query.set("date", searchForm.date);
    router.push(`/tickets?${query.toString()}`);
  };

  const getTransportIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "air":
        return <Plane className="w-5 h-5 text-[var(--primary)]" />;
      case "train":
        return <Train className="w-5 h-5 text-[var(--primary)]" />;
      default:
        return <Bus className="w-5 h-5 text-[var(--primary)]" />;
    }
  };

  return (
    <div className="space-y-24 pb-24 bg-[var(--background)]">
      
      {/* 1. CREATIVE HERO SECTION WITH ACCENT GLOWS & CUSTOM SLIDESHOW */}
      <section className="relative min-h-[720px] lg:h-[720px] w-full flex items-center justify-center py-12 lg:py-0">
        {/* Background Swiper Slideshow */}
        <div className="absolute inset-0 z-0">
          {(isDarkMode ? darkImages : lightImages).map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === slideIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
        
        {/* Cinematic Radial Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-1000 z-10 ${
          isDarkMode 
            ? "from-slate-950/70 via-slate-950/50 to-slate-950/80" 
            : "from-slate-950/40 via-slate-950/25 to-slate-950/50"
        }`} />

        {/* Floating Particle Glow Layers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-40">
          <div className="absolute -top-1/4 -left-1/4 w-[40vw] h-[40vw] rounded-full bg-[var(--primary)] blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-[45vw] h-[45vw] rounded-full bg-[var(--secondary)] blur-[150px] animate-pulse"></div>
        </div>

        {/* Content Box */}
        <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center items-center text-center px-4 z-20 space-y-8 max-w-6xl mx-auto py-8 lg:py-0">
          <div className="space-y-4">
            <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-full inline-flex items-center space-x-1.5 backdrop-blur-md animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Booking System</span>
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none">
              Explore Scenic Routes <br />
              With <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent drop-shadow-sm">TicketBari</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-350 max-w-2xl mx-auto font-medium leading-relaxed">
              Ditch the queues. Instant ticket reservations across premium bus lines, high-speed rail systems, launch commutes, and regional flights.
            </p>
          </div>

          {/* Floating Search Hub Box */}
          <div className="w-full max-w-5xl px-2 sm:px-4">
            <div className="glass p-6 sm:p-8 rounded-[32px] shadow-2xl border border-white/10 space-y-6">
              
              {/* Creative Mode Tabs for Transport */}
              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4" style={{ flexWrap: "wrap" }}>
                {[
                  { value: "", label: "All Vehicles", icon: Ticket },
                  { value: "bus", label: "Bus Coach", icon: Bus },
                  { value: "train", label: "Rail System", icon: Train },
                  { value: "air", label: "Flight Route", icon: Plane },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSearchForm({ ...searchForm, transportType: tab.value })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 ${
                      searchForm.transportType === tab.value
                        ? "bg-[var(--primary)] text-white shadow-lg shadow-emerald-500/20"
                        : "bg-[var(--input)]/40 text-foreground/70 hover:text-foreground hover:bg-[var(--input)]"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/80 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[var(--primary)]" />
                    <span>Leaving From</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Dhaka"
                    value={searchForm.from}
                    onChange={(e) => setSearchForm({ ...searchForm, from: e.target.value })}
                    className="bg-[var(--input)] border-[var(--border)] text-foreground placeholder:text-foreground/40 focus-visible:ring-[var(--primary)] h-11"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/80 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[var(--primary)]" />
                    <span>Going To</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Cox's Bazar"
                    value={searchForm.to}
                    onChange={(e) => setSearchForm({ ...searchForm, to: e.target.value })}
                    className="bg-[var(--input)] border-[var(--border)] text-foreground placeholder:text-foreground/40 focus-visible:ring-[var(--primary)] h-11"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/80 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[var(--primary)]" />
                    <span>Travel Date</span>
                  </label>
                  <DatePicker
                    value={searchForm.date}
                    onChange={(dateStr) => setSearchForm({ ...searchForm, date: dateStr })}
                    placeholder="Pick a date"
                    className="bg-[var(--input)] border-[var(--border)] text-foreground focus-visible:ring-[var(--primary)] h-11"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Tickets</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CREATIVE LIVE MONITOR WIDGET & GLOBAL TRUST COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/5 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-[32px] p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center shadow-sm">
          
          {/* Animated departures monitor panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-2 text-[var(--primary)]">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-widest">Live Platform Monitor</span>
            </div>
            <h3 className="text-2xl font-black text-foreground leading-tight">
              Active Commutes Departing Daily
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our automated network balances seat inventories and filters out fraud listings automatically.
            </p>
            <div className="flex items-center space-x-6 pt-2">
              <div>
                <span className="text-2xl font-black text-foreground block">
                  {liveDepartureCount}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Departures Today</span>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-855 h-8"></div>
              <div>
                <span className="text-2xl font-black text-foreground block">
                  {liveBookingCount}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bookings Processed</span>
              </div>
            </div>
          </div>

          {/* Core Trust Counters Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm liftup">
              <span className="text-3xl font-black text-[var(--primary)] block">
                <CountUp end={10} suffix="M+" />
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Tickets Booked</span>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm liftup">
              <span className="text-3xl font-black text-[var(--primary)] block">
                <CountUp end={500} suffix="+" />
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Operators</span>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm liftup">
              <span className="text-3xl font-black text-[var(--primary)] block">
                <CountUp end={99} suffix=".9%" />
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Departure Rate</span>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm liftup">
              <span className="text-3xl font-black text-[var(--primary)] block">
                <CountUp end={24} suffix="/7" />
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Secure Helpdesk</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PREMIUM FEATURED / SPONSORED SPECIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[var(--primary)]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Sponsored Specials</span>
            </div>
            <h2 className="text-3xl font-black text-foreground">Featured Premium Commutes</h2>
          </div>
        </div>

        {loadingAds ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-850 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-850">
            <p className="text-slate-500 text-sm">No sponsored tickets currently featured. Check explore panel!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ads.map((ticket) => (
              <div 
                key={ticket._id}
                className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 liftup group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600"}
                    alt={ticket.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-md border border-white/10">
                    ${ticket.price}
                  </div>
                  <div className="absolute bottom-4 left-4 glass px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 text-white">
                    {getTransportIcon(ticket.transportType)}
                    <span className="capitalize">{ticket.transportType}</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-base font-black truncate text-foreground group-hover:text-[var(--primary)] transition-colors">
                    {ticket.title}
                  </h3>
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                    <span className="flex items-center space-x-1">
                      <Navigation className="w-3.5 h-3.5 rotate-45" />
                      <span>{ticket.from}</span>
                    </span>
                    <span>➔</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ticket.to}</span>
                    </span>
                  </div>
                  <Link
                    href={`/tickets/${ticket._id}`}
                    className="w-full py-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] dark:text-[var(--primary)] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all border border-slate-200/50 dark:border-slate-800/80"
                  >
                    <span>See Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. TRENDING ROUTES WITH RATING CHIPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-center space-x-2 text-[var(--primary)]">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Trending Hubs</span>
          </div>
          <h2 className="text-3xl font-black text-foreground">Popular Commute Routes</h2>
          <p className="text-xs text-gray-500 leading-relaxed">Most sought-after destinations booking right now at promotional rates.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative h-72 rounded-[32px] overflow-hidden group cursor-pointer liftup border border-slate-200/40 dark:border-slate-850/40" onClick={() => router.push("/tickets?from=Dhaka&to=Cox's Bazar")}>
            <img 
              src="/coxs_bazar.png" 
              alt="Dhaka to Cox's Bazar" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center space-x-1 text-white">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="text-[10px] font-black">4.9</span>
            </div>
            <div className="absolute bottom-6 left-6 text-white space-y-2">
              <h3 className="text-lg font-black tracking-wide">Dhaka to Cox's Bazar</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--primary)] px-3.5 py-1.5 rounded-xl mt-1 inline-block shadow-md">Starting $25</span>
            </div>
          </div>

          <div className="relative h-72 rounded-[32px] overflow-hidden group cursor-pointer liftup border border-slate-200/40 dark:border-slate-850/40" onClick={() => router.push("/tickets?from=Dhaka&to=Sylhet")}>
            <img 
              src="/sylhet.png" 
              alt="Dhaka to Sylhet" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center space-x-1 text-white">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="text-[10px] font-black">4.8</span>
            </div>
            <div className="absolute bottom-6 left-6 text-white space-y-2">
              <h3 className="text-lg font-black tracking-wide">Dhaka to Sylhet</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--primary)] px-3.5 py-1.5 rounded-xl mt-1 inline-block shadow-md">Starting $18</span>
            </div>
          </div>

          <div className="relative h-72 rounded-[32px] overflow-hidden group cursor-pointer liftup border border-slate-200/40 dark:border-slate-850/40" onClick={() => router.push("/tickets?from=Dhaka&to=Chittagong")}>
            <img 
              src="/chittagong.png" 
              alt="Dhaka to Chittagong" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center space-x-1 text-white">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="text-[10px] font-black">4.7</span>
            </div>
            <div className="absolute bottom-6 left-6 text-white space-y-2">
              <h3 className="text-lg font-black tracking-wide">Dhaka to Chittagong</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--primary)] px-3.5 py-1.5 rounded-xl mt-1 inline-block shadow-md">Starting $15</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEWLY ADDED LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[var(--primary)]">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Fresh Arrivals</span>
            </div>
            <h2 className="text-3xl font-black text-foreground">Newly Listed Tickets</h2>
          </div>
          <Link href="/tickets" className="text-xs font-black uppercase tracking-wider text-[var(--primary)] hover:underline flex items-center space-x-1">
            <span>All Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingLatest ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-850 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : latestTickets.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-850">
            <p className="text-slate-500 text-sm">No ticket schedules listed at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {latestTickets.map((ticket) => (
              <div 
                key={ticket._id}
                className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)] flex flex-col justify-between hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 liftup group"
              >
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg inline-flex items-center space-x-1">
                      {getTransportIcon(ticket.transportType)}
                      <span className="capitalize">{ticket.transportType}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {ticket.ticketQuantity < 5 ? (
                        <span className="text-red-500 uppercase">Only {ticket.ticketQuantity} left</span>
                      ) : (
                        <span>{ticket.ticketQuantity} seats</span>
                      )}
                    </span>
                  </div>
                  <h3 className="font-black text-sm truncate text-foreground group-hover:text-[var(--primary)] transition-colors">
                    {ticket.title}
                  </h3>
                  <div className="text-xs text-gray-500 space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span className="font-bold text-foreground/80">{ticket.from}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To:</span>
                      <span className="font-bold text-foreground/80">{ticket.to}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-[var(--input)]/50 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="text-base font-black text-foreground">${ticket.price}</span>
                  <Link 
                    href={`/tickets/${ticket._id}`}
                    className="text-xs font-black uppercase tracking-wider text-[var(--primary)] hover:underline flex items-center space-x-1"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. GLOWING ISOMETRIC WHY CHOOSE US GRID */}
      <section className="bg-slate-900/5 dark:bg-slate-900/30 py-20 border-y border-slate-200/50 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">Our Safeguards</span>
            <h2 className="text-3xl font-black text-foreground">Guaranteed Travel Experience</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 p-6 liftup bg-[var(--card)] border border-[var(--border)] rounded-[24px] shadow-sm">
              <div className="p-3 bg-[var(--primary)]/10 rounded-2xl w-fit">
                <Ticket className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-black text-base text-foreground">Instant PDF Barcodes</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Valid secure tickets generated instantly after checkout. Print or keep digital barcodes on any screen.
              </p>
            </div>
            
            <div className="space-y-4 p-6 liftup bg-[var(--card)] border border-[var(--border)] rounded-[24px] shadow-sm">
              <div className="p-3 bg-[var(--primary)]/10 rounded-2xl w-fit">
                <ShieldCheck className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-black text-base text-foreground">Stripe Escrow Security</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Transactions handled via standard SSL encryption. Vendors receive payouts only after successful commute.
              </p>
            </div>

            <div className="space-y-4 p-6 liftup bg-[var(--card)] border border-[var(--border)] rounded-[24px] shadow-sm">
              <div className="p-3 bg-[var(--primary)]/10 rounded-2xl w-fit">
                <Award className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-black text-base text-foreground">Zero Hidden Markup</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                What you see is what you pay. Transparent flat scheduling rates directly set by transport operators.
              </p>
            </div>

            <div className="space-y-4 p-6 liftup bg-[var(--card)] border border-[var(--border)] rounded-[24px] shadow-sm">
              <div className="p-3 bg-[var(--primary)]/10 rounded-2xl w-fit">
                <ShieldAlert className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-black text-base text-foreground">Instant Online Refunds</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Cancel schedules directly from passenger portal. Payout refunds processed back to banking cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HIGH-CONTRAST TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">Passenger Voice</span>
          <h2 className="text-3xl font-black text-foreground">Highly Rated by Thousands</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[28px] p-6 space-y-4 shadow-xl shadow-slate-950/5 relative overflow-hidden flex flex-col justify-between h-64 liftup">
            <div className="space-y-4">
              <div className="flex items-center space-x-1 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                "Instant barcodes delivered right after checkout. I bypassed the standard agent lines at the bus counter completely."
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-[var(--border)]/50">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80" className="w-8 h-8 rounded-full border border-[var(--border)]/50 object-cover" />
              <div>
                <h4 className="text-xs font-black text-foreground">Tanvir Rahman</h4>
                <span className="text-[9px] text-foreground/60 font-bold block uppercase">Verified Passenger</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[28px] p-6 space-y-4 shadow-xl shadow-slate-950/5 relative overflow-hidden flex flex-col justify-between h-64 liftup">
            <div className="space-y-4">
              <div className="flex items-center space-x-1 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                "Stripe payment was extremely straightforward. No issues with multiple banking credentials. Very clean interface."
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-[var(--border)]/50">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80" className="w-8 h-8 rounded-full border border-[var(--border)]/50 object-cover" />
              <div>
                <h4 className="text-xs font-black text-foreground">Zarin Tasnim</h4>
                <span className="text-[9px] text-foreground/60 font-bold block uppercase">Frequent Traveler</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[28px] p-6 space-y-4 shadow-xl shadow-slate-950/5 relative overflow-hidden flex flex-col justify-between h-64 liftup">
            <div className="space-y-4">
              <div className="flex items-center space-x-1 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                "Refund system worked flawlessly when my plan changed. Cancelled with one tap on the panel and got credited fast."
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-[var(--border)]/50">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80" className="w-8 h-8 rounded-full border border-[var(--border)]/50 object-cover" />
              <div>
                <h4 className="text-xs font-black text-foreground">Imran Chowdhury</h4>
                <span className="text-[9px] text-foreground/60 font-bold block uppercase">Business Commuter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CREATIVE BLOG STORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-[var(--primary)]">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Travel Insights</span>
          </div>
          <h2 className="text-3xl font-black text-foreground">Travel Diaries & Guides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm flex flex-col liftup group">
            <div className="h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[var(--primary)] tracking-widest uppercase bg-[var(--primary)]/10 px-2 py-0.5 rounded-md">Tips</span>
                <h3 className="font-black text-base leading-snug text-foreground">Long-Haul Train Travel Accessories</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-3">Discover essential tech and comfort items that maximize passenger comfort on cross-country rail schedules.</p>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">June 15, 2026 • 4 min read</span>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm flex flex-col liftup group">
            <div className="h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[var(--primary)] tracking-widest uppercase bg-[var(--primary)]/10 px-2 py-0.5 rounded-md">Safety</span>
                <h3 className="font-black text-base leading-snug text-foreground">Highway Safety Protocols in Commuting</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-3">Standards implemented by top-tier coach vendors in Bangladesh to guarantee sanitized travel spaces.</p>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">June 12, 2026 • 5 min read</span>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm flex flex-col liftup group">
            <div className="h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=600" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[var(--primary)] tracking-widest uppercase bg-[var(--primary)]/10 px-2 py-0.5 rounded-md">Guides</span>
                <h3 className="font-black text-base leading-snug text-foreground">Summer Getaways: Cox's Bazar Guide</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-3">Everything you need to know about food, sightseeing, and optimal hotel reservations during off-season monsoon trips.</p>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">June 08, 2026 • 6 min read</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
