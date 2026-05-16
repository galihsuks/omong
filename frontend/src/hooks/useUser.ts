import { useMutation, useQuery } from "@tanstack/react-query";
import { getMyProfileApi, updateMyProfileApi } from "@/api/user.api";

export function useMyProfileQuery() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfileApi,
  });
}

export function useUpdateMyProfileMutation() {
  return useMutation({
    mutationFn: updateMyProfileApi,
  });
}
