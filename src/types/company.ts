export type Priority = "A" | "B" | "C";

export type SelectionStatus = "書類選考" | "一次面接" | "最終面接" | "内定";

export const SELECTION_STEPS: SelectionStatus[] = [
  "書類選考",
  "一次面接",
  "最終面接",
  "内定",
];

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  priority: Priority;
  interviewDate: string;
  memo: string;
  status: SelectionStatus;
  createdAt: string;
  notes: Note[];
  documents: Document[];
  todos: Todo[];
}
