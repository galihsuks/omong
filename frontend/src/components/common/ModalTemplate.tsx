import { X } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidthClassName?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  contentClassName?: string;
};

export function ModalTemplate({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-md",
  showCloseButton = true,
  closeOnBackdrop = true,
  contentClassName = "",
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6 backdrop-blur"
      onClick={() => {
        if (!closeOnBackdrop) return;
        onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto rounded-xl border border-white/20 bg-slate-900/60 p-4 text-white ${contentClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="mb-3 flex items-center justify-between">
            {title ? <h2 className="text-base font-semibold">{title}</h2> : <span />}
            {showCloseButton && (
              <button onClick={onClose} className="rounded p-1 hover:bg-white/10">
                <X size={16} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
