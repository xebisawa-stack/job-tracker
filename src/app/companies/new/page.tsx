"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Company, Priority } from "@/types/company";
import { saveCompany } from "@/lib/storage";

export default function NewCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    industry: "",
    priority: "B" as Priority,
    interviewDate: "",
    memo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const company: Company = {
      id: crypto.randomUUID(),
      ...form,
      status: "書類選考",
      createdAt: new Date().toISOString(),
      notes: [],
      documents: [],
      todos: [],
    };
    saveCompany(company);
    router.push("/");
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputCls =
    "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-100 dark:placeholder-slate-400";

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">企業を追加</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            企業名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
            placeholder="例：株式会社〇〇"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            業界 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            className={inputCls}
            placeholder="例：IT・通信"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            志望度
          </label>
          <div className="flex gap-3">
            {(["A", "B", "C"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update("priority", p)}
                className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                  form.priority === p
                    ? p === "A"
                      ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300"
                      : p === "B"
                        ? "bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-300"
                        : "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300"
                    : "bg-white border-slate-300 text-slate-400 hover:border-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            面接日程
          </label>
          <input
            type="date"
            value={form.interviewDate}
            onChange={(e) => update("interviewDate", e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            メモ
          </label>
          <textarea
            value={form.memo}
            onChange={(e) => update("memo", e.target.value)}
            rows={4}
            className={inputCls + " resize-none"}
            placeholder="志望理由や選考に関するメモなど"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            登録する
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
