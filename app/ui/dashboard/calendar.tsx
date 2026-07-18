"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";

import { Calendar, CalendarDayButton } from "@/components/ui/calendar";

export function WorkingDaysCalendar() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });

  return (
    <div className="w-full justify-center flex">
      <Calendar
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={setRange}
        numberOfMonths={1}
        captionLayout="dropdown"
        // Dynamic full-width spacing calculation so grids adapt naturally
        className="[--cell-size:1fr] sm:[--cell-size:--spacing(12)] w-full max-w-full"
        formatters={{
          formatMonthDropdown: (date) => {
            return date.toLocaleString("default", { month: "long" });
          },
        }}
        components={{
          DayButton: ({ children, modifiers, day, ...props }) => {
            const isWeekend =
              day.date.getDay() === 0 || day.date.getDay() === 6;

            return (
              <CalendarDayButton
                day={day}
                modifiers={modifiers}
                {...props}
                className="relative flex flex-col items-center justify-center h-14 w-full rounded-xl transition-all active:scale-95 touch-manipulation"
              >
                <span className="text-sm font-semibold tracking-tight">
                  {children}
                </span>

                {!modifiers.outside && (
                  <span
                    className={`text-[9px] font-bold mt-0.5 px-1 rounded-md tracking-wide uppercase select-none ${
                      isWeekend
                        ? "text-slate-400 bg-slate-50 font-medium"
                        : "text-[#007a64] bg-[#eaf8f5] font-extrabold"
                    }`}
                  >
                    {isWeekend ? "Off" : "Work"}
                  </span>
                )}
              </CalendarDayButton>
            );
          },
        }}
      />
    </div>
  );
}
