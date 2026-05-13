import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/common/BottomNav";
import { RoomDetailPage } from "@/pages/chat/RoomDetailPage";
import { useAuthStore } from "@/store/auth.store";
import { useRoomsMainStore } from "@/store/roomsMain.store";
import { useOnlineMembersStore } from "@/store/onlineMembers.store";
import { useRoomPageQuery } from "@/hooks/useRooms";
import { ROOM_LIST_LIMIT } from "@/config/constants";

export function RoomsPage() {
  const user = useAuthStore((state) => state.user);
  const {
    totalRooms,
    rooms,
    page,
    nextPage,
    activeRoomId,
    fetchNextRooms,
    setActiveRoomId,
    firstTimestampRenderRooms,
  } = useRoomsMainStore();
  const { isOnlineById, members: membersOnline } = useOnlineMembersStore();
  const listSentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: roomsData, isPending: isRoomsPending } = useRoomPageQuery(
    page,
    ROOM_LIST_LIMIT,
    firstTimestampRenderRooms,
  );

  const [isOnlineById_Trigger, setIsOnlineById_Trigger] = useState(false);

  useEffect(() => {
    if (roomsData) fetchNextRooms(roomsData);
  }, [roomsData]);

  useEffect(() => {
    const node = listSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void nextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rooms]);

  const activeRoom = useMemo(
    () => (activeRoomId ? (rooms.find((room) => room._id === activeRoomId) ?? null) : null),
    [activeRoomId, rooms],
  );

  useEffect(() => {
    setIsOnlineById_Trigger((prev) => !prev);
  }, [membersOnline]);

  return (
    <main className="w-full h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 text-white">
      <section className="mx-auto flex h-full w-full max-w-[1200px]">
        <aside className="w-full border-r border-white/10 md:w-[380px] flex flex-col">
          <header className="border-b border-white/10 px-6 py-4">
            <h1 className="text-base font-semibold">Omong Rooms</h1>
            <p className="text-xs text-slate-300">{user?.nama}</p>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {isRoomsPending && page === 1 && (
              <p className="text-sm text-slate-300">Loading rooms...</p>
            )}

            <div className="space-y-2">
              {rooms.map((room) => {
                const privateFriend =
                  room.tipe === "private"
                    ? room.anggota.find((anggota) => anggota._id !== user?.id)
                    : null;
                const isOnline = privateFriend ? isOnlineById(privateFriend._id) : false;
                const typingNames = (room.typing ?? []).filter((name) => name !== user?.nama);
                const typingLabel =
                  typingNames.length > 1
                    ? `${typingNames.length} people are typing...`
                    : typingNames[0]
                      ? `${typingNames[0]} is typing...`
                      : null;

                return (
                  <button
                    key={room._id}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      activeRoomId === room._id
                        ? "border-cyan-300/70 bg-cyan-400/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => setActiveRoomId(room._id)}
                  >
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600/50 text-sm font-bold">
                      {room.nama.slice(0, 2).toUpperCase()}
                      {room.tipe === "private" && isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{room.nama}</p>
                      {typingLabel ? (
                        <p className="truncate text-xs text-cyan-300">{typingLabel}</p>
                      ) : (
                        <p className="truncate text-xs text-slate-300">
                          {room.lastchat?.pesan ?? "No messages yet"}
                        </p>
                      )}
                    </div>

                    {room.unread > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-pink-400 px-1.5 text-[10px] font-semibold text-slate-900">
                        {room.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {rooms.length > 0 && rooms.length < totalRooms && (
              <div ref={listSentinelRef} className="py-2">
                {isRoomsPending && page > 1 && (
                  <p className="text-xs text-slate-300">Loading more rooms...</p>
                )}
              </div>
            )}
          </div>

          <BottomNav />
        </aside>

        <section className="hidden flex-1 flex-col md:flex">
          {activeRoom ? (
            <RoomDetailPage
              embedded
              onExitRoom={() => setActiveRoomId(null)}
              roomDetailData={activeRoom}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-300">Select a room to open chat.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
