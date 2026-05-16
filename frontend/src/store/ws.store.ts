import { create } from "zustand";
import { env } from "@/config/env";
import { useOnlineMembersStore } from "@/store/onlineMembers.store";

type MessageHandler = (payload: unknown) => void;

type WsStore = {
  ws: WebSocket | null;
  handlers: Record<string, MessageHandler[]>;
  subscribedRooms: Record<string, number>;
  connect: () => void;
  disconnect: () => void;
  subscribe: (roomId: string, handler: MessageHandler) => void;
  unsubscribe: (roomId: string, handler: MessageHandler) => void;
  send: (roomId: string, payload: unknown) => void;
  sendOnline: (primaryKey: string) => void;
};

export const useWsStore = create<WsStore>((set, get) => ({
  ws: null,
  handlers: {},
  subscribedRooms: {},
  connect: () => {
    if (get().ws) return;

    const ws = new WebSocket(env.VITE_WS_URL);
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.tipe === "online") {
        if (parsed.data?.app_id && parsed.data.app_id !== env.VITE_WS_APP_ID) return;
        const clients = Array.isArray(parsed.data?.clients)
          ? (parsed.data.clients as string[])
          : [];
        void useOnlineMembersStore.getState().syncFromOnlineIds(clients);
        return;
      }

      if (parsed.tipe === "send") {
        if (parsed.data?.app_id && parsed.data.app_id !== env.VITE_WS_APP_ID) return;
        const roomId = parsed.data?.room_id as string;
        const payload = parsed.data?.payload;
        (get().handlers[roomId] ?? []).forEach((handler) => handler(payload));
      }
    };
    ws.onclose = () => set({ ws: null, handlers: {}, subscribedRooms: {} });

    set({ ws });
  },
  disconnect: () => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    set({ ws: null, handlers: {}, subscribedRooms: {} });
  },
  subscribe: (roomId, handler) => {
    const ws = get().ws;
    const nextHandlers = [...(get().handlers[roomId] ?? []), handler];
    const currentCount = get().subscribedRooms[roomId] ?? 0;
    const nextCount = currentCount + 1;

    set({
      handlers: { ...get().handlers, [roomId]: nextHandlers },
      subscribedRooms: { ...get().subscribedRooms, [roomId]: nextCount },
    });

    if (currentCount === 0) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            tipe: "subscribe",
            data: { app_id: env.VITE_WS_APP_ID, room_id: roomId },
          }),
        );
      } else {
        ws?.addEventListener(
          "open",
          () => {
            const activeCount = useWsStore.getState().subscribedRooms[roomId] ?? 0;
            if (activeCount <= 0) return;
            ws.send(
              JSON.stringify({
                tipe: "subscribe",
                data: { app_id: env.VITE_WS_APP_ID, room_id: roomId },
              }),
            );
          },
          { once: true },
        );
      }
    }
  },
  unsubscribe: (roomId, handler) => {
    const ws = get().ws;
    const filteredHandlers = (get().handlers[roomId] ?? []).filter((h) => h !== handler);
    const currentCount = get().subscribedRooms[roomId] ?? 0;
    const nextCount = Math.max(currentCount - 1, 0);

    const nextHandlersMap = { ...get().handlers, [roomId]: filteredHandlers };
    if (filteredHandlers.length === 0) {
      delete nextHandlersMap[roomId];
    }

    const nextSubscribedMap = { ...get().subscribedRooms, [roomId]: nextCount };
    if (nextCount === 0) {
      delete nextSubscribedMap[roomId];
    }

    set({
      handlers: nextHandlersMap,
      subscribedRooms: nextSubscribedMap,
    });

    if (nextCount === 0 && ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          tipe: "unsubscribe",
          data: { app_id: env.VITE_WS_APP_ID, room_id: roomId },
        }),
      );
    }
  },
  send: (roomId, payload) => {
    const ws = get().ws;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          tipe: "send",
          data: { app_id: env.VITE_WS_APP_ID, room_id: roomId, payload },
        }),
      );
    }
  },
  sendOnline: (primaryKey) => {
    const ws = get().ws;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          tipe: "online",
          data: { app_id: env.VITE_WS_APP_ID, primary_key: primaryKey },
        }),
      );
    } else {
      ws?.addEventListener(
        "open",
        () => {
          ws.send(
            JSON.stringify({
              tipe: "online",
              data: { app_id: env.VITE_WS_APP_ID, primary_key: primaryKey },
            }),
          );
        },
        { once: true },
      );
    }
  },
}));
