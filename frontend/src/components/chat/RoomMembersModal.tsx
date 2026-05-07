import { ModalTemplate } from "@/components/common/ModalTemplate";
import type { Room } from "@/types/domain";

type Props = {
  room: Room;
  open: boolean;
  onClose: () => void;
};

export function RoomMembersModal({ room, open, onClose }: Props) {
  return (
    <ModalTemplate open={open} onClose={onClose} title={`Members: ${room.nama}`} maxWidthClassName="max-w-md">
      <div className="space-y-2">
        {room.anggota.map((anggota) => (
          <div
            key={anggota._id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            <div>
              <p className="max-w-[200px] truncate text-sm font-medium">{anggota.nama}</p>
              <p className="max-w-[200px] truncate text-xs text-slate-300">{anggota.email}</p>
            </div>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                anggota.online?.status ? "bg-green-400" : "bg-slate-500"
              }`}
            />
          </div>
        ))}
      </div>
    </ModalTemplate>
  );
}
