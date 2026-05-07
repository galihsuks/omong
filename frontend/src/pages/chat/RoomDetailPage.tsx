import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  useRoomDetailQuery,
  useUpdateRoomMutation,
} from "@/hooks/useRooms";
import { useMyProfileQuery } from "@/hooks/useUser";
import {
  useAddChatMutation,
  useDeleteChatMutation,
  useSeenRoomMutation,
} from "@/hooks/useChatMutations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuthStore } from "@/store/auth.store";
import { showToast } from "@/store/toast.store";
import { useWsStore } from "@/store/ws.store";
import type { Chat, WsPayload } from "@/types/domain";
import { formatShortDateTimeByTimeZone } from "@/utils/dateTime";

export function RoomDetailPage() {
  const { id } = useParams();
  const roomId = id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { connect, subscribe, unsubscribe, send, sendOnline, isUserOnline, onlineClients } =
    useWsStore();

  const [message, setMessage] = useState("");
  const [replyTarget, setReplyTarget] = useState<Chat | null>(null);
  const [typingNames, setTypingNames] = useState<string[]>([]);
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
  const typingTimeoutRef = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: roomDetailData,
    isPending: isRoomPending,
    error: roomError,
  } = useRoomDetailQuery(roomId);
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
    if (!roomId) return;
    connect();
    if (user?.id) sendOnline(user.id);

    const handler = (payload: unknown) => {
      const data = payload as WsPayload;

      if (data.event === "typing" && data.roomId === roomId) {
        if (data.userName === user?.nama) return;
        setTypingNames((prev) => {
          if (data.status) return prev.includes(data.userName) ? prev : [...prev, data.userName];
          return prev.filter((name) => name !== data.userName);
        });
        return;
      }

      if (data.event !== "chat" || data.roomId !== roomId) return;

      if (data.action === "add") {
        queryClient.setQueryData(["room", roomId], (old: any) => {
          const chats = old?.chats ?? [];
          if (chats.some((c: Chat) => c._id === data.chat._id)) return old;
          return { ...old, chats: [...chats, data.chat] };
        });
        return;
      }

      if (data.action === "delete") {
        queryClient.setQueryData(["room", roomId], (old: any) => ({
          ...old,
          chats: (old?.chats ?? []).filter((c: Chat) => c._id !== data.chatId),
        }));
        return;
      }

      if (data.action === "seen") {
        queryClient.setQueryData(["room", roomId], (old: any) => ({
          ...old,
          chats: (old?.chats ?? []).map((chat: Chat) =>
            data.chatIds.includes(chat._id)
              ? {
                  ...chat,
                  seenUsers: [
                    ...chat.seenUsers,
                    {
                      user: data.seenUser.user,
                      timestamp: new Date(data.seenUser.timestamp).toISOString(),
                    },
                  ],
                }
              : chat,
          ),
        }));
      }
    };

    subscribe(roomId, handler);
    return () => unsubscribe(roomId, handler);
  }, [connect, queryClient, roomId, sendOnline, subscribe, unsubscribe, user?.id, user?.nama]);

  useEffect(() => {
    if (!roomId) return;
    markRoomSeen(undefined, {
      onSuccess: (result) => {
        send(roomId, {
          event: "chat",
          action: "seen",
          roomId,
          chatIds: result.chats,
          seenUser: result.addToSeenUsers,
        });
      },
    });
  }, [markRoomSeen, roomId, send]);

  useEffect(() => {
    if (!roomId || !user?.nama) return;

    if (message.trim()) {
      send(roomId, { event: "typing", roomId, userName: user.nama, status: true });

      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        send(roomId, { event: "typing", roomId, userName: user.nama, status: false });
      }, 2000);
    } else {
      send(roomId, { event: "typing", roomId, userName: user.nama, status: false });
    }
  }, [message, roomId, send, user?.nama]);

  const chats = useMemo(() => roomDetailData?.chats ?? [], [roomDetailData?.chats]);

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

    if (isUserOnline(friend._id)) return "Online";

    if (friend.online?.last) {
      const last = new Date(friend.online.last);
      const formatted = Number.isNaN(last.getTime())
        ? "recently"
        : formatShortDateTimeByTimeZone(friend.online.last, profileData?.timezone);
      return `Last seen ${formatted}`;
    }

    return "Offline";
  }, [isUserOnline, profileData?.timezone, roomDetailData, user?.id, onlineClients]);

  const memberOptions = useMemo<SelectOption[]>(() => {
    return (searchUsersData ?? []).map((nextUser) => ({
      label: nextUser.nama,
      value: nextUser.email,
      meta: nextUser.email,
    }));
  }, [searchUsersData]);

  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;

    addChat(
      { pesan: text, idChatReply: replyTarget?._id ?? null },
      {
        onSuccess: (chat) => {
          queryClient.setQueryData(["room", roomId], (old: any) => ({
            ...old,
            chats: [...(old?.chats ?? []), chat],
          }));

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
        queryClient.setQueryData(["room", roomId], (old: any) => ({
          ...old,
          chats: (old?.chats ?? []).filter((c: Chat) => c._id !== chatId),
        }));

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
        navigate("/rooms", { replace: true });
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

  const typingLabel =
    typingNames.length > 1
      ? `${typingNames.length} people typing`
      : typingNames[0]
        ? `${typingNames[0]} typing`
        : "";

  return (
    <main className="h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 text-white">
      <section className="mx-auto flex h-full w-ful max-w-3xl flex-col">
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
          {isRoomPending && <p className="text-sm text-slate-200">Loading...</p>}
          {roomError && <p className="text-sm text-rose-300">{(roomError as Error).message}</p>}

          {chats.map((chat) => (
            <ChatBubble
              key={chat._id}
              chat={chat}
              isMine={chat.idPengirim._id === user?.id}
              currentUserId={user?.id}
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
                <p className="text-[10px] text-pink-300">Reply to {replyTarget.idPengirim.nama}</p>
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
