import { Company } from "@/types/company";

export function exportCompaniesCSV(companies: Company[]): void {
  const header = ["企業名", "業界", "志望度", "選考ステータス", "面接日程", "メモ", "登録日"];
  const rows = companies.map((c) => [
    c.name,
    c.industry,
    c.priority,
    c.status,
    c.interviewDate,
    c.memo.replace(/\n/g, " "),
    new Date(c.createdAt).toLocaleDateString("ja-JP"),
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  // BOM for Excel compatibility
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `就活管理_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
