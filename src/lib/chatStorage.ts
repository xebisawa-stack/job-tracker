import { ChatMessage } from "@/types/chat";

const STORAGE_KEY = "job-tracker-chat";

export function getChatMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data) as ChatMessage[];
}

export function saveChatMessages(messages: ChatMessage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function clearChatMessages(): void {
  localStorage.removeItem(STORAGE_KEY);
}
