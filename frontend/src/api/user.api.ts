import { apiClient } from "@/api/client";
import type { UserProfile } from "@/types/domain";

export function getMyProfileApi() {
  return apiClient<UserProfile>("/user");
}

export function updateMyProfileApi(payload: {
  nama?: string;
  email?: string;
  sandi?: string;
  timezone?: string;
}) {
  return apiClient<UserProfile>("/user", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
