import { apiClient } from "@/api/client";
import type { UserAuth } from "@/types/domain";

export function loginApi(payload: { email: string; sandi: string }) {
  return apiClient<{ message: string; data: UserAuth }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => res.data);
}

export function signupApi(payload: { nama: string; email: string; sandi: string }) {
  return apiClient<{ message: string; data: null }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutApi() {
  return apiClient<{ message: string; data: null }>("/auth/logout", {
    method: "POST",
  }).then((res) => res.data);
}
