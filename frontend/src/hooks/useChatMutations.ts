import { useMutation, useQuery } from "@tanstack/react-query";
import { addChatApi, deleteChatApi, getRoomChatsPageApi, seenRoomApi } from "@/api/chat.api";

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

export function useChatPageQuery(roomId: string, page: number, limit: number, newestTime?: string) {
  return useQuery({
    queryKey: ["chats-room", roomId, page],
    queryFn: () => getRoomChatsPageApi(roomId, page, limit, newestTime),
  });
}
