import { Check, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { Chat } from "@/types/domain";
import { formatDateTimeByTimeZone, formatTimeByTimeZone } from "@/utils/dateTime";

type Props = {
  chat: Chat;
  isMine: boolean;
  currentUserId?: string;
  timeZone?: string;
  onReply: (chat: Chat) => void;
  onDelete: (chatId: string) => void;
};

export function ChatBubble({ chat, isMine, currentUserId, timeZone, onReply, onDelete }: Props) {
  const [showReaders, setShowReaders] = useState(false);
  const readers = useMemo(
    () =>
      (chat.seenUsers ?? []).filter((item) => {
        const readerId = item.user?._id;
        return Boolean(readerId) && readerId !== currentUserId;
      }),
    [chat.seenUsers, currentUserId],
  );
  const totalReadersTarget = Math.max(chat.totalReadersTarget ?? 0, 0);
  const hasAnyReader = readers.length > 0;
  const hasAllReaders = totalReadersTarget > 0 && readers.length >= totalReadersTarget;
  const readLabel = !hasAnyReader ? "Sent" : "Show";

  return (
    <div className={`group flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
          isMine ? "bg-fuchsia-500/30" : "bg-white/10"
        }`}
      >
        {!isMine && <p className="mb-1 text-[10px] text-cyan-300">{chat.idPengirim.nama}</p>}

        {chat.idChatReply && (
          <div className="mb-2 rounded-md border-l-2 border-indigo-300 bg-black/20 px-2 py-1">
            <p className="text-[10px] text-indigo-200">{chat.idChatReply.idPengirim.nama}</p>
            <p className="line-clamp-2 text-xs text-slate-200">{chat.idChatReply.pesan}</p>
          </div>
        )}

        <p className="text-sm text-white">{chat.pesan}</p>

        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-300">
          <button onClick={() => onReply(chat)} className="hover:text-white">
            Reply
          </button>
          {isMine && (
            <button onClick={() => onDelete(chat._id)} className="hover:text-rose-300">
              Delete
            </button>
          )}
          <span className="ml-auto pl-2">{formatTimeByTimeZone(chat.createdAt, timeZone)}</span>
          {isMine && (
            <button
              onClick={() => setShowReaders((prev) => !prev)}
              className={`inline-flex items-center transition-all duration-300 ease-in-out gap-0 group-hover:gap-1 ${
                hasAllReaders
                  ? "text-cyan-300 hover:text-cyan-200"
                  : "text-white hover:text-slate-200"
              }`}
              title={readLabel}
            >
              {!hasAnyReader ? <Check size={12} /> : <CheckCheck size={12} />}
              <span className="text-nowrap overflow-hidden transition-all duration-300 ease-in-out max-w-[0px] group-hover:max-w-[70px]">
                {readLabel}
              </span>
            </button>
          )}
        </div>

        {isMine && showReaders && (
          <div className="mt-2 rounded-md border border-white/15 bg-black/20 p-2">
            {readers.length === 0 ? (
              <p className="text-[10px] text-slate-300">No one has read this message yet.</p>
            ) : (
              <div className="space-y-1">
                {readers.map((item) => (
                  <div
                    key={`${item.user._id}-${item.timestamp}`}
                    className="flex items-center gap-2"
                  >
                    <p className="truncate text-[10px] font-semibold text-cyan-200">
                      {item.user.nama}
                    </p>
                    <p className="truncate text-[10px] text-slate-300">
                      {formatDateTimeByTimeZone(item.timestamp, timeZone)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
