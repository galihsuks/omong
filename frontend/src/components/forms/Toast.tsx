import { AlertTriangle, CheckCircle2, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

type ToastType = "success" | "warning" | "error";

type ToastProps = {
  type: ToastType;
  message: string;
  title?: string;
  onClose?: () => void;
  className?: string;
  icon?: ReactNode;
};

const toastStyleMap: Record<
  ToastType,
  {
    container: string;
    title: string;
    message: string;
    icon: ReactNode;
  }
> = {
  success: {
    container: "border-emerald-300/40 bg-emerald-500/10 text-emerald-100",
    title: "text-emerald-200",
    message: "text-emerald-100",
    icon: <CheckCircle2 size={16} />,
  },
  warning: {
    container: "border-amber-300/40 bg-amber-500/10 text-amber-100",
    title: "text-amber-200",
    message: "text-amber-100",
    icon: <TriangleAlert size={16} />,
  },
  error: {
    container: "border-rose-300/40 bg-rose-500/10 text-rose-100",
    title: "text-rose-200",
    message: "text-rose-100",
    icon: <AlertTriangle size={16} />,
  },
};

const defaultTitleMap: Record<ToastType, string> = {
  success: "Success",
  warning: "Warning",
  error: "Error",
};

export function Toast({
  type,
  message,
  title,
  onClose,
  className,
  icon,
}: ToastProps) {
  if (!message) return null;

  const style = toastStyleMap[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${style.container} ${className ?? ""}`}
    >
      <span className="mt-0.5 shrink-0">{icon ?? style.icon}</span>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${style.title}`}>{title ?? defaultTitleMap[type]}</p>
        <p className={`text-sm ${style.message}`}>{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1 hover:bg-white/10 hover:text-white"
          aria-label="Close toast"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
