import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, UserPlus, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { useWsStore } from "@/store/ws.store";
import { RoomListItem } from "@/components/rooms/RoomListItem";
import { BottomNav } from "@/components/common/BottomNav";
import { TopBar } from "@/components/common/TopBar";
import {
  useCreateRoomMutation,
  useExitRoomMutation,
  useJoinRoomMutation,
  useRoomsQuery,
  useUpdateRoomMutation,
  useUserSearchQuery,
} from "@/hooks/useRooms";
import type { Room, WsPayload } from "@/types/domain";

export function RoomsPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { connect, subscribe, unsubscribe, sendOnline } = useWsStore();

  const { data: roomsData, isPending: isRoomsPending, error: roomsError } = useRoomsQuery();
  const { mutate: createRoom, isPending: isCreateRoomPending } = useCreateRoomMutation();
  const { mutate: updateRoomName } = useUpdateRoomMutation();
  const { mutate: joinRoom } = useJoinRoomMutation();
  const { mutate: exitRoom } = useExitRoomMutation();

  const [typingByRoom, setTypingByRoom] = useState<Record<string, string[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [createForm, setCreateForm] = useState({
    tipe: "group" as "group" | "private",
    nama: "",
    keyword: "",
    selectedEmails: [] as string[],
  });
  const [editName, setEditName] = useState("");

  const { data: searchUsersData } = useUserSearchQuery("email", createForm.keyword);

  useEffect(() => {
    connect();
    if (user?.id) sendOnline(user.id);
  }, [connect, sendOnline, user?.id]);

  useEffect(() => {
    if (!roomsData?.length) return;

    const handlers: Array<{ roomId: string; handler: (payload: unknown) => void }> = [];

    roomsData.forEach((room) => {
      const handler = (payload: unknown) => {
        const data = payload as WsPayload;

        if (data.event === "typing" && data.roomId === room._id) {
          setTypingByRoom((prev) => {
            const current = prev[room._id] ?? [];
            const next = data.status
              ? current.includes(data.userName)
                ? current
                : [...current, data.userName]
              : current.filter((name) => name !== data.userName);
            return { ...prev, [room._id]: next };
          });
          return;
        }

        if (data.event === "chat" && data.roomId === room._id) {
          queryClient.setQueryData(["rooms"], (old: Room[] | undefined) => {
            if (!old) return old;
            return old.map((r) => {
              if (r._id !== room._id) return r;

              if (data.action === "add") {
                const unreadInc = data.chat.idPengirim._id === user?.id ? 0 : 1;
                return {
                  ...r,
                  lastchat: data.chat,
                  chatsUnread: (r.chatsUnread ?? 0) + unreadInc,
                };
              }

              if (data.action === "delete") {
                return {
                  ...r,
                  chatsUnread: Math.max((r.chatsUnread ?? 0) - 1, 0),
                };
              }

              return r;
            });
          });
          return;
        }

        if (data.event === "room") {
          if (data.action === "add") {
            queryClient.setQueryData(["rooms"], (old: Room[] | undefined) =>
              old ? [data.room, ...old.filter((r) => r._id !== data.room._id)] : [data.room],
            );
          } else if (data.action === "update") {
            queryClient.setQueryData(["rooms"], (old: Room[] | undefined) =>
              old?.map((r) => (r._id === data.room._id ? { ...r, ...data.room } : r)),
            );
          } else if (data.action === "delete") {
            queryClient.setQueryData(["rooms"], (old: Room[] | undefined) =>
              old?.filter((r) => r._id !== data.room._id),
            );
          }
        }
      };

      handlers.push({ roomId: room._id, handler });
      subscribe(room._id, handler);
    });

    return () => {
      handlers.forEach(({ roomId, handler }) => unsubscribe(roomId, handler));
    };
  }, [roomsData, queryClient, subscribe, unsubscribe, user?.id]);

  const mergedRooms = useMemo(
    () =>
      (roomsData ?? []).map((room) => ({
        ...room,
        typingNames: typingByRoom[room._id] ?? [],
      })),
    [roomsData, typingByRoom],
  );

  const handleCreateRoom = () => {
    const payload = {
      tipe: createForm.tipe,
      nama: createForm.tipe === "group" ? createForm.nama : undefined,
      anggota: createForm.selectedEmails,
    };

    createRoom(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        setShowCreate(false);
        setCreateForm({ tipe: "group", nama: "", keyword: "", selectedEmails: [] });
      },
    });
  };

  const handleUpdateRoom = () => {
    if (!selectedRoomId || !editName.trim()) return;
    updateRoomName(
      { roomId: selectedRoomId, nama: editName },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
          setShowEdit(false);
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 px-4 py-5 text-white">
      <section className="mx-auto flex min-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
        <TopBar
          title="Omong Rooms"
          subtitle={user?.nama}
          right={
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-white/10 p-2 text-slate-100 hover:bg-white/20"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={16} />
              </button>
              <button
                className="rounded-lg bg-white/10 p-2 text-slate-100 hover:bg-white/20"
                onClick={logout}
              >
                <LogOut size={16} />
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-3">
          {isRoomsPending && <p className="text-sm text-slate-200">Loading rooms...</p>}
          {roomsError && <p className="text-sm text-rose-300">{(roomsError as Error).message}</p>}

          <div className="space-y-2">
            {mergedRooms.map((room) => (
              <div key={room._id}>
                <RoomListItem room={room} currentUserId={user?.id ?? ""} />
                <div className="mt-1 flex gap-3 pl-1 text-[11px] text-slate-300">
                  {room.tipe === "group" && (
                    <button
                      onClick={() => {
                        setSelectedRoomId(room._id);
                        setEditName(room.nama ?? "");
                        setShowEdit(true);
                      }}
                      className="inline-flex items-center gap-1 hover:text-white"
                    >
                      <Pencil size={12} /> edit
                    </button>
                  )}
                  <button
                    onClick={() =>
                      joinRoom(room._id, {
                        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
                      })
                    }
                    className="inline-flex items-center gap-1 hover:text-white"
                  >
                    <UserPlus size={12} /> join
                  </button>
                  <button
                    onClick={() =>
                      exitRoom(room._id, {
                        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
                      })
                    }
                    className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200"
                  >
                    <LogOut size={12} /> exit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/20 bg-slate-900 p-4">
            <h2 className="mb-3 text-base font-semibold">Create Room</h2>
            <div className="space-y-3">
              <select
                value={createForm.tipe}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, tipe: e.target.value as "group" | "private" }))
                }
                className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="group">Group</option>
                <option value="private">Private</option>
              </select>

              {createForm.tipe === "group" && (
                <input
                  value={createForm.nama}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, nama: e.target.value }))}
                  className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm"
                  placeholder="Room name"
                />
              )}

              <input
                value={createForm.keyword}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, keyword: e.target.value }))}
                className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm"
                placeholder="Search member by email"
              />

              <div className="max-h-28 overflow-y-auto rounded-lg border border-white/10 p-2">
                {(searchUsersData ?? []).map((u) => (
                  <button
                    key={u._id}
                    onClick={() =>
                      setCreateForm((prev) => ({
                        ...prev,
                        selectedEmails: prev.selectedEmails.includes(u.email)
                          ? prev.selectedEmails
                          : [...prev.selectedEmails, u.email],
                      }))
                    }
                    className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-white/10"
                  >
                    {u.nama} ({u.email})
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {createForm.selectedEmails.map((email) => (
                  <span key={email} className="rounded-full bg-cyan-300/20 px-2 py-0.5 text-[11px]">
                    {email}
                  </span>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button className="rounded bg-white/10 px-3 py-1 text-xs" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button
                  className="rounded bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900 disabled:opacity-60"
                  disabled={isCreateRoomPending || createForm.selectedEmails.length === 0}
                  onClick={handleCreateRoom}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/20 bg-slate-900 p-4">
            <h2 className="mb-3 text-base font-semibold">Edit Room Name</h2>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded bg-white/10 px-3 py-1 text-xs" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
              <button
                className="rounded bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900"
                onClick={handleUpdateRoom}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
