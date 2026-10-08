import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Timezone-safe date parser that avoids UTC offset date shifts
export function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Match YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      return new Date(year, month, day);
    }
    // Match "15 Oct 2026" or "15 October 2026" or "15-Oct-2026"
    const wordsMatch = trimmed.match(/^(\d{1,2})[- \s]+([A-Za-z]+)[- \s]+(\d{4})/);
    if (wordsMatch) {
      const day = parseInt(wordsMatch[1], 10);
      const monthPrefix = wordsMatch[2].slice(0, 3).toLowerCase();
      const monthIndex = MONTH_SHORT.findIndex((m) => m.toLowerCase() === monthPrefix);
      const year = parseInt(wordsMatch[3], 10);
      if (monthIndex !== -1) {
        return new Date(year, monthIndex, day);
      }
    }
    // Fallback general parse
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  }
  return null;
}

// Local timezone YYYY-MM-DD formatter (avoids UTC day shifts)
export function toISODateString(val) {
  const d = parseDate(val);
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format date consistently: "15 Oct 2026"
export function formatDate(date) {
  const d = parseDate(date);
  if (!d) return '';
  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const DatePicker = React.forwardRef(function DatePicker({
  mode = 'range', // 'range' | 'single'
  value = null, // for range: { start, end } or strings; for single: date/string
  onChange,
  label = 'When?',
  placeholder = 'Select dates',
  minDate = new Date(), // default cannot pick past dates
  theme = 'dark', // 'dark' | 'light'
  className = '',
  required = false,
  error = '',
  disabled = false,
  icon = null,
}, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial dates
  const initialStart = mode === 'range' ? parseDate(value?.start) : parseDate(value);
  const initialEnd = mode === 'range' ? parseDate(value?.end) : null;

  const [selectedStart, setSelectedStart] = useState(initialStart);
  const [selectedEnd, setSelectedEnd] = useState(initialEnd);
  const [hoverDate, setHoverDate] = useState(null);

  // Month navigation state
  const today = new Date();
  const [viewYear, setViewYear] = useState((initialStart || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((initialStart || today).getMonth());

  // Sync external changes
  useEffect(() => {
    if (mode === 'range') {
      const s = parseDate(value?.start);
      const e = parseDate(value?.end);
      setSelectedStart(s);
      setSelectedEnd(e);
      if (s) {
        setViewYear(s.getFullYear());
        setViewMonth(s.getMonth());
      }
    } else {
      const d = parseDate(value);
      setSelectedStart(d);
      if (d) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value, mode]);

  // Expose imperative API for parent container trigger
  useImperativeHandle(ref, () => ({
    open: () => {
      if (!disabled) setIsOpen(true);
    },
    close: () => setIsOpen(false),
    toggle: () => {
      if (!disabled) setIsOpen((prev) => !prev);
    },
    isOpen,
  }));

  // Click outside or press Escape to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const prevMonth = () => {
    const isCurrentMonthOrEarlier =
      viewYear === today.getFullYear() && viewMonth <= today.getMonth();
    if (minDate && isCurrentMonthOrEarlier) return;

    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  // Generate calendar days for viewMonth and viewYear
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handleDateClick = (day) => {
    const clicked = new Date(viewYear, viewMonth, day);
    clicked.setHours(0, 0, 0, 0);

    if (minDate) {
      const minD = new Date(minDate);
      minD.setHours(0, 0, 0, 0);
      if (clicked < minD) return;
    }

    if (mode === 'single') {
      setSelectedStart(clicked);
      setIsOpen(false);
      if (onChange) {
        onChange(formatDate(clicked), clicked, toISODateString(clicked));
      }
      return;
    }

    // Range mode
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(clicked);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      if (clicked < selectedStart) {
        // Clicked date is earlier than start date, make it the new start
        setSelectedStart(clicked);
      } else {
        // Set end date
        setSelectedEnd(clicked);
        setIsOpen(false);
        if (onChange) {
          onChange({
            start: formatDate(selectedStart),
            end: formatDate(clicked),
            startDate: selectedStart,
            endDate: clicked,
            startDateStr: toISODateString(selectedStart),
            endDateStr: toISODateString(clicked),
          });
        }
      }
    }
  };

  const handleApplyPreset = (daysFromNow, durationDays = 5) => {
    const start = new Date();
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(0, 0, 0, 0);

    if (mode === 'single') {
      setSelectedStart(start);
      setIsOpen(false);
      if (onChange) onChange(formatDate(start), start, toISODateString(start));
      return;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);

    setSelectedStart(start);
    setSelectedEnd(end);
    setIsOpen(false);

    if (onChange) {
      onChange({
        start: formatDate(start),
        end: formatDate(end),
        startDate: start,
        endDate: end,
        startDateStr: toISODateString(start),
        endDateStr: toISODateString(end),
      });
    }
  };

  // Display value text
  let displayValue = '';
  if (mode === 'range') {
    if (selectedStart && selectedEnd) {
      displayValue = `${formatDate(selectedStart)} – ${formatDate(selectedEnd)}`;
    } else if (selectedStart) {
      displayValue = `${formatDate(selectedStart)} – Select Return`;
    } else if (value?.start && value?.end) {
      displayValue = `${value.start} – ${value.end}`;
    } else if (typeof value === 'string') {
      displayValue = value;
    }
  } else {
    if (selectedStart) {
      displayValue = formatDate(selectedStart);
    } else if (typeof value === 'string') {
      displayValue = value;
    }
  }

  const isDark = theme === 'dark';

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Clickable Input Trigger - entire area opens picker */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        data-testid="datepicker-trigger"
        className="cursor-pointer w-full h-full text-left focus:outline-none flex items-center justify-between gap-2"
        role="button"
        tabIndex={0}
      >
        <div className="flex-1 min-w-0">
          {label && (
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {label}
            </span>
          )}
          <span
            className={`text-xs sm:text-sm font-bold block truncate mt-0.5 ${
              displayValue
                ? isDark ? 'text-white' : 'text-[#071A2B]'
                : isDark ? 'text-slate-400 font-normal' : 'text-slate-400 font-normal'
            }`}
          >
            {displayValue || placeholder}
          </span>
        </div>

        {displayValue && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStart(null);
              setSelectedEnd(null);
              if (onChange) {
                if (mode === 'range') onChange({ start: '', end: '', startDate: null, endDate: null });
                else onChange('', null);
              }
            }}
            className={`p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown Modal */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden backdrop-blur-xs"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          <div
            data-testid="datepicker-dropdown"
            className={`fixed inset-x-3 top-20 max-w-[340px] mx-auto sm:inset-auto sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 sm:w-88 rounded-3xl shadow-2xl border p-3.5 sm:p-5 z-50 animate-fade-in ${
              isDark
                ? 'bg-[#071A2B] border-white/15 text-white shadow-black/60'
                : 'bg-white border-slate-200 text-[#071A2B] shadow-slate-300/60'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header Month / Year Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="font-extrabold text-sm block">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {mode === 'range' ? 'Select start & return dates' : 'Select travel date'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-bold text-slate-400">
            {DAY_NAMES.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Blank leading days from prev month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="h-8 flex items-center justify-center text-[10px] text-slate-600 opacity-25 select-none"
              >
                {daysInPrevMonth - firstDayIndex + idx + 1}
              </div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateObj = new Date(viewYear, viewMonth, day);
              dateObj.setHours(0, 0, 0, 0);

              const isPast = minDate && dateObj < new Date(new Date().setHours(0, 0, 0, 0));
              const isToday =
                dateObj.getDate() === today.getDate() &&
                dateObj.getMonth() === today.getMonth() &&
                dateObj.getFullYear() === today.getFullYear();

              const isStart =
                selectedStart &&
                dateObj.getTime() === new Date(selectedStart).setHours(0, 0, 0, 0);

              const isEnd =
                selectedEnd &&
                dateObj.getTime() === new Date(selectedEnd).setHours(0, 0, 0, 0);

              const inRange =
                selectedStart &&
                selectedEnd &&
                dateObj > selectedStart &&
                dateObj < selectedEnd;

              let btnClasses = isDark
                ? 'text-white hover:bg-white/10'
                : 'text-slate-800 hover:bg-orange-50 hover:text-[#FF5A1F]';

              if (isPast) {
                btnClasses = isDark
                  ? 'text-slate-600 opacity-40 cursor-not-allowed'
                  : 'text-slate-300 opacity-40 cursor-not-allowed';
              } else if (isStart || isEnd) {
                btnClasses = 'bg-[#FF5A1F] text-white font-extrabold shadow-md shadow-[#FF5A1F]/40';
              } else if (inRange) {
                btnClasses = isDark
                  ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] font-semibold'
                  : 'bg-orange-100 text-[#FF5A1F] font-semibold';
              } else if (isToday) {
                btnClasses = isDark
                  ? 'border border-[#FF5A1F] text-white font-bold'
                  : 'border border-[#FF5A1F] text-[#071A2B] font-bold';
              }

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(day)}
                  className={`h-8 w-full rounded-xl flex items-center justify-center font-medium transition-all text-xs cursor-pointer ${btnClasses}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Presets */}
          <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleApplyPreset(1, 4)}
                className={`px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/15 text-slate-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-orange-50 hover:text-[#FF5A1F] text-slate-700'
                }`}
              >
                Tomorrow (+4d)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(7, 7)}
                className={`px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/15 text-slate-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-orange-50 hover:text-[#FF5A1F] text-slate-700'
                }`}
              >
                Next Week (7d)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(14, 6)}
                className={`px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/15 text-slate-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-orange-50 hover:text-[#FF5A1F] text-slate-700'
                }`}
              >
                In 2 Weeks
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setSelectedStart(null);
                setSelectedEnd(null);
                if (onChange) {
                  if (mode === 'range') onChange({ start: '', end: '', startDate: null, endDate: null });
                  else onChange('', null);
                }
              }}
              className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedStart) {
                  if (mode === 'range') {
                    const end = selectedEnd || new Date(new Date(selectedStart).setDate(selectedStart.getDate() + 5));
                    if (onChange) {
                      onChange({
                        start: formatDate(selectedStart),
                        end: formatDate(end),
                        startDate: selectedStart,
                        endDate: end,
                        startDateStr: toISODateString(selectedStart),
                        endDateStr: toISODateString(end),
                      });
                    }
                  } else {
                    if (onChange) onChange(formatDate(selectedStart), selectedStart, toISODateString(selectedStart));
                  }
                }
                setIsOpen(false);
              }}
              className="btn-primary-cb !py-1.5 !px-4 !text-xs font-bold cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
});

export default DatePicker;
