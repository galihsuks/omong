import { create } from "zustand";
import { getRoomChatsPageApi, RoomChatsPageResponse } from "@/api/chat.api";
import { getRoomsPageApi, RoomsPageResponse } from "@/api/room.api";
import { ROOM_CHAT_LIMIT, ROOM_LIST_LIMIT } from "@/config/constants";
import type { WsPayload } from "@/types/domain";

type RoomChatItem = {
  totalReadersTarget: number;
  _id: string;
  pesan: string;
  pengirim: { _id: string; email: string; nama: string };
  reply: null | { _id: string; pesan: string; namaPengirim: string };
  isPending: boolean;
  seenUsers: Array<{ timestamp: string; namaUser: string }>;
  createdAt: string;
};

type RoomMainItem = {
  _id: string;
  nama: string;
  tipe: "private" | "group";
  anggota: Array<{ _id: string; email: string; nama: string }>;
  lastchat: null | {
    totalReadersTarget: number;
    _id: string;
    pesan: string;
    namaPengirim: string;
    seenUsers: number;
  };
  updatedAt: string;
  unread: number;
  typing: string[];
  page: number;
  newestTime: string;
  totalChats?: number;
  chats?: RoomChatItem[];
};

function mapApiRoom(room: any): RoomMainItem {
  return {
    _id: String(room._id),
    nama: String(room.nama ?? ""),
    tipe: room.tipe === "group" ? "group" : "private",
    anggota: Array.isArray(room.anggota) ? room.anggota : [],
    lastchat: room.lastChat ?? room.lastchat ?? null,
    updatedAt: String(room.updatedAt ?? new Date().toISOString()),
    unread: Number(room.unread ?? 0),
    typing: Array.isArray(room.typing) ? room.typing : [],
    page: 1,
    newestTime: room.newestTime,
    totalChats: room.totalChats,
    chats: room.chats,
  };
}

type RoomsMainState = {
  totalRooms: number;
  page: number;
  nextPage: (roomId?: string) => void;
  rooms: RoomMainItem[];
  activeRoomId: string | null;
  firstTimestampRenderRooms: string;
  fetchNextRooms: (result: RoomsPageResponse) => Promise<void>;
  setActiveRoomId: (roomId: string | null) => void;
  fetchRoomChatsPage: (roomId: string, result: RoomChatsPageResponse) => Promise<void>;
  handleRealtimePayload: (roomId: string, payload: WsPayload, currentUserName?: string) => void;
};

function mergeRooms(prev: RoomMainItem[], next: RoomMainItem[]) {
  const map = new Map(prev.map((room) => [room._id, room]));
  next.forEach((room) => {
    const current = map.get(room._id);
    map.set(room._id, current ? { ...current, ...room } : room);
  });
  return Array.from(map.values());
}

function normalizeChats(chats: RoomChatItem[]) {
  return [...chats].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export const useRoomsMainStore = create<RoomsMainState>((set, get) => ({
  totalRooms: 0,
  page: 1,
  nextPage: (roomId) => {
    if (roomId) {
      set({
        rooms: get().rooms.map((room) => {
          if (room._id !== roomId) return room;
          return {
            ...room,
            page: room.page + 1,
          };
        }),
      });
      return;
    }
    set({ page: get().page + 1 });
  },
  firstTimestampRenderRooms: new Date().toISOString(),
  rooms: [],
  activeRoomId: null,
  fetchNextRooms: async (result) => {
    const { page, totalRooms, rooms } = get();
    if (page === 1) {
      set({
        totalRooms: result.totalRooms,
        page: result.page,
        rooms: result.rooms.map(mapApiRoom),
      });
      return;
    }
    if (rooms.length >= totalRooms) return;
    set({
      page: result.page,
      rooms: mergeRooms(get().rooms, result.rooms.map(mapApiRoom)),
    });
  },
  setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),
  fetchRoomChatsPage: async (roomId, result) => {
    set({
      rooms: get().rooms.map((room) => {
        if (room._id !== roomId) return room;
        const currentChats = room.chats ?? [];
        const incoming = normalizeChats(result.chats as RoomChatItem[]);
        const merged = normalizeChats([...incoming, ...currentChats]);
        const unique = Array.from(new Map(merged.map((chat) => [chat._id, chat])).values());
        return {
          ...room,
          page: result.page,
          newestTime: room.newestTime ?? new Date().toISOString(),
          totalChats: result.totalChats,
          chats: unique,
        };
      }),
    });
  },
  handleRealtimePayload: (roomId, payload, currentUserName) => {
    set({
      rooms: get().rooms
        .map((room) => {
          if (room._id !== roomId) return room;

          if (payload.event === "typing") {
            if (!payload.userName || payload.userName === currentUserName) return room;
            const currentTyping = room.typing ?? [];
            return {
              ...room,
              typing: payload.status
                ? Array.from(new Set([...currentTyping, payload.userName]))
                : currentTyping.filter((name) => name !== payload.userName),
            };
          }

          if (payload.event !== "chat") return room;

          if (payload.action === "add") {
            const currentChats = room.chats ?? [];
            if (currentChats.some((chat) => chat._id === payload.chat._id)) return room;

            const nextUnread =
              payload.chat.pengirim?.nama &&
              currentUserName &&
              payload.chat.pengirim.nama !== currentUserName
                ? room.unread + 1
                : room.unread;
            const nextChats = normalizeChats([...currentChats, payload.chat as RoomChatItem]);

            return {
              ...room,
              chats: nextChats,
              unread: nextUnread,
              lastchat: {
                _id: payload.chat._id,
                pesan: payload.chat.pesan,
                namaPengirim: payload.chat.pengirim.nama,
                totalReadersTarget: payload.chat.totalReadersTarget,
                seenUsers: payload.chat.seenUsers?.length ?? 0,
              },
              updatedAt: payload.chat.createdAt ?? new Date().toISOString(),
            };
          }

          if (payload.action === "delete") {
            return {
              ...room,
              chats: (room.chats ?? []).filter((chat) => chat._id !== payload.chatId),
            };
          }

          if (payload.action === "seen") {
            const seenTimestamp = new Date(payload.seenUser.timestamp).toISOString();
            const isCurrentUserSeen = payload.seenUser.user.nama === currentUserName;
            return {
              ...room,
              chats: (room.chats ?? []).map((chat) => {
                if (!payload.chatIds.includes(chat._id)) return chat;
                const alreadySeen = (chat.seenUsers ?? []).some(
                  (item) => item.namaUser === payload.seenUser.user.nama,
                );
                if (alreadySeen) return chat;
                return {
                  ...chat,
                  seenUsers: [
                    ...(chat.seenUsers ?? []),
                    { namaUser: payload.seenUser.user.nama, timestamp: seenTimestamp },
                  ],
                };
              }),
              lastchat:
                room.lastchat && payload.chatIds.includes(room.lastchat._id)
                  ? { ...room.lastchat, seenUsers: room.lastchat.seenUsers + 1 }
                  : room.lastchat,
              unread: isCurrentUserSeen ? 0 : room.unread,
            };
          }

          return room;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    });
  },
}));
