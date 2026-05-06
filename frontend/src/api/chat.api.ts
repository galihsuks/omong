import { apiClient } from "@/api/client";
import type { Chat } from "@/types/domain";

export function addChatApi(
  roomId: string,
  payload: { pesan: string; idChatReply: string | null },
) {
  return apiClient<Chat>(`/chat/${roomId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteChatApi(chatId: string) {
  return apiClient<Chat>(`/chat/${chatId}`, {
    method: "DELETE",
  });
}

export function seenRoomApi(roomId: string) {
  return apiClient<{ room_id: string; chats: string[]; addToSeenUsers: { user: { _id: string; nama: string; email: string }; timestamp: number } }>(`/chat/${roomId}`);
}
