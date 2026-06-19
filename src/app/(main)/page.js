"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { 
  Search, ShieldCheck, Ticket, Users, Clock, Headset, 
  MapPin, Calendar, Plane, Bus, Train, ArrowRight, Star, 
  Award, ShieldAlert, Sparkles, BookOpen
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HomePage() {
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [latestTickets, setLatestTickets] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  // Search form state
  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    transportType: "",
    date: "",
  });

  // Fetch advertisements and latest tickets
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const adsRes = await fetch("http://localhost:5000/api/advertisements");
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
        const latestRes = await fetch("http://localhost:5000/api/tickets?limit=8");
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
        return <Plane className="w-5 h-5 text-indigo-500" />;
      case "train":
        return <Train className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bus className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SLIDER SECTION */}
      <section className="relative h-[650px] w-full overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="h-full w-full"
        >
          <SwiperSlide className="relative h-full w-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1600')` }}
            />
            <div className="absolute inset-0 bg-slate-950/50" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
                Explore the Scenic Routes with <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">TicketBari</span>
              </h1>
              <p className="mt-4 text-lg text-gray-200 max-w-2xl font-medium">
                Seamless reservations for your next flight, train, or intercity bus ride.
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="relative h-full w-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1600')` }}
            />
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
                Fly Above the Clouds Effortlessly
              </h1>
              <p className="mt-4 text-lg text-gray-200 max-w-2xl font-medium">
                Discover early-bird airline deals with zero processing markups.
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="relative h-full w-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=1600')` }}
            />
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
                Unmatched Train & Coach Journeys
              </h1>
              <p className="mt-4 text-lg text-gray-200 max-w-2xl font-medium">
                Book premium seats and compartments instantly on top-tier rail lines.
              </p>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Floating Quick Search Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-5xl px-4">
          <form 
            onSubmit={handleSearch}
            className="glass p-6 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end border border-white/20"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Leaving From</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dhaka"
                value={searchForm.from}
                onChange={(e) => setSearchForm({ ...searchForm, from: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-gray-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Going To</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cox's Bazar"
                value={searchForm.to}
                onChange={(e) => setSearchForm({ ...searchForm, to: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-gray-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center space-x-1">
                <Plane className="w-3.5 h-3.5" />
                <span>Transport</span>
              </label>
              <select
                value={searchForm.transportType}
                onChange={(e) => setSearchForm({ ...searchForm, transportType: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-gray-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Transports</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="air">Flight</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={searchForm.date}
                onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-gray-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-indigo-600/30"
            >
              <Search className="w-4 h-4" />
              <span>Search Tickets</span>
            </button>
          </form>
        </div>
      </section>

      {/* 2. MINI TRUST BADGES / STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200/60 dark:border-slate-800/60 shadow-xl shadow-gray-100/50 dark:shadow-none grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-slate-800">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">10M+</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Tickets Sold</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">500+</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Active Vendors</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">99.9%</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">On-time Departure</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">24/7</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Premium Support</span>
          </div>
        </div>
      </section>

      {/* 3. ADMIN ADVERTISEMENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Sponsored Specials</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Premium Featured Tickets</h2>
          </div>
        </div>

        {loadingAds ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
            <p className="text-gray-500">No premium tickets featured currently. Check explore page!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ads.map((ticket) => (
              <div 
                key={ticket._id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-850 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 w-full">
                  <img
                    src={ticket.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600"}
                    alt={ticket.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ${ticket.price}
                  </div>
                  <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                    {getTransportIcon(ticket.transportType)}
                    <span className="capitalize">{ticket.transportType}</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <h3 className="text-lg font-bold truncate">{ticket.title}</h3>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>From: <strong className="text-slate-800 dark:text-slate-200">{ticket.from}</strong></span>
                    <span>To: <strong className="text-slate-800 dark:text-slate-200">{ticket.to}</strong></span>
                  </div>
                  <Link
                    href={`/tickets/${ticket._id}`}
                    className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all-300 border border-gray-200/50 dark:border-slate-700/50"
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

      {/* 4. POPULAR ROUTES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Trending Commute Routes</h2>
          <p className="text-gray-500">Most sought-after destinations booking right now at promotional prices.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => router.push("/tickets?from=Dhaka&to=Cox's Bazar")}>
            <img 
              src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=600" 
              alt="Dhaka to Cox's Bazar" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold">Dhaka to Cox's Bazar</h3>
              <span className="text-xs bg-cyan-500 px-2 py-0.5 rounded font-bold mt-1 inline-block">Starting from $25</span>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => router.push("/tickets?from=Dhaka&to=Sylhet")}>
            <img 
              src="https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&q=80&w=600" 
              alt="Dhaka to Sylhet" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold">Dhaka to Sylhet</h3>
              <span className="text-xs bg-cyan-500 px-2 py-0.5 rounded font-bold mt-1 inline-block">Starting from $18</span>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => router.push("/tickets?from=Dhaka&to=Chittagong")}>
            <img 
              src="https://images.unsplash.com/photo-1563906267088-b029e7101114?auto=format&fit=crop&q=80&w=600" 
              alt="Dhaka to Chittagong" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold">Dhaka to Chittagong</h3>
              <span className="text-xs bg-cyan-500 px-2 py-0.5 rounded font-bold mt-1 inline-block">Starting from $15</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LATEST TICKETS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Fresh Arrivals</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Newly Added Tickets</h2>
          </div>
          <Link href="/tickets" className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 flex items-center space-x-1">
            <span>View All Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingLatest ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : latestTickets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
            <p className="text-gray-500">No tickets listed at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {latestTickets.map((ticket) => (
              <div 
                key={ticket._id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-150 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-md inline-flex items-center space-x-1">
                    {getTransportIcon(ticket.transportType)}
                    <span className="capitalize">{ticket.transportType}</span>
                  </span>
                  <h3 className="font-bold text-sm truncate">{ticket.title}</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.from}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className={`font-semibold ${ticket.ticketQuantity < 5 ? "text-red-500" : "text-emerald-500"}`}>{ticket.ticketQuantity} left</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-900 flex justify-between items-center">
                  <span className="text-base font-black">${ticket.price}</span>
                  <Link 
                    href={`/tickets/${ticket._id}`}
                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center space-x-1"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. "WHY CHOOSE TICKETBARI" FEATURE GRID */}
      <section className="bg-white dark:bg-slate-900 py-16 border-y border-gray-200/50 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Our Guarantees</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Why Choose TicketBari</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 p-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl w-fit">
                <Ticket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg">Instant PDF Tickets</h3>
              <p className="text-sm text-gray-500 leading-normal">
                Receive valid barcodes instantly via email or download directly to your profile workspace.
              </p>
            </div>
            <div className="space-y-3 p-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl w-fit">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg">Secure Stripe Payments</h3>
              <p className="text-sm text-gray-500 leading-normal">
                Encrypted bank transactions processed seamlessly with global card integrations.
              </p>
            </div>
            <div className="space-y-3 p-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl w-fit">
                <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg">Zero Hidden Charges</h3>
              <p className="text-sm text-gray-500 leading-normal">
                Transparent flat pricing with absolute clarity on booking taxes and cancellations.
              </p>
            </div>
            <div className="space-y-3 p-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl w-fit">
                <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg">Easy Cancellations</h3>
              <p className="text-sm text-gray-500 leading-normal">
                Cancel tickets instantly from dashboard and claim partial/full refunds based on schedule rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS SLIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Global Reviews</span>
          <h2 className="text-3xl font-extrabold tracking-tight">Verified Travelers Voice</h2>
        </div>
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 24 }
            }}
            className="w-full"
          >
            <SwiperSlide>
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  "Booking tickets to Cox's Bazar was never this simple! Literally took under 2 minutes. The PDF ticket was waiting in my email."
                </p>
                <div className="flex items-center space-x-3 border-t border-gray-100 dark:border-slate-800 pt-4">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-xs font-bold">Tanvir Rahman</h4>
                    <span className="text-[10px] text-gray-500">Verified Bus Commuter</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  "Highly secure gateway checkout. The Stripe payment flow was robust. Glad to bypass agent lines completely!"
                </p>
                <div className="flex items-center space-x-3 border-t border-gray-100 dark:border-slate-800 pt-4">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-xs font-bold">Zarin Tasnim</h4>
                    <span className="text-[10px] text-gray-500">Frequent Rail Flyer</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  "Stellar platform support when I had to modify my train tickets schedule. Zero charges on standard adjustments."
                </p>
                <div className="flex items-center space-x-3 border-t border-gray-100 dark:border-slate-800 pt-4">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80" className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-xs font-bold">Imran Chowdhury</h4>
                    <span className="text-[10px] text-gray-500">Corporate Travel Specialist</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* 8. RECENT TRAVEL BLOG / NEWS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Travel Insights</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Recent Travel Stories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col">
            <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600" className="h-44 w-full object-cover" />
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-500 tracking-wider uppercase">Commute Tips</span>
                <h3 className="font-bold text-base line-clamp-2">Top 5 Accessories for Long-Haul Train Travel</h3>
                <p className="text-xs text-gray-500 line-clamp-3">Discover essential accessories that maximize comfort on cross-country rail schedules, from neck wraps to wireless noise reduction gear.</p>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">June 15, 2026 • 4 min read</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col">
            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600" className="h-44 w-full object-cover" />
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-500 tracking-wider uppercase">Safety</span>
                <h3 className="font-bold text-base line-clamp-2">Post-pandemic Highway Safety Protocols</h3>
                <p className="text-xs text-gray-500 line-clamp-3">A list of standards implemented by top-tier coach vendors in Bangladesh to guarantee sanitized travel spaces for short commutes.</p>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">June 12, 2026 • 5 min read</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col">
            <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=600" className="h-44 w-full object-cover" />
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-500 tracking-wider uppercase">Hotels & Guides</span>
                <h3 className="font-bold text-base line-clamp-2">Summer Getaways: Cox's Bazar Travel Guide</h3>
                <p className="text-xs text-gray-500 line-clamp-3">Everything you need to know about weather, local food joints, and optimal hotel reservations during off-season monsoon trips.</p>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">June 08, 2026 • 6 min read</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
