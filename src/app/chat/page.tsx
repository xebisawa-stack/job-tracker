"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { getChatMessages, saveChatMessages, clearChatMessages } from "@/lib/chatStorage";
import { getMockAiResponse } from "@/lib/mockAi";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages(getChatMessages());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveChatMessages(updated);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getMockAiResponse(text),
        createdAt: new Date().toISOString(),
      };
      const withAi = [...updated, aiMsg];
      setMessages(withAi);
      saveChatMessages(withAi);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChatMessages();
    setMessages([]);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* ヘッダー部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            就活AIアドバイザー
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            面接対策・ES・志望動機など、就活の悩みを相談できます
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            履歴をクリア
          </button>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400 dark:text-slate-500">
              <div className="text-4xl mb-3">💬</div>
              <p className="font-medium">就活に関する質問をしてみましょう</p>
              <p className="text-sm mt-2">
                例：「面接対策を教えて」「自己PRの書き方」「逆質問のおすすめ」
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                  AIアドバイザー
                </div>
              )}
              {msg.content.split("\n").map((line, i) => {
                const boldReplaced = line.replace(
                  /\*\*(.+?)\*\*/g,
                  "<strong>$1</strong>"
                );
                return (
                  <span key={i}>
                    <span dangerouslySetInnerHTML={{ __html: boldReplaced }} />
                    {i < msg.content.split("\n").length - 1 && <br />}
                  </span>
                );
              })}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="animate-pulse">入力中...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 入力欄 */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="質問を入力してください..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </div>
    </div>
  );
}
