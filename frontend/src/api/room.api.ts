import { apiClient } from "@/api/client";
import type { Room } from "@/types/domain";

export function getRoomsApi() {
  return apiClient<Room[]>("/room");
}

export function getRoomByIdApi(roomId: string) {
  return apiClient<Room>(`/room/${roomId}`);
}
