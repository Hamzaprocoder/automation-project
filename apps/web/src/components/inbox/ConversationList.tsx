"use client";

export interface Conversation {
  id: string;
  unreadCount: number;
  lastMessageAt: string | null;
  status?: string;
  customer: {
    id: string;
    name: string | null;
    phone: string;
    whatsappNumber?: string | null;
  };
  messages: Array<{
    id?: string;
    body?: string;
    content?: string;
    direction: string;
    createdAt?: string;
  }>;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationListProps) {
  if (loading) {
    return <p className="p-4 text-sm text-zinc-500">Loading conversations...</p>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-medium text-zinc-700">No conversations yet</p>
        <p className="mt-1 text-xs text-zinc-500">
          Incoming WhatsApp conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto divide-y divide-zinc-100">
      {conversations.map((conversation) => {
        const lastMessage = conversation.messages?.[0];
        const lastMessageBody = lastMessage?.body ?? lastMessage?.content ?? "No messages";
        const isSelected = selectedId === conversation.id;

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={`w-full px-4 py-3 text-left transition-colors ${
                isSelected ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {(conversation.customer.name || conversation.customer.phone)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-zinc-900">
                      {conversation.customer.name || conversation.customer.phone}
                    </span>
                    {conversation.lastMessageAt && (
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {new Date(conversation.lastMessageAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-zinc-500">{lastMessageBody}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
