import { Toast } from "@/components/forms/Toast";
import { useToastStore } from "@/store/toast.store";

export function ToastViewport() {
  const open = useToastStore((state) => state.open);
  const type = useToastStore((state) => state.type);
  const message = useToastStore((state) => state.message);
  const title = useToastStore((state) => state.title);
  const hideToast = useToastStore((state) => state.hideToast);

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] w-full max-w-md -translate-x-1/2 px-4">
      <div
        className={`pointer-events-auto relative transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 -z-10 rounded-xl transition-all duration-300 ${
            open ? "bg-black/25 backdrop-blur-md" : "bg-transparent backdrop-blur-0"
          }`}
        />
        <Toast type={type} message={message} title={title} onClose={hideToast} />
      </div>
    </div>
  );
}
