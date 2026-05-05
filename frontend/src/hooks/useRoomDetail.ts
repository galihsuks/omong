import { useQuery } from "@tanstack/react-query";
import { getRoomByIdApi } from "@/api/room.api";

export function useRoomDetailQuery(roomId?: string) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoomByIdApi(roomId!),
    enabled: Boolean(roomId),
  });
}
