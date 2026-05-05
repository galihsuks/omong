import { apiClient } from "@/api/client";
import type { UserAuth } from "@/types/domain";

export function loginApi(payload: { email: string; sandi: string }) {
  return apiClient<UserAuth>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signupApi(payload: { nama: string; email: string; sandi: string }) {
  return apiClient<{ pesan: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
