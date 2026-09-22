"use client";

import Skeleton from "@/components/ui/Skeleton";

export interface Conversation {
  id: string;
  unreadCount: number;
  lastMessageAt: string | null;
  status?: string;
  customer: { id: string; name: string | null; phone: string; whatsappNumber?: string | null };
  messages: Array<{ id?: string; body?: string; content?: string; direction: string; createdAt?: string }>;
}

interface ConversationListProps { conversations: Conversation[]; selectedId: string | null; onSelect: (id: string) => void; loading: boolean; }

function ConversationSkeleton() {
  return <div className="space-y-1 px-3 py-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex gap-3 rounded-xl px-1 py-2"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-3.5 w-3/5" /><Skeleton className="h-3 w-4/5" /></div></div>)}</div>;
}

export default function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
  if (loading) return <ConversationSkeleton />;
  if (conversations.length === 0) return <div className="flex flex-1 items-center justify-center p-6 text-center"><div><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-lg">💬</div><p className="mt-3 text-sm font-semibold text-zinc-700">No conversations yet</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-zinc-500">Incoming WhatsApp conversations will appear here.</p></div></div>;

  return <ul className="flex-1 overflow-y-auto">{conversations.map((conversation) => {
    const lastMessage = conversation.messages?.[0];
    const lastMessageBody = lastMessage?.body ?? lastMessage?.content ?? "No messages";
    const isSelected = selectedId === conversation.id;
    const displayName = conversation.customer.name || conversation.customer.phone;
    return <li key={conversation.id} className="px-2"><button type="button" onClick={() => onSelect(conversation.id)} className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${isSelected ? "bg-zinc-100" : "hover:bg-zinc-50"}`}>
      <div className="flex items-start gap-3"><div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">{displayName.charAt(0).toUpperCase()}{conversation.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600" />}</div>
      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className={`truncate text-sm ${conversation.unreadCount > 0 ? "font-bold text-zinc-950" : "font-semibold text-zinc-800"}`}>{displayName}</span>{conversation.lastMessageAt && <span className="shrink-0 text-[10px] text-zinc-400">{new Date(conversation.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>}</div>
      <div className="mt-1 flex items-center justify-between gap-2"><p className={`truncate text-xs ${conversation.unreadCount > 0 ? "font-medium text-zinc-700" : "text-zinc-500"}`}>{lastMessageBody}</p>{conversation.unreadCount > 0 && <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</span>}</div></div></div>
    </button></li>;
  })}</ul>;
}