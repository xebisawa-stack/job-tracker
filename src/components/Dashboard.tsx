"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Company, SELECTION_STEPS, Priority } from "@/types/company";
import { useTheme } from "@/components/ThemeProvider";

const STATUS_COLORS = ["#94a3b8", "#3b82f6", "#a855f7", "#10b981"];
const PRIORITY_COLORS: Record<Priority, string> = {
  A: "#ef4444",
  B: "#eab308",
  C: "#22c55e",
};

interface Props {
  companies: Company[];
}

export default function Dashboard({ companies }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "#cbd5e1" : "#475569";

  const statusData = useMemo(() => {
    return SELECTION_STEPS.map((step) => ({
      name: step,
      value: companies.filter((c) => c.status === step).length,
    }));
  }, [companies]);

  const priorityData = useMemo(() => {
    return (["A", "B", "C"] as Priority[]).map((p) => ({
      name: `志望度${p}`,
      count: companies.filter((c) => c.priority === p).length,
      fill: PRIORITY_COLORS[p],
    }));
  }, [companies]);

  const totalWithInterview = companies.filter((c) => c.interviewDate).length;

  if (companies.length === 0) return null;

  return (
    <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        進捗ダッシュボード
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        全 {companies.length} 社 ・ 面接予定あり {totalWithInterview} 社
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - ステータス別 */}
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            選考ステータス別
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => (value > 0 ? `${name} ${value}` : "")}
                labelLine={false}
                fontSize={12}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  color: textColor,
                  fontSize: "13px",
                }}
                formatter={(value) => [`${value} 社`, ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: textColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - 志望度別 */}
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            志望度別
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} barSize={40}>
              <XAxis
                dataKey="name"
                tick={{ fill: textColor, fontSize: 12 }}
                axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: textColor, fontSize: 12 }}
                axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  color: textColor,
                  fontSize: "13px",
                }}
                formatter={(value) => [`${value} 社`, ""]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
