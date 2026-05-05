import { useQuery } from "@tanstack/react-query";
import { getRoomsApi } from "@/api/room.api";

export function useRoomsQuery() {
  return useQuery({ queryKey: ["rooms"], queryFn: getRoomsApi });
}
