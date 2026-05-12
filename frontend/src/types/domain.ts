export type UserAuth = {
  id: string;
  nama: string;
  email: string;
  token: string;
};

export type UserProfile = {
  _id: string;
  nama: string;
  email: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type UserLite = {
  _id: string;
  nama: string;
  email: string;
};

export type ChatReply = {
  _id: string;
  pesan: string;
  idPengirim: { nama: string };
};

export type Chat = {
  _id: string;
  pesan: string;
  createdAt: string;
  pengirim: { _id: string; email: string; nama: string };
  reply: null | { _id: string; pesan: string; namaPengirim: string };
  totalReadersTarget: number;
  seenUsers: Array<{ timestamp: string; namaUser: string }>;
  isPending: boolean;
};

export type Room = {
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
  chats?: Chat[];
};

export type WsPayload =
  | { event: "chat"; action: "add"; roomId: string; chat: Chat }
  | { event: "chat"; action: "delete"; roomId: string; chatId: string }
  | {
      event: "chat";
      action: "seen";
      roomId: string;
      chatIds: string[];
      seenUser: { user: UserLite; timestamp: number };
    }
  | { event: "typing"; roomId: string; userName: string; status: boolean }
  | { event: "room"; action: "add" | "update" | "delete"; room: Room };
