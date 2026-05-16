import { create } from "zustand";

export type ToastType = "success" | "warning" | "error";

type ToastState = {
  open: boolean;
  type: ToastType;
  message: string;
  title?: string;
  durationMs: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
  showToast: (type: ToastType, message: string, title?: string, durationMs?: number) => void;
  hideToast: () => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  open: false,
  type: "success",
  message: "",
  title: undefined,
  durationMs: 2000,
  timeoutId: null,
  showToast: (type, message, title, durationMs = 3000) => {
    const currentTimeout = get().timeoutId;
    if (currentTimeout) clearTimeout(currentTimeout);

    const nextTimeout = setTimeout(() => {
      get().hideToast();
    }, durationMs);

    set({
      open: true,
      type,
      message,
      title,
      durationMs,
      timeoutId: nextTimeout,
    });
  },
  hideToast: () => {
    const currentTimeout = get().timeoutId;
    if (currentTimeout) clearTimeout(currentTimeout);

    set({
      open: false,
      message: "",
      title: undefined,
      timeoutId: null,
    });
  },
}));

export const showToast = (
  type: ToastType,
  message: string,
  title?: string,
  durationMs?: number,
) => {
  useToastStore.getState().showToast(type, message, title, durationMs);
};
