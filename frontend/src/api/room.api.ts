import { apiClient } from "@/api/client";
import type { Room, UserLite } from "@/types/domain";

export function getRoomsApi() {
  return apiClient<Room[]>("/room");
}

export function getRoomByIdApi(roomId: string) {
  return apiClient<Room>(`/room/${roomId}`);
}

export function createRoomApi(payload: { nama?: string; tipe: "group" | "private"; anggota: string[] }) {
  return apiClient<Room>("/room", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRoomApi(roomId: string, payload: { nama: string }) {
  return apiClient<Room>(`/room/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function joinRoomApi(roomId: string) {
  return apiClient<{ pesan?: string }>(`/room/join/${roomId}`);
}

export function exitRoomApi(roomId: string) {
  return apiClient<{ pesan: string }>(`/room/exit/${roomId}`);
}

export function searchUsersApi(filter: "nama" | "email", value: string) {
  return apiClient<UserLite[]>(`/user/getby/${filter}`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}
