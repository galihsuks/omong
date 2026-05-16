import { useMutation } from "@tanstack/react-query";
import { loginApi, signupApi } from "@/api/auth.api";

export function useLoginMutation() {
  return useMutation({ mutationFn: loginApi });
}

export function useSignupMutation() {
  return useMutation({ mutationFn: signupApi });
}
