import { apiClient } from "@/api/client";
import type { UserProfile } from "@/types/domain";

export function getMyProfileApi() {
  return apiClient<{ message: string; data: UserProfile }>("/user").then((res) => res.data);
}

export function updateMyProfileApi(payload: {
  nama?: string;
  email?: string;
  sandi?: string;
  timezone?: string;
}) {
  return apiClient<{ message: string; data: UserProfile }>("/user", {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((res) => res.data);
}

export type OnlineUser = {
  _id: string;
  isOnline: boolean;
  lastSeen: string | null;
};

export function getOnlineUsersApi(userIds: string[]) {
  return apiClient<{ message: string; data: OnlineUser[] }>("/user/online", {
    method: "POST",
    body: JSON.stringify({ user_ids: userIds }),
  }).then((res) => res.data);
}
