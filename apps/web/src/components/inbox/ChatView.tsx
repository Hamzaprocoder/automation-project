"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  body?: string;
  content?: string;
  direction: "INBOUND" | "OUTBOUND";
  status: string;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  status: string;
  customer: {
    id: string;
    name: string | null;
    phone: string;
    whatsappNumber: string | null;
    email?: string | null;
  };
  messages: Message[];
}

interface ChatViewProps {
  conversationId: string | null;
  onMessageSent: () => void;
}

export default function ChatView({
  conversationId,
  onMessageSent,
}: ChatViewProps) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      return;
    }

    let active = true;

    async function loadConversation() {
      setLoading(true);
      setError("");

      try {
        const result = await api<{ conversation: ConversationDetail }>(
          `/api/conversations/${conversationId}`,
        );

        if (active) {
          setConversation(result.conversation);
        }

        await api(`/api/conversations/${conversationId}`, {
          method: "PATCH",
          body: JSON.stringify({ markAsRead: true }),
        });

        if (active) {
          onMessageSent();
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load conversation");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadConversation();

    return () => {
      active = false;
    };
  }, [conversationId, onMessageSent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim() || !conversationId || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      await api(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: content.trim() }),
      });

      setContent("");

      const result = await api<{ conversation: ConversationDetail }>(
        `/api/conversations/${conversationId}`,
      );
      setConversation(result.conversation);
      onMessageSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-50 px-6 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
            💬
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-800">
            Select a conversation
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Choose a customer from the inbox to view the chat.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !conversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading conversation...
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-red-600">
        {error || "Conversation not found"}
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <header className="flex items-center gap-3 border-b bg-white px-5 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
          {(conversation.customer.name || conversation.customer.phone)
            .charAt(0)
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-zinc-900">
            {conversation.customer.name || "Unknown customer"}
          </h2>
          <p className="text-xs text-zinc-500">
            {conversation.customer.whatsappNumber || conversation.customer.phone}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-5">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No messages yet.
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.body ?? message.content ?? ""}
              direction={message.direction}
              createdAt={message.createdAt}
              status={message.status}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-white p-4">
        {error && (
          <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
        <p className="mt-2 text-[10px] text-zinc-400">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
