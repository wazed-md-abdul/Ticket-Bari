"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, Plane, Bus, Train, ArrowUpDown, ArrowRight, 
  MapPin, SlidersHorizontal 
} from "lucide-react";
import { Input } from "@/components/ui/input";


function TicketsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query state derived from searchParams
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [transportType, setTransportType] = useState(searchParams.get("transportType") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Result state
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Trigger search URL update
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (transportType) params.set("transportType", transportType);
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    router.push(`/tickets?${params.toString()}`);
  };

  // Run fetch whenever query/searchParams change
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set("limit", "8"); // 8 tickets per page
        
        const res = await fetch(`http://localhost:5000/api/tickets?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
        }
      } catch (e) {
        console.error("Tickets load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [searchParams]);

  // Sync state with URL params
  useEffect(() => {
    setFrom(searchParams.get("from") || "");
    setTo(searchParams.get("to") || "");
    setTransportType(searchParams.get("transportType") || "");
    setSort(searchParams.get("sort") || "");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset page to 1
    applyFilters();
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/tickets?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (val) params.set("sort", val);
    else params.delete("sort");
    params.set("page", "1"); // Reset page
    router.push(`/tickets?${params.toString()}`);
  };

  const handleTypeChange = (type) => {
    const params = new URLSearchParams(searchParams);
    if (type) params.set("transportType", type);
    else params.delete("transportType");
    params.set("page", "1"); // Reset page
    router.push(`/tickets?${params.toString()}`);
  };

  const getTransportIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "air":
        return <Plane className="w-4 h-4 text-indigo-500" />;
      case "train":
        return <Train className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bus className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Available Commutes</h1>
        <p className="text-sm text-gray-500">Search and sort tickets from verified providers</p>
      </div>

      {/* Filter Options Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Box */}
        <div className="space-y-6 lg:col-span-1">
          <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-505 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Search Filters</span>
            </h2>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Leaving From</label>
              <Input 
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="e.g. Dhaka"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Going To</label>
              <Input 
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="e.g. Cox's Bazar"
                className="h-9 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all-300"
            >
              Apply Searches
            </button>
          </form>

          {/* Quick Filters */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-bold text-xs uppercase tracking-wider text-gray-505">Transport Type</h2>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => handleTypeChange("")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between ${
                  !transportType ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span>All Vehicles</span>
              </button>
              <button 
                onClick={() => handleTypeChange("bus")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between ${
                  transportType === "bus" ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Bus className="w-3.5 h-3.5" />
                  <span>Coach / Bus</span>
                </span>
              </button>
              <button 
                onClick={() => handleTypeChange("train")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between ${
                  transportType === "train" ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Train className="w-3.5 h-3.5" />
                  <span>Train</span>
                </span>
              </button>
              <button 
                onClick={() => handleTypeChange("air")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between ${
                  transportType === "air" ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Flight</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Ticket List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting and Count */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-6 py-4 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="text-xs text-gray-500 font-semibold">{total} tickets found</span>
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={handleSortChange}
                className="bg-transparent text-xs font-semibold focus:outline-none"
              >
                <option value="">Sort by (Date)</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Skeletons or Tickets */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-60 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-3xl">🎫</span>
              <p className="text-gray-500 text-sm mt-3 font-medium">No active tickets found matching parameters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket._id}
                    className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-md inline-flex items-center space-x-1.5">
                          {getTransportIcon(ticket.transportType)}
                          <span className="capitalize">{ticket.transportType}</span>
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          Qty: <strong className={ticket.ticketQuantity < 5 ? "text-red-500" : "text-emerald-500"}>{ticket.ticketQuantity}</strong> left
                        </span>
                      </div>

                      <h3 className="font-extrabold text-lg truncate text-slate-800 dark:text-slate-100">{ticket.title}</h3>

                      <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50/50 dark:bg-slate-950/50 p-3 rounded-xl border border-gray-100/50 dark:border-slate-800/50">
                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">From</span>
                          <span className="font-bold flex items-center text-slate-700 dark:text-slate-200">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                            {ticket.from}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">To</span>
                          <span className="font-bold flex items-center text-slate-700 dark:text-slate-200">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                            {ticket.to}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-gray-400">Departure time:</span>
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {new Date(ticket.departureDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-950/30 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center">
                      <span className="text-xl font-black">${ticket.price}</span>
                      <Link 
                        href={`/tickets/${ticket._id}`}
                        className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-all shadow-sm"
                      >
                        <span>See Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {pages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {page} of {pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= pages}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors bg-white dark:bg-slate-900"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <TicketsContent />
    </Suspense>
  );
}
export const dynamic = "force-dynamic";
