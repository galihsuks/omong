import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useRoomsMainStore } from "@/store/roomsMain.store";
import { useWsStore } from "@/store/ws.store";
import type { WsPayload } from "@/types/domain";

export function ProtectedAppLayout() {
  const user = useAuthStore((state) => state.user);
  const { handleRealtimePayload, rooms } = useRoomsMainStore();
  const { connect, sendOnline, subscribe, unsubscribe } = useWsStore();

  useEffect(() => {
    console.log(rooms);
  }, [rooms]);

  useEffect(() => {
    connect();
    if (user?.id) sendOnline(user.id);
  }, [connect, sendOnline, user?.id]);

  useEffect(() => {
    if (!rooms.length) return;

    const unsubs: Array<() => void> = [];
    rooms.forEach((room) => {
      const handler = (payload: unknown) => {
        const data = payload as WsPayload;
        handleRealtimePayload(room._id, data, user?.nama);
      };
      subscribe(room._id, handler);
      unsubs.push(() => unsubscribe(room._id, handler));
    });

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [handleRealtimePayload, rooms, subscribe, unsubscribe, user?.nama]);

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
