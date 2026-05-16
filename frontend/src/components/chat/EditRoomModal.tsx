import { Check, Pencil } from "lucide-react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { InputField } from "@/components/forms/InputField";

type Props = {
  open: boolean;
  value: string;
  isPending?: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function EditRoomModal({ open, value, isPending, onChange, onClose, onSave }: Props) {
  return (
    <ModalTemplate open={open} onClose={onClose} title="Edit Room Name" maxWidthClassName="max-w-sm">
      <InputField
        leftIcon={<Pencil size={16} />}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Room name"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button className="rounded bg-white/10 px-3 py-1 text-xs" onClick={onClose}>
          Cancel
        </button>
        <button
          className="rounded bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900 disabled:opacity-60"
          onClick={onSave}
          disabled={isPending || !value.trim()}
        >
          <span className="inline-flex items-center gap-1">
            <Check size={12} /> Save
          </span>
        </button>
      </div>
    </ModalTemplate>
  );
}
