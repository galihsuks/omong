import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Users, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { useWsStore } from "@/store/ws.store";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { RoomListItem } from "@/components/rooms/RoomListItem";
import { BottomNav } from "@/components/common/BottomNav";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { InputField } from "@/components/forms/InputField";
import { SearchSelect, type SelectOption } from "@/components/forms/SearchSelect";
import { useCreateRoomMutation, useRoomsQuery, useUserSearchQuery } from "@/hooks/useRooms";
import { useMyProfileQuery } from "@/hooks/useUser";
import type { Room, WsPayload } from "@/types/domain";
import { showToast } from "@/store/toast.store";

export function RoomsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { connect, subscribe, unsubscribe, sendOnline } = useWsStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(searchKeyword, 400);

  const {
    data: roomsData,
    isPending: isRoomsPending,
    error: roomsError,
  } = useRoomsQuery(debouncedKeyword);
  const { data: profileData } = useMyProfileQuery();
  const { mutate: createRoom, isPending: isCreateRoomPending } = useCreateRoomMutation();

  const [typingByRoom, setTypingByRoom] = useState<Record<string, string[]>>({});
  const [showCreate, setShowCreate] = useState(false);

  const [createForm, setCreateForm] = useState({
    tipe: "group" as "group" | "private",
    nama: "",
    keyword: "",
    selectedEmails: [] as string[],
    selectedEmailValue: "",
  });
  const debouncedCreateMemberKeyword = useDebouncedValue(createForm.keyword, 400);
  const { data: searchUsersData, isPending: isSearchUsersPending } = useUserSearchQuery(
    "email",
    debouncedCreateMemberKeyword,
  );

  useEffect(() => {
    if (!isSearchOpen) return;
    const id = window.setTimeout(() => searchInputRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setSearchKeyword("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSearchOpen]);
  const memberOptions = useMemo<SelectOption[]>(
    () =>
      (searchUsersData ?? []).map((userData) => ({
        label: userData.nama,
        value: userData.email,
        meta: userData.email,
      })),
    [searchUsersData],
  );

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
          queryClient.setQueryData(["rooms", debouncedKeyword ?? ""], (old: Room[] | undefined) => {
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
      };

      handlers.push({ roomId: room._id, handler });
      subscribe(room._id, handler);
    });

    return () => {
      handlers.forEach(({ roomId, handler }) => unsubscribe(roomId, handler));
    };
  }, [roomsData, queryClient, subscribe, unsubscribe, user?.id, debouncedKeyword]);

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
        setCreateForm({
          tipe: "group",
          nama: "",
          keyword: "",
          selectedEmails: [],
          selectedEmailValue: "",
        });
        showToast("success", "Room created successfully.");
      },
      onError: (error) => showToast("error", (error as Error).message),
    });
  };

  return (
    <main className="h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 text-white">
      <section className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <header className="px-6 pt-4">
          <div className="w-full pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold text-white">Omong Rooms</h1>
                <p className="text-xs text-slate-300">{user?.nama}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-lg bg-white/10 p-2 text-slate-100 hover:bg-white/20"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus size={16} />
                </button>
                {!isSearchOpen && (
                  <button
                    className="rounded-lg bg-white/10 p-2 text-slate-100 hover:bg-white/20"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search size={16} />
                  </button>
                )}
              </div>
            </div>
            {isSearchOpen && (
              <div className="flex items-center gap-2 pt-3 mt-4 border-t border-white/10">
                <InputField
                  ref={searchInputRef}
                  leftIcon={<Search size={16} />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search rooms..."
                />
                <button
                  className="rounded-lg bg-white/10 p-2 text-slate-100 hover:bg-white/20"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchKeyword("");
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto py-3 px-6">
          {isRoomsPending && <p className="text-sm text-slate-200">Loading rooms...</p>}
          {roomsError && <p className="text-sm text-rose-300">{(roomsError as Error).message}</p>}

          <div className="space-y-2">
            {mergedRooms.map((room) => (
              <RoomListItem
                key={room._id}
                room={room}
                currentUserId={user?.id ?? ""}
                timeZone={profileData?.timezone}
              />
            ))}
          </div>
        </div>

        <BottomNav />
      </section>

      <ModalTemplate
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Room"
        maxWidthClassName="max-w-lg"
      >
        <div className="space-y-3">
          <SearchSelect
            label="Room Type"
            leftIcon={<Users size={16} />}
            value={createForm.tipe}
            options={[
              { label: "Group", value: "group" },
              { label: "Private", value: "private" },
            ]}
            onChange={(nextType) =>
              setCreateForm((prev) => ({ ...prev, tipe: nextType as "group" | "private" }))
            }
            searchValue=""
            onSearchChange={() => undefined}
            searchPlaceholder="Room type"
            emptyText=""
            loading={false}
          />

          {createForm.tipe === "group" && (
            <InputField
              label="Room Name"
              leftIcon={<Pencil size={16} />}
              value={createForm.nama}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, nama: event.target.value }))}
              placeholder="Room name"
            />
          )}

          <SearchSelect
            label="Invite Member"
            leftIcon={<Search size={16} />}
            value={createForm.selectedEmailValue}
            options={memberOptions}
            onChange={(selectedEmail) => {
              setCreateForm((prev) => ({
                ...prev,
                selectedEmailValue: selectedEmail,
                selectedEmails: prev.selectedEmails.includes(selectedEmail)
                  ? prev.selectedEmails
                  : [...prev.selectedEmails, selectedEmail],
              }));
            }}
            searchValue={createForm.keyword}
            onSearchChange={(keyword) => setCreateForm((prev) => ({ ...prev, keyword }))}
            searchPlaceholder="Type email keyword"
            emptyText="No users"
            loading={isSearchUsersPending}
          />

          <div className="flex flex-wrap gap-1">
            {createForm.selectedEmails.map((email) => (
              <button
                key={email}
                className="rounded-full bg-cyan-300/20 px-2 py-0.5 text-[11px]"
                onClick={() =>
                  setCreateForm((prev) => ({
                    ...prev,
                    selectedEmails: prev.selectedEmails.filter((item) => item !== email),
                  }))
                }
              >
                {email}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="rounded bg-white/10 px-3 py-1 text-xs"
              onClick={() => setShowCreate(false)}
            >
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
      </ModalTemplate>
    </main>
  );
}
