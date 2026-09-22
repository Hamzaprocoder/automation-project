interface MessageBubbleProps {
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  createdAt: string;
  status?: string;
}

export default function MessageBubble({
  content,
  direction,
  createdAt,
  status,
}: MessageBubbleProps) {
  const isOutbound = direction === "OUTBOUND";

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
          isOutbound
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 text-zinc-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] ${
            isOutbound ? "text-white/70" : "text-zinc-500"
          }`}
        >
          <span>
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOutbound && status && (
            <span className="capitalize">· {status.toLowerCase()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
