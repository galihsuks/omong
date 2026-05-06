import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { RoomMembersModal } from "@/components/chat/RoomMembersModal";
import { BottomNav } from "@/components/common/BottomNav";
import { TopBar } from "@/components/common/TopBar";
import { useRoomDetailQuery } from "@/hooks/useRooms";
import {
  useAddChatMutation,
  useDeleteChatMutation,
  useSeenRoomMutation,
} from "@/hooks/useChatMutations";
import { useAuthStore } from "@/store/auth.store";
import { useWsStore } from "@/store/ws.store";
import type { Chat, WsPayload } from "@/types/domain";

export function RoomDetailPage() {
  const { id } = useParams();
  const roomId = id ?? "";
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { connect, subscribe, unsubscribe, send } = useWsStore();

  const [message, setMessage] = useState("");
  const [replyTarget, setReplyTarget] = useState<Chat | null>(null);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const {
    data: roomDetailData,
    isPending: isRoomPending,
    error: roomError,
  } = useRoomDetailQuery(roomId);
  const { mutate: addChat, isPending: isAddChatPending } = useAddChatMutation(roomId);
  const { mutate: deleteChat } = useDeleteChatMutation();
  const { mutate: markRoomSeen } = useSeenRoomMutation(roomId);

  useEffect(() => {
    if (!roomId) return;
    connect();

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
  }, [connect, queryClient, roomId, subscribe, unsubscribe, user?.nama]);

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
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !user?.nama) return;

    if (message.trim()) {
      send(roomId, {
        event: "typing",
        roomId,
        userName: user.nama,
        status: true,
      });

      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        send(roomId, {
          event: "typing",
          roomId,
          userName: user.nama,
          status: false,
        });
      }, 2000);
    } else {
      send(roomId, {
        event: "typing",
        roomId,
        userName: user.nama,
        status: false,
      });
    }
  }, [message, roomId, send, user?.nama]);

  const chats = useMemo(() => roomDetailData?.chats ?? [], [roomDetailData?.chats]);

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

          send(roomId, {
            event: "chat",
            action: "add",
            roomId,
            chat,
          });

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

        send(roomId, {
          event: "chat",
          action: "delete",
          roomId,
          chatId,
        });
      },
    });
  };

  const typingLabel =
    typingNames.length > 1
      ? `${typingNames.length} people typing`
      : typingNames[0]
        ? `${typingNames[0]} typing`
        : "";

  return (
    <main className="min-h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 px-4 py-5 text-white">
      <section className="mx-auto flex min-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
        <TopBar
          title={roomDetailData?.nama ?? "Room"}
          subtitle={roomDetailData?.tipe ?? ""}
          right={
            <div className="flex gap-2">
              <Link to="/rooms" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                <ArrowLeft size={16} />
              </Link>
              <button
                className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
                onClick={() => setShowMembers(true)}
              >
                <Users size={16} />
              </button>
            </div>
          }
        />

        <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {isRoomPending && <p className="text-sm text-slate-200">Loading...</p>}
          {roomError && <p className="text-sm text-rose-300">{(roomError as Error).message}</p>}

          {chats.map((chat) => (
            <ChatBubble
              key={chat._id}
              chat={chat}
              isMine={chat.idPengirim._id === user?.id}
              onReply={setReplyTarget}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div
          className={`px-4 text-[11px] text-slate-200 transition-all ${typingLabel ? "max-h-6 py-1" : "max-h-0 py-0"}`}
        >
          {typingLabel}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/10 px-3 py-3">
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

          <div className="flex items-center gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-400"
              placeholder="Write a message"
            />
            <button
              type="submit"
              disabled={isAddChatPending}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </form>

        <BottomNav />
      </section>

      {roomDetailData && (
        <RoomMembersModal
          room={roomDetailData}
          open={showMembers}
          onClose={() => setShowMembers(false)}
        />
      )}
    </main>
  );
}
