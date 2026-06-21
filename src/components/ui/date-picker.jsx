"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export function DatePicker({ value, onChange, placeholder = "Pick a date", className = "" }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  // Initialize display month based on current value or today
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (day, isCurrentMonth, e) => {
    e.preventDefault();
    e.stopPropagation();
    let selectedDate;
    if (isCurrentMonth) {
      selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    } else if (day > 15) {
      // Previous month day
      selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, day);
    } else {
      // Next month day
      selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
    }

    // Format as YYYY-MM-DD using local time
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    onChange(dateStr);
    setIsOpen(false);
  };

  // Generate calendar grid days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const grid = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    grid.push({ day: prevMonthTotalDays - i, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    grid.push({ day: i, isCurrentMonth: true });
  }

  // Next month padding days to make grid a multiple of 7 (rows of 6 weeks = 42 days)
  const remainingSlots = 42 - grid.length;
  for (let i = 1; i <= remainingSlots; i++) {
    grid.push({ day: i, isCurrentMonth: false });
  }

  // Format value to readable date
  const getDisplayDate = () => {
    if (!value) return placeholder;
    const d = new Date(value);
    if (isNaN(d.getTime())) return placeholder;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isSelected = (day, isCurrentMonth) => {
    if (!value) return false;
    const d = new Date(value);
    const checkDate = isCurrentMonth
      ? new Date(year, month, day)
      : day > 15
      ? new Date(year, month - 1, day)
      : new Date(year, month + 1, day);

    return (
      d.getDate() === checkDate.getDate() &&
      d.getMonth() === checkDate.getMonth() &&
      d.getFullYear() === checkDate.getFullYear()
    );
  };

  const isToday = (day, isCurrentMonth) => {
    const today = new Date();
    const checkDate = isCurrentMonth
      ? new Date(year, month, day)
      : day > 15
      ? new Date(year, month - 1, day)
      : new Date(year, month + 1, day);

    return (
      today.getDate() === checkDate.getDate() &&
      today.getMonth() === checkDate.getMonth() &&
      today.getFullYear() === checkDate.getFullYear()
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center text-left bg-slate-50/40 dark:bg-zinc-950/40 border border-slate-200 dark:border-slate-800 rounded-lg text-sm px-3 h-10 w-full text-foreground/80 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] cursor-pointer select-none transition-all ${className}`}
      >
        <CalendarIcon className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
        <span className={value ? "text-foreground font-medium" : "text-slate-400 dark:text-slate-500 font-normal"}>
          {getDisplayDate()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-11 left-0 z-50 p-4 w-[280px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl backdrop-blur-md select-none animate-in fade-in-50 slide-in-from-top-1 duration-150">
          {/* Header navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-black text-foreground uppercase tracking-wider">
              {monthNames[month]} {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, idx) => {
              const active = isSelected(cell.day, cell.isCurrentMonth);
              const today = isToday(cell.day, cell.isCurrentMonth);
              return (
                <button
                  key={idx}
                  onClick={(e) => handleSelectDay(cell.day, cell.isCurrentMonth, e)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-semibold transition-all rounded-full ${
                    active
                      ? "bg-foreground text-background font-black shadow-lg"
                      : today
                      ? "border border-[var(--primary)] text-[var(--primary)] font-black"
                      : cell.isCurrentMonth
                      ? "text-foreground hover:bg-slate-100 dark:hover:bg-slate-900"
                      : "text-slate-400/40 dark:text-slate-500/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
