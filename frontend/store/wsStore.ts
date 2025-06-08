import { create } from "zustand";

type MessageHandler = (data: any) => void;

interface IUser {
    email: string;
    nama: string;
    id: string;
    token: string;
}

type WsStore = {
    ws: WebSocket | null;
    isConnected: boolean;
    messageHandlers: Record<string, MessageHandler[]>;
    pendingSubscriptions: string[];
    connect: () => void;
    online: (user: IUser) => void;
    subscribeRoom: (roomId: string, handler: MessageHandler) => void;
    unsubscribeRoom: (roomId: string, handler: MessageHandler) => void;
    messageHandlerUser: MessageHandler | null;
    setMessageHandlerUser: (handler: MessageHandler | null) => void;
};

export const useWsStore = create<WsStore>((set, get) => ({
    ws: null,
    isConnected: false,
    messageHandlers: {},
    pendingSubscriptions: [],

    messageHandlerUser: null,
    setMessageHandlerUser: (value: MessageHandler | null) => {
        set(() => ({
            messageHandlerUser: value,
        }));
    },

    connect: () => {
        if (get().ws) return;

        const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "");

        ws.onopen = () => {
            console.log("🔌 WebSocket connected");
            set({ isConnected: true });

            // Kirim semua pending subscriptions
            const pending = get().pendingSubscriptions;
            pending.forEach((roomId) => {
                ws.send(
                    JSON.stringify({
                        tipe: "subscribe",
                        data: { room_id: roomId },
                    })
                );
            });
            set({ pendingSubscriptions: [] });
        };

        ws.onmessage = (event) => {
            console.log("Ini on message ws");
            const data = JSON.parse(event.data);
            console.log(data);
            const roomId = data?.data.room_id;
            if (data.tipe == "room" && get().messageHandlerUser) {
                return get().messageHandlerUser!(data);
            }
            if (!roomId) return;

            const handlers = get().messageHandlers[roomId] || [];
            handlers.forEach((h) => h(data));
        };

        ws.onclose = () => {
            console.log("❌ WebSocket closed");
            set({ isConnected: false, ws: null });
        };

        set({ ws });
    },

    online: (user) => {
        const ws = get().ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
                JSON.stringify({
                    tipe: "online",
                    data: user,
                })
            );
        }
    },

    subscribeRoom: (roomId, handler) => {
        const handlers = get().messageHandlers[roomId] || [];
        get().messageHandlers[roomId] = [...handlers, handler];

        const ws = get().ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
                JSON.stringify({
                    tipe: "subscribe",
                    data: { room_id: roomId },
                })
            );
        } else {
            console.warn("⚠️ WebSocket belum konek saat subscribeRoom");
            set((state) => ({
                pendingSubscriptions: [...state.pendingSubscriptions, roomId],
            }));
        }
    },

    unsubscribeRoom: (roomId, handler) => {
        const handlers = get().messageHandlers[roomId] || [];
        get().messageHandlers[roomId] = handlers.filter((h) => h !== handler);

        const ws = get().ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
                JSON.stringify({
                    tipe: "unsubscribe",
                    data: { room_id: roomId },
                })
            );
        }
    },
}));
