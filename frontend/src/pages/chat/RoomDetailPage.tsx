import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useRoomDetailQuery } from "@/hooks/useRoomDetail";
import { useAddChatMutation, useSeenRoomMutation } from "@/hooks/useChatMutations";
import { useAuthStore } from "@/store/auth.store";
import { useWsStore } from "@/store/ws.store";
import type { Chat } from "@/types/domain";

export function RoomDetailPage() {
  const { id } = useParams();
  const roomId = id ?? "";
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [pesan, setPesan] = useState("");
  const { connect, subscribe, unsubscribe, send } = useWsStore();

  const { data: roomDetailData } = useRoomDetailQuery(roomId);
  const { mutate: addChat, isPending: isAddChatPending } = useAddChatMutation(roomId);
  const { mutate: markRoomSeen } = useSeenRoomMutation(roomId);

  useEffect(() => {
    if (!roomId) return;
    connect();

    const handler = (payload: unknown) => {
      const data = payload as { event?: string; action?: string; chat?: Chat };
      if (data.event === "chat" && data.action === "add" && data.chat) {
        queryClient.setQueryData(["room", roomId], (old: any) => {
          const chats = old?.chats ?? [];
          if (chats.some((chat: Chat) => chat._id === data.chat?._id)) return old;
          return { ...old, chats: [...chats, data.chat] };
        });
      }
    };

    subscribe(roomId, handler);
    return () => unsubscribe(roomId, handler);
  }, [connect, roomId, queryClient, subscribe, unsubscribe]);

  useEffect(() => {
    if (roomId) markRoomSeen();
  }, [roomId, markRoomSeen]);

  const chats = useMemo(() => roomDetailData?.chats ?? [], [roomDetailData?.chats]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!pesan.trim()) return;

    addChat(pesan, {
      onSuccess: (chat) => {
        queryClient.setQueryData(["room", roomId], (old: any) => ({
          ...old,
          chats: [...(old?.chats ?? []), chat],
        }));

        send(roomId, { event: "chat", action: "add", roomId, chat });
        setPesan("");
      },
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-6 text-slate-100">
      <section className="mx-auto max-w-3xl">
        <Link to="/rooms" className="text-cyan-300">Kembali</Link>
        <h1 className="mt-2 text-2xl font-bold">{roomDetailData?.nama ?? "Room"}</h1>

        <div className="my-5 space-y-3">
          {chats.map((chat) => (
            <div key={chat._id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-sm font-semibold text-cyan-300">
                {chat.idPengirim._id === user?.id ? "Saya" : chat.idPengirim.nama}
              </p>
              <p className="text-slate-100">{chat.pesan}</p>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-cyan-500"
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Ketik pesan"
          />
          <button
            className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-300 disabled:opacity-60"
            type="submit"
            disabled={isAddChatPending}
          >
            Kirim
          </button>
        </form>
      </section>
    </main>
  );
}
