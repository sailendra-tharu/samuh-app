"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NepaliDate from "nepali-date-converter";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const monthNames = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SelectedDate = {
  year: number;
  month: number;
  date: number;
};

const parseBSDate = (dateString?: string): SelectedDate | null => {
  if (!dateString) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return null;

  const [, year, month, date] = match;

  return {
    year: Number(year),
    month: Number(month) - 1,
    date: Number(date),
  };
};

interface BSDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function BSDatePicker({
  value,
  onChange,
  placeholder = "Select a date",
  disabled = false,
  error,
  className,
}: BSDatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const todayBS = useMemo(() => NepaliDate.now(), []);

  const todayADStart = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  const valueAsDate = useMemo(() => parseBSDate(value), [value]);

  const [viewYear, setViewYear] = useState(
    valueAsDate?.year ?? todayBS.getYear()
  );
  const [viewMonth, setViewMonth] = useState(
    valueAsDate?.month ?? todayBS.getMonth()
  );

  const [selected, setSelected] = useState<SelectedDate | null>(valueAsDate);

  const [open, setOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!valueAsDate) {
      // This state mirrors the controlled value so the calendar clears when the form resets.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(null);
      return;
    }

    setSelected(valueAsDate);
    setViewYear(valueAsDate.year);
    setViewMonth(valueAsDate.month);
  }, [valueAsDate]);

  /*
   * Library supports BS 2000 - 2090.
   * We only allow dates up to the current BS year.
   */
  const MIN_YEAR = 2000;
  const MAX_YEAR = todayBS.getYear();

  const years = useMemo(() => {
    const result: number[] = [];

    for (let year = MAX_YEAR; year >= MIN_YEAR; year--) {
      result.push(year);
    }

    return result;
  }, [MAX_YEAR]);

  /*
   * Calculate number of days in a BS month.
   */
  const daysInMonth = (year: number, month: number) => {
    const start = new NepaliDate(year, month, 1);

    const next = new NepaliDate(year, month, 1);
    next.setMonth(month + 1);

    return Math.round(
      (next.toJsDate().getTime() - start.toJsDate().getTime()) /
        86400000
    );
  };

  /*
   * Close calendar when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        !calendarRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
        setYearOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateCalendarPosition = () => {
    const input = inputRef.current;

    if (!input) return;

    const rect = input.getBoundingClientRect();
    const popupWidth = 320;
    const popupHeight = calendarRef.current?.getBoundingClientRect().height ?? 300;
    const gap = 4;
    const viewportPadding = 8;
    const modalHeader = input.closest("[data-modal-header]");
    const headerBottom = modalHeader
      ? modalHeader.getBoundingClientRect().bottom + gap
      : viewportPadding;
    const top = Math.max(headerBottom, rect.top - popupHeight - gap);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - popupWidth - viewportPadding
    );

    setCalendarPosition({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    updateCalendarPosition();

    const handleViewportChange = () => updateCalendarPosition();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  const toggleCalendar = () => {
    if (disabled) return;

    if (!open) updateCalendarPosition();
    setOpen((previous) => !previous);
    setYearOpen(false);
  };

  /*
   * Select date.
   */
  const handleSelectDate = (date: number) => {
    const picked = new NepaliDate(viewYear, viewMonth, date);

    const formatted = picked.format("YYYY-MM-DD");

    setSelected({
      year: viewYear,
      month: viewMonth,
      date,
    });

    onChange?.(formatted);

    setOpen(false);
  };

  const handleViewChange = (year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);

    if (!selected) return;

    const date = Math.min(selected.date, daysInMonth(year, month));
    const picked = new NepaliDate(year, month, date);

    setSelected({
      year,
      month,
      date,
    });
    onChange?.(picked.format("YYYY-MM-DD"));
  };

  /*
   * Previous month.
   */
  const handlePreviousMonth = () => {
    if (viewMonth === 0) {
      if (viewYear <= MIN_YEAR) return;

      handleViewChange(viewYear - 1, 11);
    } else {
      handleViewChange(viewYear, viewMonth - 1);
    }
  };

  /*
   * Next month.
   */
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear >= MAX_YEAR) return;

      handleViewChange(viewYear + 1, 0);
    } else {
      handleViewChange(viewYear, viewMonth + 1);
    }
  };

  const handleYearChange = (year: number) => {
    setYearOpen(false);
    handleViewChange(year, viewMonth);
  };

  const handleMonthChange = (month: number) => {
    handleViewChange(viewYear, month);
  };

  /*
   * Check whether date is today/future.
   */
  const isDateDisabled = (date: number) => {
    const cell = new NepaliDate(viewYear, viewMonth, date);

    const cellAD = cell.toJsDate();

    cellAD.setHours(0, 0, 0, 0);

    return cellAD >= todayADStart;
  };

  /*
   * Display selected date.
   */
  const displayValue = useMemo(() => {
    if (!value) return "";

    try {
      const [year, month, date] = value.split("-").map(Number);

      if (!year || month === undefined || !date) return value;

      const nepaliDate = new NepaliDate(
        year,
        month - 1,
        date
      );

      return nepaliDate.format("ddd, DD MMMM YYYY");
    } catch {
      return value;
    }
  }, [value]);

  /*
   * Render calendar days.
   */
  const calendarDays = useMemo(() => {
    const start = new NepaliDate(viewYear, viewMonth, 1);

    const startWeekday = start.getDay();

    const totalDays = daysInMonth(viewYear, viewMonth);

    const days: Array<number | null> = [];

    // Empty cells before first day
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  }, [viewYear, viewMonth]);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative w-full", className)}
    >

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => {
            toggleCalendar();
          }}
          className={cn(
            "h-10 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm outline-none",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            error
              ? "border-red-500"
              : "border-gray-300",
            disabled &&
              "cursor-not-allowed opacity-50"
          )}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            toggleCalendar();
          }}
          className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground"
        >
          <CalendarDays size={18} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}

      {/* Calendar */}
      {open &&
        !disabled &&
        createPortal(
          <div
            ref={calendarRef}
            style={calendarPosition}
            className="fixed z-[1100] w-[320px] rounded-lg border border-gray-300 bg-white p-3 shadow-lg"
          >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePreviousMonth}
              disabled={
                viewYear === MIN_YEAR &&
                viewMonth === 0
              }
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex flex-1 gap-2">
              {/* Month */}
              <select
                value={viewMonth}
                onChange={(e) =>
                  handleMonthChange(Number(e.target.value))
                }
                className="h-8 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 text-sm"
              >
                {monthNames.map((month, index) => (
                  <option
                    key={month}
                    value={index}
                  >
                    {month}
                  </option>
                ))}
              </select>

              {/* Year */}
              <div className="relative w-[90px]">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={yearOpen}
                  onClick={() => setYearOpen((prev) => !prev)}
                  className="h-8 w-full rounded-md border border-gray-300 bg-white px-2 text-left text-sm"
                >
                  {viewYear}
                </button>

                {yearOpen && (
                  <div
                    role="listbox"
                    aria-label="Select year"
                    className="absolute left-0 top-full z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-300 bg-white p-1 shadow-md"
                  >
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        role="option"
                        aria-selected={year === viewYear}
                        onClick={() => {
                          handleYearChange(year);
                        }}
                        className={cn(
                          "w-full rounded px-2 py-1 text-left text-sm hover:bg-muted",
                          year === viewYear &&
                            "bg-primary text-primary-foreground"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={
                viewYear === MAX_YEAR &&
                viewMonth === todayBS.getMonth()
              }
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <div
                key={day}
                className="py-0.5 text-center text-xs font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Dates */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div key={`empty-${index}`} />
                );
              }

              const dateDisabled =
                isDateDisabled(day);

              const isSelected =
                selected?.year === viewYear &&
                selected?.month === viewMonth &&
                selected?.date === day;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={dateDisabled}
                  onClick={() =>
                    handleSelectDate(day)
                  }
                  className={cn(
                    "h-8 w-8 rounded-md text-sm transition-colors",
                    "hover:bg-muted",
                    dateDisabled &&
                      "cursor-not-allowed text-muted-foreground opacity-40",
                    isSelected &&
                      "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
