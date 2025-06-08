import { create } from "zustand";

interface anggota {
    email: string;
    nama: string;
    _id: string;
}

interface seen {
    timestamp: string;
    user: anggota;
}

interface IChat {
    idChatReply: string | null;
    _id: string;
    pesan: string;
    idPengirim: anggota;
    idRoom: string;
    createdAt: string;
    updatedAt: string;
    seenUsers: seen[];
}

interface IRooms {
    _id: string;
    nama: string;
    tipe: string;
    anggota: anggota[];
    createdAt: string;
    updatedAt: string;
    lastchat: IChat | null;
    chats: IChat[];
    chatsUnread: number;
    online: boolean;
    typing: string[]; //array nama user
}

interface RoomsStore {
    rooms: IRooms[];
    chats: IChat[];
    setRooms: (value: IRooms[]) => void;
    setChats: (value: IChat[]) => void;
}

const useRoomsStore = create<RoomsStore>((set, get) => ({
    rooms: [],
    chats: [],
    setRooms: (value: IRooms[]) => {
        set(() => ({
            rooms: value,
        }));
    },
    setChats: (value: IChat[]) => {
        set(() => ({
            chats: value,
        }));
    },
}));

export default useRoomsStore;
