import { create } from "zustand";
import { env } from "@/config/env";

type MessageHandler = (payload: unknown) => void;

type WsStore = {
  ws: WebSocket | null;
  handlers: Record<string, MessageHandler[]>;
  connect: () => void;
  subscribe: (roomId: string, handler: MessageHandler) => void;
  unsubscribe: (roomId: string, handler: MessageHandler) => void;
  send: (roomId: string, payload: unknown) => void;
  sendOnline: (primaryKey: string) => void;
};

export const useWsStore = create<WsStore>((set, get) => ({
  ws: null,
  handlers: {},
  connect: () => {
    if (get().ws) return;

    const ws = new WebSocket(env.VITE_WS_URL);
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.tipe !== "send") return;
      const roomId = parsed.data?.room_id as string;
      const payload = parsed.data?.payload;
      (get().handlers[roomId] ?? []).forEach((handler) => handler(payload));
    };
    ws.onclose = () => set({ ws: null, handlers: {} });

    set({ ws });
  },
  subscribe: (roomId, handler) => {
    const ws = get().ws;
    const nextHandlers = [...(get().handlers[roomId] ?? []), handler];
    set({ handlers: { ...get().handlers, [roomId]: nextHandlers } });

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipe: "subscribe", data: { room_id: roomId } }));
    } else {
      ws?.addEventListener(
        "open",
        () => {
          ws.send(JSON.stringify({ tipe: "subscribe", data: { room_id: roomId } }));
        },
        { once: true },
      );
    }
  },
  unsubscribe: (roomId, handler) => {
    const ws = get().ws;
    set({
      handlers: {
        ...get().handlers,
        [roomId]: (get().handlers[roomId] ?? []).filter((h) => h !== handler),
      },
    });
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipe: "unsubscribe", data: { room_id: roomId } }));
    }
  },
  send: (roomId, payload) => {
    const ws = get().ws;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipe: "send", data: { room_id: roomId, payload } }));
    }
  },
  sendOnline: (primaryKey) => {
    const ws = get().ws;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipe: "online", data: { primary_key: primaryKey } }));
    } else {
      ws?.addEventListener(
        "open",
        () => {
          ws.send(JSON.stringify({ tipe: "online", data: { primary_key: primaryKey } }));
        },
        { once: true },
      );
    }
  },
}));
