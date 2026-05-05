import { apiClient } from "@/api/client";
import type { Chat } from "@/types/domain";

export function addChatApi(roomId: string, payload: { pesan: string; idChatReply: string | null }) {
  return apiClient<Chat>(`/chat/${roomId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function seenRoomApi(roomId: string) {
  return apiClient<{ room_id: string; chats: string[] }>(`/chat/${roomId}`);
}
