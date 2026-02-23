"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Company,
  Priority,
  SelectionStatus,
  SELECTION_STEPS,
  Note,
  Document,
  Todo,
} from "@/types/company";
import { getCompany, saveCompany, deleteCompany } from "@/lib/storage";

const priorityLabel: Record<Priority, string> = {
  A: "志望度A（高）",
  B: "志望度B（中）",
  C: "志望度C（低）",
};

const priorityStyle: Record<Priority, string> = {
  A: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  B: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  C: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    priority: "B" as Priority,
    interviewDate: "",
    memo: "",
  });
  const [activeTab, setActiveTab] = useState<"notes" | "docs" | "todos">("notes");

  // Note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Doc form
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");

  // Todo form
  const [todoText, setTodoText] = useState("");

  useEffect(() => {
    const id = params.id as string;
    const data = getCompany(id);
    if (data) {
      setCompany(data);
      setForm({
        name: data.name,
        industry: data.industry,
        priority: data.priority,
        interviewDate: data.interviewDate,
        memo: data.memo,
      });
    }
  }, [params.id]);

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 dark:text-slate-500 text-lg mb-4">企業が見つかりません</p>
        <Link href="/" className="text-blue-600 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const save = (updated: Company) => {
    saveCompany(updated);
    setCompany(updated);
  };

  const currentStepIndex = SELECTION_STEPS.indexOf(company.status);

  const updateStatus = (status: SelectionStatus) => save({ ...company, status });

  const handleSave = () => {
    save({ ...company, ...form });
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm("この企業を削除しますか？")) {
      deleteCompany(company.id);
      router.push("/");
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Notes
  const addNote = () => {
    if (!noteTitle.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      title: noteTitle,
      content: noteContent,
      createdAt: new Date().toISOString(),
    };
    save({ ...company, notes: [...company.notes, note] });
    setNoteTitle("");
    setNoteContent("");
  };

  const updateNote = (id: string) => {
    save({
      ...company,
      notes: company.notes.map((n) =>
        n.id === id ? { ...n, title: noteTitle, content: noteContent } : n
      ),
    });
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

  const deleteNote = (id: string) => {
    save({ ...company, notes: company.notes.filter((n) => n.id !== id) });
  };

  const startEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

  // Documents
  const addDoc = () => {
    if (!docName.trim() || !docUrl.trim()) return;
    const doc: Document = { id: crypto.randomUUID(), name: docName, url: docUrl };
    save({ ...company, documents: [...company.documents, doc] });
    setDocName("");
    setDocUrl("");
  };

  const deleteDoc = (id: string) => {
    save({ ...company, documents: company.documents.filter((d) => d.id !== id) });
  };

  // Todos
  const addTodo = () => {
    if (!todoText.trim()) return;
    const todo: Todo = { id: crypto.randomUUID(), text: todoText, completed: false };
    save({ ...company, todos: [...company.todos, todo] });
    setTodoText("");
  };

  const toggleTodo = (id: string) => {
    save({
      ...company,
      todos: company.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    });
  };

  const deleteTodo = (id: string) => {
    save({ ...company, todos: company.todos.filter((t) => t.id !== id) });
  };

  const inputCls =
    "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-400";

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
      >
        ← 企業一覧に戻る
      </Link>

      {/* Status Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">選考ステータス</h2>
        <div className="flex items-center gap-1 sm:gap-2">
          {SELECTION_STEPS.map((step, i) => {
            const isActive = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <button
                key={step}
                onClick={() => updateStatus(step)}
                className={`flex-1 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all border-2 ${
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-600"
                    : isActive
                      ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
                }`}
              >
                {step}
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        {editing ? (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">企業情報を編集</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">企業名</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">業界</label>
              <input type="text" value={form.industry} onChange={(e) => update("industry", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">志望度</label>
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
                        : "bg-white border-slate-300 text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">面接日程</label>
              <input type="date" value={form.interviewDate} onChange={(e) => update("interviewDate", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">メモ</label>
              <textarea value={form.memo} onChange={(e) => update("memo", e.target.value)} rows={4} className={inputCls + " resize-none"} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                保存する
              </button>
              <button onClick={() => setEditing(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{company.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{company.industry}</p>
              </div>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${priorityStyle[company.priority]}`}>
                {priorityLabel[company.priority]}
              </span>
            </div>
            <div className="space-y-3 mb-6">
              {company.interviewDate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 dark:text-slate-500 w-20">面接日程</span>
                  <span className="text-slate-700 dark:text-slate-200">{company.interviewDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 dark:text-slate-500 w-20">登録日</span>
                <span className="text-slate-700 dark:text-slate-200">
                  {new Date(company.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
            </div>
            {company.memo && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">メモ</h3>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{company.memo}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setEditing(true)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
                編集する
              </button>
              <button onClick={handleDelete} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm">
                削除
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tabs: Notes / Documents / Todos */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {(
            [
              { key: "notes", label: `ES・メモ (${company.notes.length})` },
              { key: "docs", label: `資料 (${company.documents.length})` },
              { key: "todos", label: `TODO (${company.todos.filter((t) => !t.completed).length}/${company.todos.length})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="タイトル（例：志望動機、ES回答）"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className={inputCls}
                />
                <textarea
                  placeholder="内容を入力..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  className={inputCls + " resize-none"}
                />
                {editingNoteId ? (
                  <div className="flex gap-2">
                    <button onClick={() => updateNote(editingNoteId)} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      更新
                    </button>
                    <button onClick={cancelEditNote} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button onClick={addNote} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    追加
                  </button>
                )}
              </div>
              {company.notes.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                  ES内容や志望動機などを追加しましょう
                </p>
              )}
              {company.notes.map((note) => (
                <div key={note.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 text-sm">{note.title}</h4>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <button onClick={() => startEditNote(note)} className="text-xs text-slate-400 hover:text-blue-500 transition-colors">
                        編集
                      </button>
                      <button onClick={() => deleteNote(note.id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                        削除
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {new Date(note.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "docs" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="資料名"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className={inputCls}
                />
                <button onClick={addDoc} className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  追加
                </button>
              </div>
              {company.documents.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                  企業の資料やリンクを追加しましょう
                </p>
              )}
              {company.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-4 py-3">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium truncate"
                  >
                    {doc.name}
                  </a>
                  <button onClick={() => deleteDoc(doc.id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-2">
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Todos Tab */}
          {activeTab === "todos" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="やること（例：企業研究、OB訪問の準備）"
                  value={todoText}
                  onChange={(e) => setTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  className={inputCls}
                />
                <button onClick={addTodo} className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  追加
                </button>
              </div>
              {company.todos.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                  調べることや準備することを追加しましょう
                </p>
              )}
              {company.todos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-4 py-3">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      todo.completed
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-300 dark:border-slate-500 hover:border-blue-400"
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${todo.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors shrink-0">
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
