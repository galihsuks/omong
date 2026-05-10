import { apiClient } from "@/api/client";
import type { Room, UserLite } from "@/types/domain";

export function getRoomsApi(keywords?: string) {
  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("limit", "20");
  if (keywords?.trim()) params.set("keywords", keywords.trim());
  const qs = params.toString();
  return apiClient<{ message: string; data: { totalRooms: number; page: number; rooms: Room[] } }>(
    `/room${qs ? `?${qs}` : ""}`,
  ).then((res) => res.data.rooms);
}

export async function getRoomByIdApi(roomId: string) {
  const rooms = await getRoomsApi();
  const room = rooms.find((item) => item._id === roomId);
  if (!room) throw new Error("Room not found.");
  return room;
}

export function createRoomApi(payload: { nama?: string; tipe: "group" | "private"; anggota: string[] }) {
  return apiClient<{ message: string; data: Room }>("/room", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => res.data);
}

export function updateRoomApi(roomId: string, payload: { nama: string }) {
  return apiClient<{ message: string; data: Room }>(`/room/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((res) => res.data);
}

export function joinRoomApi(roomId: string) {
  return apiClient<{ message: string; data: Room }>(`/room/join/${roomId}`).then((res) => res.data);
}

export function addMembersToRoomApi(roomId: string, anggota: string[]) {
  return apiClient<{ message: string; data: Room }>(`/room/members/${roomId}`, {
    method: "POST",
    body: JSON.stringify({ anggota }),
  }).then((res) => res.data);
}

export function exitRoomApi(roomId: string) {
  return apiClient<{ message: string; data: null }>(`/room/exit/${roomId}`).then((res) => res.data);
}

export function searchUsersApi(filter: "nama" | "email", value: string) {
  const params = new URLSearchParams();
  params.set("keywords", value);
  const qs = params.toString();
  return apiClient<{ message: string; data: UserLite[] }>(`/user/search${qs ? `?${qs}` : ""}`).then(
    (res) => res.data,
  );
}

export function searchRoomMemberCandidatesApi(roomId: string, value: string) {
  const params = new URLSearchParams();
  params.set("keywords", value);
  params.set("room_except_id", roomId);
  const qs = params.toString();
  return apiClient<{ message: string; data: Array<Pick<UserLite, "_id" | "nama" | "email">> }>(
    `/user/search${qs ? `?${qs}` : ""}`,
  ).then((res) => res.data);
}
