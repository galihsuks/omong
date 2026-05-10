import { apiClient } from "@/api/client";
import type { Chat } from "@/types/domain";

export function addChatApi(
  roomId: string,
  payload: { pesan: string; idChatReply: string | null },
) {
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
