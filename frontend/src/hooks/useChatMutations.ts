import { useMutation } from "@tanstack/react-query";
import { addChatApi, seenRoomApi } from "@/api/chat.api";

export function useAddChatMutation(roomId: string) {
  return useMutation({
    mutationFn: (pesan: string) => addChatApi(roomId, { pesan, idChatReply: null }),
  });
}

export function useSeenRoomMutation(roomId: string) {
  return useMutation({ mutationFn: () => seenRoomApi(roomId) });
}
