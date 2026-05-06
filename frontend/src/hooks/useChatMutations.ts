import { useMutation } from "@tanstack/react-query";
import { addChatApi, deleteChatApi, seenRoomApi } from "@/api/chat.api";

export function useAddChatMutation(roomId: string) {
  return useMutation({
    mutationFn: (payload: { pesan: string; idChatReply: string | null }) =>
      addChatApi(roomId, payload),
  });
}

export function useDeleteChatMutation() {
  return useMutation({ mutationFn: deleteChatApi });
}

export function useSeenRoomMutation(roomId: string) {
  return useMutation({ mutationFn: () => seenRoomApi(roomId) });
}
