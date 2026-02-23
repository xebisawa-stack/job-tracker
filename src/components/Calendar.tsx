"use client";

import { useState } from "react";
import Link from "next/link";
import { Company } from "@/types/company";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ companies }: { companies: Company[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const interviewMap = new Map<string, Company[]>();
  companies.forEach((c) => {
    if (c.interviewDate) {
      const list = interviewMap.get(c.interviewDate) || [];
      list.push(c);
      interviewMap.set(c.interviewDate, list);
    }
  });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
          ←
        </button>
        <h3 className="font-bold text-slate-800 dark:text-slate-100">
          {year}年 {month + 1}月
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium py-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"}`}>
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const events = interviewMap.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const dayOfWeek = new Date(year, month, day).getDay();

          return (
            <div
              key={day}
              className={`min-h-[3rem] sm:min-h-[4rem] p-1 rounded-lg text-sm border ${
                isToday
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600"
                  : "border-transparent"
              }`}
            >
              <div className={`text-xs mb-0.5 ${
                dayOfWeek === 0 ? "text-red-400" : dayOfWeek === 6 ? "text-blue-400" : "text-slate-500 dark:text-slate-400"
              }`}>
                {day}
              </div>
              {events.map((c) => (
                <Link
                  key={c.id}
                  href={`/companies/${c.id}`}
                  className="block text-[10px] sm:text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded px-1 py-0.5 truncate mb-0.5 hover:bg-blue-200 dark:hover:bg-blue-700"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
