"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import ChatView from "@/components/inbox/ChatView";
import ConversationList, {
  type Conversation,
} from "@/components/inbox/ConversationList";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadConversations = useCallback(async (searchTerm = "") => {
    setLoading(true);

    try {
      const query = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}`
        : "";
      const result = await api<{ data: Conversation[] }>(
        `/api/conversations${query}`,
      );
      const nextConversations = result.data || [];

      setConversations(nextConversations);

      setSelectedId((current) => {
        if (current && nextConversations.some((item) => item.id === current)) {
          return current;
        }
        return nextConversations[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const handleInboxRefresh = useCallback(() => {
    void loadConversations(search);
  }, [loadConversations, search]);

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-[1600px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-200">
        <div className="border-b border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-950">
                Inbox
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500">
                WhatsApp conversations
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600">
              {conversations.length}
            </span>
          </div>

          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              void loadConversations(search);
            }}
          >
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
              />
            </div>
          </form>
        </div>

        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
        />
      </aside>

      <main className="min-w-0 flex-1">
        <ChatView
          conversationId={selectedId}
          onMessageSent={handleInboxRefresh}
        />
      </main>

      <aside className="hidden w-64 shrink-0 border-l border-zinc-200 bg-white xl:block">
        {selectedId ? (
          (() => {
            const selected = conversations.find(
              (conversation) => conversation.id === selectedId,
            );

            if (!selected) {
              return (
                <div className="p-5 text-sm text-zinc-500">
                  Customer details unavailable.
                </div>
              );
            }

            return (
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Customer
                </p>
                <div className="mt-5 flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-xl font-bold text-white">
                    {(selected.customer.name || selected.customer.phone)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-zinc-900">
                    {selected.customer.name || "Unknown customer"}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {selected.customer.whatsappNumber || selected.customer.phone}
                  </p>
                </div>

                <div className="mt-6 space-y-4 border-t border-zinc-100 pt-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      {selected.customer.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      WhatsApp
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      {selected.customer.whatsappNumber || "Not available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Conversation
                    </p>
                    <p className="mt-1 text-sm capitalize text-zinc-700">
                      {selected.status?.toLowerCase() || "open"}
                    </p>
                  </div>
                </div>

                <a
                  href={`/customers/${selected.customer.id}`}
                  className="mt-6 block rounded-xl border border-zinc-200 px-3 py-2 text-center text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  View customer profile
                </a>
              </div>
            );
          })()
        ) : (
          <div className="p-5 text-sm text-zinc-500">
            Select a conversation to view customer details.
          </div>
        )}
      </aside>
    </div>
  );
}
