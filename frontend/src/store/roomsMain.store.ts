import { create } from "zustand";
import { getRoomChatsPageApi, RoomChatsPageResponse } from "@/api/chat.api";
import { getRoomsPageApi, RoomsPageResponse } from "@/api/room.api";
import { ROOM_CHAT_LIMIT, ROOM_LIST_LIMIT } from "@/config/constants";

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
}));
