import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AddMembersModal } from "@/components/chat/AddMembersModal";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { EditRoomModal } from "@/components/chat/EditRoomModal";
import { ExitRoomConfirmModal } from "@/components/chat/ExitRoomConfirmModal";
import { RoomDetailHeader } from "@/components/chat/RoomDetailHeader";
import { RoomMembersModal } from "@/components/chat/RoomMembersModal";
import { InputField } from "@/components/forms/InputField";
import type { SelectOption } from "@/components/forms/SearchSelect";
import {
  useAddMembersToRoomMutation,
  useExitRoomMutation,
  useRoomMemberCandidatesQuery,
  useUpdateRoomMutation,
} from "@/hooks/useRooms";
import { useMyProfileQuery } from "@/hooks/useUser";
import {
  useAddChatMutation,
  useChatPageQuery,
  useDeleteChatMutation,
  useSeenRoomMutation,
} from "@/hooks/useChatMutations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuthStore } from "@/store/auth.store";
import { showToast } from "@/store/toast.store";
import { useWsStore } from "@/store/ws.store";
import { useOnlineMembersStore } from "@/store/onlineMembers.store";
import type { Chat } from "@/types/domain";
import { formatShortDateTimeByTimeZone } from "@/utils/dateTime";
import { useRoomsMainStore } from "@/store/roomsMain.store";
import { ROOM_CHAT_LIMIT } from "@/config/constants";

type RoomChatItem = {
  totalReadersTarget: number;
  _id: string;
  pesan: string;
  pengirim: { _id: string; email: string; nama: string };
  reply: null | { _id: string; pesan: string; namaPengirim: string };
  isPending: boolean;
  seenUsers: Array<{ timestamp: string; namaUser: string }>;
  createdAt: string;
};

type RoomMainItem = {
  _id: string;
  nama: string;
  tipe: "private" | "group";
  anggota: Array<{ _id: string; email: string; nama: string }>;
  lastchat: null | {
    totalReadersTarget: number;
    _id: string;
    pesan: string;
    namaPengirim: string;
    seenUsers: number;
  };
  updatedAt: string;
  unread: number;
  typing: string[];
  page: number;
  newestTime: string;
  totalChats?: number;
  chats?: RoomChatItem[];
};

type RoomDetailPageProps = {
  embedded?: boolean;
  onExitRoom?: () => void;
  roomDetailData: RoomMainItem;
};

export function RoomDetailPage({
  embedded = false,
  onExitRoom,
  roomDetailData,
}: RoomDetailPageProps) {
  const roomId = roomDetailData._id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { fetchRoomChatsPage, nextPage, handleRealtimePayload } = useRoomsMainStore();
  const { connect, send, sendOnline } = useWsStore();
  const { isOnlineById, getLastSeenById, members } = useOnlineMembersStore();

  const [message, setMessage] = useState("");
  const [replyTarget, setReplyTarget] = useState<Chat | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberKeyword, setMemberKeyword] = useState("");
  const debouncedMemberKeyword = useDebouncedValue(memberKeyword, 400);
  const [selectedMembers, setSelectedMembers] = useState<Array<{ nama: string; email: string }>>(
    [],
  );
  const [selectedMemberValue, setSelectedMemberValue] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const listSentinelRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const mySelfTyping = useRef(false);

  const { data: chatsData, isPending: isChatsPending } = useChatPageQuery(
    roomId,
    roomDetailData.page,
    ROOM_CHAT_LIMIT,
    roomDetailData.newestTime,
  );
  const { mutate: addChat, isPending: isAddChatPending } = useAddChatMutation(roomId);
  const { mutate: deleteChat } = useDeleteChatMutation();
  const { mutate: markRoomSeen } = useSeenRoomMutation(roomId);
  const { mutate: addMembersToRoom, isPending: isAddMembersPending } =
    useAddMembersToRoomMutation();
  const { data: profileData } = useMyProfileQuery();
  const { mutate: exitRoom, isPending: isExitPending } = useExitRoomMutation();
  const { mutate: updateRoomName, isPending: isUpdatePending } = useUpdateRoomMutation();
  const { data: searchUsersData, isPending: isSearchUsersPending } = useRoomMemberCandidatesQuery(
    roomId,
    debouncedMemberKeyword,
  );

  useEffect(() => {
    if (chatsData) fetchRoomChatsPage(roomId, chatsData);
  }, [chatsData]);

  useEffect(() => {
    if (!roomId) return;
    connect();
    if (user?.id) sendOnline(user.id);
  }, [connect, roomId, sendOnline, user?.id]);

  useEffect(() => {
    if (!roomId) return;
    markRoomSeen(undefined, {
      onSuccess: (result) => {
        handleRealtimePayload(
          roomId,
          {
            event: "chat",
            action: "seen",
            roomId,
            chatIds: result.chats,
            seenUser: result.addToSeenUsers,
          },
          user?.nama,
        );
        send(roomId, {
          event: "chat",
          action: "seen",
          roomId,
          chatIds: result.chats,
          seenUser: result.addToSeenUsers,
        });
      },
    });
  }, [handleRealtimePayload, markRoomSeen, roomId, send, user?.nama]);

  useEffect(() => {
    if (!roomId || !user?.nama) return;
    if (message) {
      if (mySelfTyping.current) return;
      mySelfTyping.current = true;
      send(roomId, { event: "typing", roomId, userName: user.nama, status: true });
    } else {
      mySelfTyping.current = false;
      send(roomId, { event: "typing", roomId, userName: user.nama, status: false });
    }
  }, [message, roomId, send, user?.nama]);

  const chats = useMemo(() => roomDetailData?.chats ?? [], [roomDetailData?.chats]);
  const totalChats = useMemo(() => roomDetailData?.totalChats ?? 0, [roomDetailData?.totalChats]);

  const roomDisplayName = useMemo(() => {
    if (!roomDetailData) return "Room";
    if (roomDetailData.tipe !== "private") return roomDetailData.nama ?? "Room";

    const friend = roomDetailData.anggota.find((anggota) => anggota._id !== user?.id);
    return friend?.nama ?? roomDetailData.nama ?? "Private Room";
  }, [roomDetailData, user?.id]);

  const roomSubtitle = useMemo(() => {
    if (!roomDetailData) return "";

    if (roomDetailData.tipe !== "private") {
      return `${roomDetailData.anggota.length} members`;
    }

    const friend = roomDetailData.anggota.find((anggota) => anggota._id !== user?.id);
    if (!friend) return "Private chat";

    if (isOnlineById(friend._id)) return "Online";

    const friendLastSeen = getLastSeenById(friend._id);
    if (friendLastSeen) {
      const last = new Date(friendLastSeen);
      const formatted = Number.isNaN(last.getTime())
        ? "recently"
        : formatShortDateTimeByTimeZone(friendLastSeen, profileData?.timezone);
      return `Last seen ${formatted}`;
    }

    return "Offline";
  }, [getLastSeenById, isOnlineById, profileData?.timezone, roomDetailData, user?.id, members]);

  const memberOptions = useMemo<SelectOption[]>(() => {
    return (searchUsersData ?? []).map((nextUser) => ({
      label: nextUser.nama,
      value: nextUser.email,
      meta: nextUser.email,
    }));
  }, [searchUsersData]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const threshold = 24;
    const updateAutoScrollFlag = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom <= threshold;
    };

    updateAutoScrollFlag();
    container.addEventListener("scroll", updateAutoScrollFlag);
    return () => container.removeEventListener("scroll", updateAutoScrollFlag);
  }, [roomId]);

  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    if (!shouldAutoScrollRef.current) return;
    container.scrollTop = container.scrollHeight;
  }, [roomId, chats.length]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (event.target instanceof Node && menuRef.current.contains(event.target)) return;
      setShowMenu(false);
    };

    if (showMenu) window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [showMenu]);

  useEffect(() => {
    const node = listSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void nextPage(roomId);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [roomDetailData.chats]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;

    addChat(
      { pesan: text, idChatReply: replyTarget?._id ?? null },
      {
        onSuccess: (chat) => {
          console.log(chat);
          console.log(user);
          handleRealtimePayload(roomId, { event: "chat", action: "add", roomId, chat }, user?.nama);

          send(roomId, { event: "typing", roomId, userName: user?.nama, status: false });
          send(roomId, { event: "chat", action: "add", roomId, chat });

          setMessage("");
          setReplyTarget(null);
        },
      },
    );
  };

  const handleDelete = (chatId: string) => {
    deleteChat(chatId, {
      onSuccess: () => {
        handleRealtimePayload(roomId, { event: "chat", action: "delete", roomId, chatId });

        send(roomId, { event: "chat", action: "delete", roomId, chatId });
      },
    });
  };

  const handleSaveRoomName = () => {
    const nextName = editName.trim();
    if (!nextName) return;

    updateRoomName(
      { roomId, nama: nextName },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
          queryClient.invalidateQueries({ queryKey: ["room", roomId] });
          setShowEdit(false);
          showToast("success", "Room updated successfully.");
        },
        onError: (error) => showToast("error", (error as Error).message),
      },
    );
  };

  const handleExitRoom = () => {
    exitRoom(roomId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        showToast("warning", "You left the room.");
        if (onExitRoom) {
          onExitRoom();
        } else {
          navigate("/rooms", { replace: true });
        }
      },
      onError: (error) => showToast("error", (error as Error).message),
    });
  };

  const handleOpenEditRoom = () => {
    if (roomDetailData?.tipe === "private") {
      showToast("warning", "Private room cannot be edited.");
      setShowMenu(false);
      return;
    }

    setEditName(roomDetailData?.nama ?? "");
    setShowEdit(true);
    setShowMenu(false);
  };

  const handleOpenAddMembers = () => {
    if (roomDetailData?.tipe === "private") {
      showToast("warning", "Private room cannot add members.");
      setShowMenu(false);
      return;
    }

    setShowAddMembers(true);
    setShowMenu(false);
  };

  const handleCloseAddMembers = () => {
    setShowAddMembers(false);
    setMemberKeyword("");
    setSelectedMemberValue("");
    setSelectedMembers([]);
  };

  const handleSelectMember = (selectedEmail: string) => {
    const selectedUser = (searchUsersData ?? []).find(
      (userData) => userData.email === selectedEmail,
    );
    if (!selectedUser) return;
    setSelectedMemberValue(selectedEmail);
    setSelectedMembers((prev) =>
      prev.some((member) => member.email === selectedEmail)
        ? prev
        : [...prev, { nama: selectedUser.nama, email: selectedUser.email }],
    );
  };

  const handleAddMembers = () => {
    if (!selectedMembers.length) return;

    addMembersToRoom(
      { roomId, anggota: selectedMembers.map((member) => member.email) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
          queryClient.invalidateQueries({ queryKey: ["room", roomId] });
          handleCloseAddMembers();
          showToast("success", "Members added successfully.");
        },
        onError: (error) => showToast("error", (error as Error).message),
      },
    );
  };

  const handleReply = (nextReplyTarget: Chat) => {
    setReplyTarget(nextReplyTarget);
    window.setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  const typingNames = roomDetailData.typing.filter((name) => name !== user?.nama);
  const typingLabel =
    typingNames.length > 1
      ? `${typingNames.length} people typing`
      : typingNames[0]
        ? `${typingNames[0]} typing`
        : "";

  return (
    <main
      className={`${embedded ? "h-full" : "h-screen"} bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 text-white`}
    >
      <section
        className={`${embedded ? "h-full w-full" : "mx-auto h-full w-ful max-w-3xl"} flex flex-col`}
      >
        <RoomDetailHeader
          title={roomDisplayName}
          subtitle={roomSubtitle}
          isPrivate={roomDetailData?.tipe === "private"}
          showMenu={showMenu}
          menuRef={menuRef}
          isExitPending={isExitPending}
          onToggleMenu={() => setShowMenu((prev) => !prev)}
          onOpenMembers={() => {
            setShowMembers(true);
            setShowMenu(false);
          }}
          onOpenEdit={handleOpenEditRoom}
          onOpenAddMembers={handleOpenAddMembers}
          onOpenExitConfirm={() => {
            setShowExitConfirm(true);
            setShowMenu(false);
          }}
        />

        <div ref={chatContainerRef} className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
          {chats.length > 0 && chats.length < totalChats && (
            <div ref={listSentinelRef} className="py-2">
              {isChatsPending && roomDetailData.page > 1 && (
                <p className="text-xs text-slate-300">Loading more chats...</p>
              )}
            </div>
          )}
          {chats.map((chat) => (
            <ChatBubble
              key={chat._id}
              chat={chat}
              isMine={chat.pengirim._id === user?.id}
              currentUserName={user?.nama}
              timeZone={profileData?.timezone}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div
          className={`px-4 text-[11px] text-slate-200 transition-all ${typingLabel ? "max-h-6 py-1" : "max-h-0 py-0"}`}
        >
          {typingLabel}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-4">
          <div className="border-t border-white/10 pt-4">
            {replyTarget && (
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="mb-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left"
              >
                <p className="text-[10px] text-pink-300">Reply to {replyTarget.pengirim.nama}</p>
                <p className="truncate text-xs text-slate-200">{replyTarget.pesan}</p>
                <p className="mt-1 text-[10px] text-slate-400">Tap to remove</p>
              </button>
            )}

            <div className="flex items-end gap-2">
              <InputField
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message"
              />
              <button
                type="submit"
                disabled={isAddChatPending}
                className="rounded-full bg-cyan-400 p-2.5 text-slate-900 disabled:opacity-60"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
      </section>

      {roomDetailData && (
        <RoomMembersModal
          room={roomDetailData}
          open={showMembers}
          onClose={() => setShowMembers(false)}
        />
      )}

      <EditRoomModal
        open={showEdit}
        value={editName}
        isPending={isUpdatePending}
        onChange={setEditName}
        onClose={() => setShowEdit(false)}
        onSave={handleSaveRoomName}
      />

      <AddMembersModal
        open={showAddMembers}
        selectedMemberValue={selectedMemberValue}
        searchKeyword={memberKeyword}
        memberOptions={memberOptions}
        selectedMembers={selectedMembers}
        isSearchPending={isSearchUsersPending}
        isAddPending={isAddMembersPending}
        onChangeSearchKeyword={setMemberKeyword}
        onSelectMember={handleSelectMember}
        onRemoveMember={(email) =>
          setSelectedMembers((prev) => prev.filter((item) => item.email !== email))
        }
        onClose={handleCloseAddMembers}
        onAdd={handleAddMembers}
      />

      <ExitRoomConfirmModal
        open={showExitConfirm}
        isPending={isExitPending}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleExitRoom}
      />
    </main>
  );
}
