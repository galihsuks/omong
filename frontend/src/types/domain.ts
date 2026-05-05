export type UserAuth = {
  id: string;
  nama: string;
  email: string;
  token: string;
};

export type Chat = {
  _id: string;
  pesan: string;
  createdAt: string;
  idRoom: string;
  idPengirim: { _id: string; nama: string; email: string };
  idChatReply: null | { _id: string; pesan: string; idPengirim: { nama: string } };
  seenUsers: Array<{ user: { _id: string; nama: string; email: string }; timestamp: string }>;
};

export type Room = {
  _id: string;
  nama: string;
  tipe: "group" | "private";
  chatsUnread: number;
  online: boolean;
  anggota: Array<{ _id: string; nama: string; email: string }>;
  lastchat: Chat | null;
  chats?: Chat[];
};
