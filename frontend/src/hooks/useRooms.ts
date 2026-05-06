import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createRoomApi,
  exitRoomApi,
  getRoomByIdApi,
  getRoomsApi,
  joinRoomApi,
  searchUsersApi,
  updateRoomApi,
} from "@/api/room.api";

export function useRoomsQuery(keywords?: string) {
  return useQuery({
    queryKey: ["rooms", keywords ?? ""],
    queryFn: () => getRoomsApi(keywords),
  });
}

export function useRoomDetailQuery(roomId?: string) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoomByIdApi(roomId!),
    enabled: Boolean(roomId),
  });
}

export function useCreateRoomMutation() {
  return useMutation({ mutationFn: createRoomApi });
}

export function useUpdateRoomMutation() {
  return useMutation({
    mutationFn: ({ roomId, nama }: { roomId: string; nama: string }) =>
      updateRoomApi(roomId, { nama }),
  });
}

export function useJoinRoomMutation() {
  return useMutation({ mutationFn: joinRoomApi });
}

export function useExitRoomMutation() {
  return useMutation({ mutationFn: exitRoomApi });
}

export function useUserSearchQuery(filter: "nama" | "email", value: string) {
  return useQuery({
    queryKey: ["users", filter, value],
    queryFn: () => searchUsersApi(filter, value),
    enabled: value.trim().length > 1,
  });
}
