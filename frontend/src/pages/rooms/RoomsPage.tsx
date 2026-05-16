import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCheck, Plus, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/common/BottomNav";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/forms/Button";
import { InputField } from "@/components/forms/InputField";
import { SearchSelect, type SelectOption } from "@/components/forms/SearchSelect";
import { RoomDetailPage } from "@/pages/chat/RoomDetailPage";
import { useAuthStore } from "@/store/auth.store";
import { useRoomsMainStore } from "@/store/roomsMain.store";
import { useOnlineMembersStore } from "@/store/onlineMembers.store";
import { useWsStore } from "@/store/ws.store";
import { useCreateRoomMutation, useRoomPageQuery, useUserSearchQuery } from "@/hooks/useRooms";
import { ROOM_LIST_LIMIT } from "@/config/constants";
import { showToast } from "@/store/toast.store";
import { formatTimeByTimeZone } from "@/utils/dateTime";
import { useMyProfileQuery } from "@/hooks/useUser";

export function RoomsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { data: profileData } = useMyProfileQuery();
  const { send } = useWsStore();
  const {
    totalRooms,
    rooms,
    page,
    nextPage,
    activeRoomId,
    fetchNextRooms,
    setActiveRoomId,
    firstTimestampRenderRooms,
    upsertRoomFromApi,
  } = useRoomsMainStore();
  const { isOnlineById, members: membersOnline } = useOnlineMembersStore();
  const listSentinelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomType, setRoomType] = useState<"private" | "group">("private");
  const [roomName, setRoomName] = useState("");
  const [memberKeyword, setMemberKeyword] = useState("");
  const [selectedMemberValue, setSelectedMemberValue] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<
    Array<{ _id: string; nama: string; email: string }>
  >([]);
  const { mutate: createRoom, isPending: isCreateRoomPending } = useCreateRoomMutation();
  const { data: userSearchData, isPending: isUserSearchPending } = useUserSearchQuery(
    "nama",
    memberKeyword,
  );

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

  useEffect(() => {
    if (!showSearch) return;
    searchInputRef.current?.focus();
  }, [showSearch]);

  const memberOptions = useMemo<SelectOption[]>(() => {
    return (userSearchData ?? []).map((nextUser) => ({
      label: nextUser.nama,
      value: nextUser.email,
      meta: nextUser.email,
    }));
  }, [userSearchData]);

  const handleCloseCreateRoom = () => {
    setShowCreateRoom(false);
    setRoomType("private");
    setRoomName("");
    setMemberKeyword("");
    setSelectedMemberValue("");
    setSelectedMembers([]);
  };

  const handleSelectMember = (email: string) => {
    const selectedUser = (userSearchData ?? []).find((item) => item.email === email);
    if (!selectedUser) return;
    setSelectedMemberValue(email);
    setSelectedMembers((prev) =>
      prev.some((item) => item.email === email) ? prev : [...prev, selectedUser],
    );
  };

  const handleCreateRoom = () => {
    if (selectedMembers.length < 1) {
      showToast("warning", "Please select at least one member.");
      return;
    }
    if (roomType === "group" && !roomName.trim()) {
      showToast("warning", "Group room name is required.");
      return;
    }

    createRoom(
      {
        tipe: roomType,
        nama: roomType === "group" ? roomName.trim() : undefined,
        anggota: selectedMembers.map((member) => member.email),
      },
      {
        onSuccess: (room) => {
          upsertRoomFromApi(room);
          selectedMembers.forEach((member) => {
            send(`__user__:${member._id}`, {
              event: "room",
              action: "add",
              roomId: room._id,
            });
          });
          queryClient.invalidateQueries({ queryKey: ["rooms-page"] });
          showToast("success", "Room created successfully.");
          handleCloseCreateRoom();
        },
        onError: (error) => showToast("error", (error as Error).message),
      },
    );
  };

  return (
    <main className="w-full h-svh bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 text-white">
      <section className="mx-auto flex h-full w-full max-w-[1200px]">
        <aside
          className={`${activeRoom ? "hidden" : "flex"} w-full flex-col border-r border-white/10 md:flex md:w-[380px]`}
        >
          <header className="border-b border-white/10 px-6 py-4">
            <div className="flex items-start justify-between gap-3">
              {!showSearch ? (
                <div>
                  <h1 className="text-base font-semibold">Omong Rooms</h1>
                  <p className="text-xs text-slate-300">{user?.nama}</p>
                </div>
              ) : (
                <input
                  ref={searchInputRef}
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Search rooms"
                  className="w-full border-b border-white/70 bg-transparent pb-1 text-sm text-white outline-none placeholder:text-slate-300 focus:border-white"
                />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (showSearch) {
                      setShowSearch(false);
                      setSearchKeyword("");
                      return;
                    }
                    setShowSearch(true);
                  }}
                  className="rounded-lg border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10"
                >
                  {showSearch ? <X size={16} /> : <Search size={16} />}
                </button>
                {!showSearch && (
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(true)}
                    className="rounded-lg border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            </div>
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
                      ? `${typingNames[0].trim().split(/\s+/)[0]} is typing...`
                      : null;
                const senderFirstName =
                  room.tipe === "group"
                    ? (room.lastchat?.namaPengirim?.trim().split(/\s+/)[0] ?? "")
                    : "";
                const isMineLastChat =
                  Boolean(user?.nama) && (room.lastchat?.namaPengirim ?? "") === user?.nama;
                const senderLabel = isMineLastChat ? "You" : senderFirstName;
                const lastChatPreview =
                  room.tipe === "group" && senderLabel && room.lastchat?.pesan
                    ? `${senderLabel}: ${room.lastchat.pesan}`
                    : (room.lastchat?.pesan ?? "No messages yet");
                const lastChatTotalReadersTarget = Math.max(
                  Number(room.lastchat?.totalReadersTarget ?? 0),
                  0,
                );
                const lastChatSeenUsers = Math.max(Number(room.lastchat?.seenUsers ?? 0), 0);
                const lastChatOtherSeenUsers = Math.max(lastChatSeenUsers - 1, 0);
                const hasAnyReader = lastChatOtherSeenUsers > 0;
                const hasAllReaders =
                  lastChatTotalReadersTarget > 0 &&
                  lastChatOtherSeenUsers >= lastChatTotalReadersTarget;
                const lastChatTime = room.updatedAt
                  ? formatTimeByTimeZone(room.updatedAt, profileData?.timezone)
                  : "";

                return (
                  <button
                    key={room._id}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      searchKeyword.trim().length > 0 &&
                      !room.nama.toLowerCase().includes(searchKeyword.trim().toLowerCase())
                        ? "hidden"
                        : ""
                    } ${
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
                        <div className="flex items-center gap-1">
                          {isMineLastChat && room.lastchat && (
                            <span className={hasAllReaders ? "text-cyan-300" : "text-white"}>
                              {!hasAnyReader ? <Check size={12} /> : <CheckCheck size={12} />}
                            </span>
                          )}
                          <p className="truncate text-xs text-slate-300">{lastChatPreview}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-[34px] flex-col items-end gap-1">
                      {lastChatTime && (
                        <span className="text-[10px] text-slate-300">{lastChatTime}</span>
                      )}
                      {room.unread > 0 && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-pink-400 px-1.5 text-[10px] font-semibold text-slate-900">
                          {room.unread}
                        </span>
                      )}
                    </div>
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

        <section className={`${activeRoom ? "flex" : "hidden"} flex-1 flex-col md:flex`}>
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

      <ModalTemplate
        open={showCreateRoom}
        onClose={handleCloseCreateRoom}
        title="Create Room"
        maxWidthClassName="max-w-lg"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={roomType === "private" ? "model1" : "model2"}
              className="flex-1"
              onClick={() => setRoomType("private")}
            >
              Private
            </Button>
            <Button
              variant={roomType === "group" ? "model1" : "model2"}
              className="flex-1"
              onClick={() => setRoomType("group")}
            >
              Group
            </Button>
          </div>

          {roomType === "group" && (
            <InputField
              label="Room Name"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Type room name"
            />
          )}

          <SearchSelect
            label="Add Members"
            value={selectedMemberValue}
            options={memberOptions}
            onChange={handleSelectMember}
            searchValue={memberKeyword}
            onSearchChange={setMemberKeyword}
            searchPlaceholder="Search users"
            emptyText="No users found"
            loading={isUserSearchPending}
          />

          {selectedMembers.length > 0 && (
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
              {selectedMembers.map((member) => (
                <div key={member._id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{member.nama}</p>
                    <p className="truncate text-xs text-slate-300">{member.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMembers((prev) => prev.filter((item) => item._id !== member._id))
                    }
                    className="rounded border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="model2" onClick={handleCloseCreateRoom}>
              Cancel
            </Button>
            <Button variant="model1" onClick={handleCreateRoom} disabled={isCreateRoomPending}>
              {isCreateRoomPending ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </div>
      </ModalTemplate>
    </main>
  );
}
