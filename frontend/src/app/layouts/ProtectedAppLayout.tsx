import { useEffect, useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ROOM_LIST_LIMIT } from "@/config/constants";
import { getRoomsPageApi } from "@/api/room.api";
import { useAuthStore } from "@/store/auth.store";
import { useRoomsMainStore } from "@/store/roomsMain.store";
import { useWsStore } from "@/store/ws.store";
import type { WsPayload } from "@/types/domain";

export function ProtectedAppLayout() {
  const user = useAuthStore((state) => state.user);
  const { handleRealtimePayload, rooms, hydrateRoomsPage } = useRoomsMainStore();
  const { connect, sendOnline, subscribe, unsubscribe } = useWsStore();

  const roomIdsKey = rooms.map((room) => room._id).join("|");
  const roomIds = useMemo(() => rooms.map((room) => room._id), [roomIdsKey]);

  useEffect(() => {
    connect();
    if (user?.id) sendOnline(user.id);
  }, [connect, sendOnline, user?.id]);

  useEffect(() => {
    if (!roomIds.length) return;

    const unsubs: Array<() => void> = [];
    roomIds.forEach((roomId) => {
      const handler = (payload: unknown) => {
        const data = payload as WsPayload;
        handleRealtimePayload(roomId, data, user?.nama);
      };
      subscribe(roomId, handler);
      unsubs.push(() => unsubscribe(roomId, handler));
    });

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [handleRealtimePayload, roomIdsKey, roomIds, subscribe, unsubscribe, user?.nama]);

  useEffect(() => {
    if (!user?.id) return;
    const userChannel = `__user__:${user.id}`;
    const handler = (payload: unknown) => {
      const data = payload as WsPayload;
      if (data.event !== "room") return;
      if (data.action !== "add" && data.action !== "update" && data.action !== "delete") return;
      void getRoomsPageApi(1, ROOM_LIST_LIMIT, new Date().toISOString()).then((result) => {
        hydrateRoomsPage(result);
      });
    };

    subscribe(userChannel, handler);
    return () => unsubscribe(userChannel, handler);
  }, [hydrateRoomsPage, subscribe, unsubscribe, user?.id]);

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
