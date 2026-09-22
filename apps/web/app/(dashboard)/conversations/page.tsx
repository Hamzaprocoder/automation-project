"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import ConversationList, { type Conversation } from "@/components/inbox/ConversationList";
import ChatView from "@/components/inbox/ChatView";
import CustomerSidebar, { type InboxCustomer } from "@/components/inbox/CustomerSidebar";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<InboxCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadConversations = useCallback(async (searchTerm = "") => {
    setLoading(true);
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
      const result = await api<{ data: Conversation[] }>(`/api/conversations${query}`);
      const next = result.data || [];
      setConversations(next);
      setSelectedId((current) => current && next.some((item) => item.id === current) ? current : next[0]?.id ?? null);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  const refresh = useCallback(() => { void loadConversations(search); }, [loadConversations, search]);

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-[1600px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-200">
        <div className="border-b border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-lg font-bold tracking-tight text-zinc-950">Inbox</h1><p className="mt-0.5 text-xs text-zinc-500">WhatsApp conversations</p></div>
            {!loading && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600">{conversations.length}</span>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); void loadConversations(search); }} className="mt-4">
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100" />
          </form>
        </div>
        {loading ? <div className="space-y-3 p-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div> :
          conversations.length === 0 ? <div className="p-4"><EmptyState title="No conversations yet" description="When customers message you on WhatsApp, they will appear here." /></div> :
          <ConversationList conversations={conversations} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setSelectedCustomer(null); }} loading={false} />}
      </aside>

      <main className="min-w-0 flex-1 border-r border-zinc-200">
        <ChatView conversationId={selectedId} onMessageSent={refresh} onCustomerLoaded={setSelectedCustomer} />
      </main>

      <aside className="hidden w-72 shrink-0 lg:block">
        <CustomerSidebar customer={selectedCustomer} />
      </aside>
    </div>
  );
}
