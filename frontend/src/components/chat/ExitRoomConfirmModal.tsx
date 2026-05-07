import { ModalTemplate } from "@/components/common/ModalTemplate";

type Props = {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ExitRoomConfirmModal({ open, isPending, onClose, onConfirm }: Props) {
  return (
    <ModalTemplate open={open} onClose={onClose} title="Exit Room" maxWidthClassName="max-w-sm">
      <p className="mt-1 text-sm text-slate-300">Are you sure you want to leave this room?</p>
      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded bg-white/10 px-3 py-1 text-xs" onClick={onClose}>
          Cancel
        </button>
        <button
          className="rounded bg-rose-400 px-3 py-1 text-xs font-semibold text-slate-900 disabled:opacity-60"
          onClick={onConfirm}
          disabled={isPending}
        >
          Exit
        </button>
      </div>
    </ModalTemplate>
  );
}
