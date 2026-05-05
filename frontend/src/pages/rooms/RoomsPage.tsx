import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useRoomsQuery } from "@/hooks/useRooms";
import { useAuthStore } from "@/store/auth.store";
import { useWsStore } from "@/store/ws.store";

export function RoomsPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { connect, sendOnline } = useWsStore();

  const { data: roomsData, isPending: isRoomsPending, error: roomsError } = useRoomsQuery();

  useEffect(() => {
    connect();
    if (user?.id) sendOnline(user.id);
  }, [connect, sendOnline, user?.id]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-6 text-slate-100">
      <section className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Room Omong</h1>
          <button className="rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800" onClick={logout}>Logout</button>
        </div>

        {isRoomsPending && <p className="text-slate-300">Loading room...</p>}
        {roomsError && <p className="text-rose-400">{(roomsError as Error).message}</p>}

        <div className="space-y-3">
          {roomsData?.map((room) => (
            <Link key={room._id} to={`/rooms/${room._id}`} className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-cyan-500/60">
              <h3 className="font-semibold">{room.nama || "Private room"}</h3>
              <p className="mt-1 text-sm text-slate-300">{room.lastchat?.pesan ?? "Belum ada chat"}</p>
              <small className="text-xs text-slate-400">Unread: {room.chatsUnread}</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
