"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Company, Priority } from "@/types/company";
import { getCompanies } from "@/lib/storage";
import { exportCompaniesCSV } from "@/lib/csv";
import Calendar from "@/components/Calendar";

const priorityColor: Record<Priority, string> = {
  A: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  B: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  C: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
};

const statusColor: Record<string, string> = {
  書類選考: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  一次面接: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  最終面接: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  内定: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCompanies(getCompanies());
  }, []);

  const industries = useMemo(
    () => [...new Set(companies.map((c) => c.industry))].sort(),
    [companies]
  );

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (industryFilter && c.industry !== industryFilter) return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      return true;
    });
  }, [companies, search, industryFilter, priorityFilter]);

  const reminders = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    return companies
      .filter((c) => {
        if (!c.interviewDate) return false;
        const d = new Date(c.interviewDate + "T00:00:00");
        return d >= now && d <= threeDaysLater;
      })
      .sort((a, b) => a.interviewDate.localeCompare(b.interviewDate));
  }, [companies]);

  if (!mounted) return null;

  return (
    <div>
      {/* Reminders */}
      {reminders.length > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <h2 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-2">
            ⚠ 面接が近い企業
          </h2>
          <div className="space-y-2">
            {reminders.map((c) => {
              const d = new Date(c.interviewDate + "T00:00:00");
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
              const label = diff === 0 ? "本日" : diff === 1 ? "明日" : `${diff}日後`;
              return (
                <Link
                  key={c.id}
                  href={`/companies/${c.id}`}
                  className="flex items-center justify-between hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                    {c.name}
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    {c.interviewDate}（{label}）
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">企業一覧</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} 社</p>
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {showCalendar ? "一覧表示" : "カレンダー"}
          </button>
          {companies.length > 0 && (
            <button
              onClick={() => exportCompaniesCSV(companies)}
              className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              CSV出力
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      {companies.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            placeholder="企業名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-400"
          />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          >
            <option value="">全業界</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          >
            <option value="">全志望度</option>
            <option value="A">A（高）</option>
            <option value="B">B（中）</option>
            <option value="C">C（低）</option>
          </select>
        </div>
      )}

      {/* Calendar View */}
      {showCalendar && companies.length > 0 && (
        <div className="mb-6">
          <Calendar companies={filtered} />
        </div>
      )}

      {/* Company Cards */}
      {!showCalendar && (
        <>
          {filtered.length === 0 && companies.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 dark:text-slate-500 text-lg mb-4">
                まだ企業が登録されていません
              </p>
              <Link
                href="/companies/new"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                最初の企業を追加する
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 dark:text-slate-500">条件に一致する企業がありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">
                      {company.name}
                    </h2>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded border shrink-0 ml-2 ${priorityColor[company.priority]}`}
                    >
                      {company.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{company.industry}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[company.status]}`}
                    >
                      {company.status}
                    </span>
                    {company.interviewDate && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {company.interviewDate}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
