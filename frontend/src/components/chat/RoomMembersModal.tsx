import { X } from "lucide-react";
import type { Room } from "@/types/domain";

type Props = {
  room: Room;
  open: boolean;
  onClose: () => void;
};

export function RoomMembersModal({ room, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-900 p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Members: {room.nama}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {room.anggota.map((anggota) => (
            <div key={anggota._id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div>
                <p className="text-sm font-medium">{anggota.nama}</p>
                <p className="text-xs text-slate-300">{anggota.email}</p>
              </div>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  anggota.online?.status ? "bg-green-400" : "bg-slate-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
