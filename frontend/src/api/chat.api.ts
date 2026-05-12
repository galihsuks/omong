import { apiClient } from "@/api/client";
import type { Chat } from "@/types/domain";

export function addChatApi(roomId: string, payload: { pesan: string; idChatReply: string | null }) {
  return apiClient<{ message: string; data: Chat }>(`/chat/${roomId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => res.data);
}

export function deleteChatApi(chatId: string) {
  return apiClient<{ message: string; data: Chat }>(`/chat/${chatId}`, {
    method: "DELETE",
  }).then((res) => res.data);
}

export function seenRoomApi(roomId: string) {
  return apiClient<{
    message: string;
    data: {
      room_id: string;
      chats: string[];
      addToSeenUsers: { user: { _id: string; nama: string; email: string }; timestamp: number };
    };
  }>(`/chat/${roomId}`).then((res) => res.data);
}

export type RoomChatsPageResponse = {
  totalChats: number;
  page: number;
  chats: Array<{
    totalReadersTarget: number;
    _id: string;
    pesan: string;
    pengirim: { _id: string; email: string; nama: string };
    reply: null | { _id: string; pesan: string; namaPengirim: string };
    isPending: boolean;
    seenUsers: Array<{ timestamp: string; namaUser: string }>;
    createdAt: string;
  }>;
};

export function getRoomChatsPageApi(
  roomId: string,
  page: number,
  limit: number,
  newestTime?: string,
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (newestTime) {
    params.set("newest", String(newestTime));
  }
  const qs = params.toString();
  return apiClient<{ message: string; data: RoomChatsPageResponse }>(
    `/chat/room/${roomId}?${qs}`,
  ).then((res) => res.data);
}
