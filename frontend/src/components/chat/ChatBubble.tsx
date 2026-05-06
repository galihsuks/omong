import type { Chat } from "@/types/domain";

type Props = {
  chat: Chat;
  isMine: boolean;
  onReply: (chat: Chat) => void;
  onDelete: (chatId: string) => void;
};

export function ChatBubble({ chat, isMine, onReply, onDelete }: Props) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
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
          <button onClick={() => onReply(chat)} className="hover:text-white">Reply</button>
          {isMine && <button onClick={() => onDelete(chat._id)} className="hover:text-rose-300">Delete</button>}
          <span className="ml-auto">{new Date(chat.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}
