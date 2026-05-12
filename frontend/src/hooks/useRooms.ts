import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addMembersToRoomApi,
  createRoomApi,
  exitRoomApi,
  getRoomsPageApi,
  joinRoomApi,
  searchRoomMemberCandidatesApi,
  searchUsersApi,
  updateRoomApi,
} from "@/api/room.api";

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

export function useAddMembersToRoomMutation() {
  return useMutation({
    mutationFn: ({ roomId, anggota }: { roomId: string; anggota: string[] }) =>
      addMembersToRoomApi(roomId, anggota),
  });
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

export function useRoomMemberCandidatesQuery(roomId: string, value: string) {
  return useQuery({
    queryKey: ["room-member-candidates", roomId, value],
    queryFn: () => searchRoomMemberCandidatesApi(roomId, value),
    enabled: Boolean(roomId) && value.trim().length > 1,
  });
}

export function useRoomPageQuery(page: number, limit: number, newestTime?: string) {
  return useQuery({
    queryKey: ["rooms-page", page],
    queryFn: () => getRoomsPageApi(page, limit, newestTime),
  });
}
