
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
  online?: { status: boolean; last: string | null };
  createdAt: string;
  updatedAt: string;
};

export type UserLite = {
  _id: string;
  nama: string;
  email: string;
  online?: { status: boolean; last: string | null };
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
  idRoom: string;
  idPengirim: UserLite;
  idChatReply: null | ChatReply;
  seenUsers: Array<{ user: UserLite; timestamp: string }>;
};

export type Room = {
  _id: string;
  nama: string;
  tipe: "group" | "private";
  chatsUnread: number;
  online: boolean;
  anggota: UserLite[];
  lastchat: Chat | null;
  chats?: Chat[];
};

export type WsPayload =
  | { event: "chat"; action: "add"; roomId: string; chat: Chat }
  | { event: "chat"; action: "delete"; roomId: string; chatId: string }
  | { event: "chat"; action: "seen"; roomId: string; chatIds: string[]; seenUser: { user: UserLite; timestamp: number } }
  | { event: "typing"; roomId: string; userName: string; status: boolean }
  | { event: "room"; action: "add" | "update" | "delete"; room: Room };
