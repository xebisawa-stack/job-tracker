import { Company } from "@/types/company";

const STORAGE_KEY = "job-tracker-companies";

function migrate(company: Partial<Company>): Company {
  return {
    ...company,
    notes: company.notes ?? [],
    documents: company.documents ?? [],
    todos: company.todos ?? [],
  } as Company;
}

export function getCompanies(): Company[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return (JSON.parse(data) as Partial<Company>[]).map(migrate);
}

export function getCompany(id: string): Company | undefined {
  return getCompanies().find((c) => c.id === id);
}

export function saveCompany(company: Company): void {
  const companies = getCompanies();
  const index = companies.findIndex((c) => c.id === company.id);
  if (index >= 0) {
    companies[index] = company;
  } else {
    companies.push(company);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

export function deleteCompany(id: string): void {
  const companies = getCompanies().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}
