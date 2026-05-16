import { Link } from "react-router-dom";
import type { Room } from "@/types/domain";
import { formatDateTimeByTimeZone } from "@/utils/dateTime";

type Props = {
  room: Room & { typingNames?: string[] };
  timeZone?: string;
};

export function RoomListItem({ room, timeZone }: Props) {
  const preview = room.typingNames?.length
    ? `${room.typingNames.length > 1 ? `${room.typingNames.length} people` : room.typingNames[0]} typing...`
    : (room.lastchat?.pesan ?? "No messages yet");

  const unread = room.unread > 0;
  const lastAt = room.updatedAt
    ? formatDateTimeByTimeZone(room.updatedAt, timeZone)
    : "";

  return (
    <Link
      to="/rooms"
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-indigo-300/70 hover:bg-indigo-500/20"
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600/50 text-sm font-bold text-white">
        {room.nama?.slice(0, 2).toUpperCase() || "PV"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{room.nama}</p>
        <p className="truncate text-xs text-slate-300">{preview}</p>
      </div>

      <div className="text-right">
        {lastAt && <p className="text-[10px] text-slate-300">{lastAt}</p>}
        {unread && (
          <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-pink-400 px-1.5 text-[10px] font-semibold text-slate-900">
            {room.unread}
          </span>
        )}
      </div>
    </Link>
  );
}
