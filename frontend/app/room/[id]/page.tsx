"use client";

import Link from "next/link";
import NavbarAtasRoom from "@/app/components/NavbarAtasRoom";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";
import { useWsStore } from "@/store/wsStore";
import ItemChat from "./ItemChat";

interface IUser {
    _id: string;
    nama: string;
    email: string;
}

interface ISeenUsers {
    timestamp: string;
    user: IUser;
    _id: string;
}

interface IChat {
    createdAt: string;
    idChatReply: null | {
        id: string;
        pesan: string;
        idPengirim: {
            nama: string;
        };
    };
    idPengirim: IUser;
    pesan: string;
    seenUsers: ISeenUsers[];
    updatedAt: string;
    _id: string;
}

interface Anggota {
    nama: string;
    email: string;
    online: {
        last: string;
        status: boolean;
    };
    _id: string;
}

interface IRoom {
    nama: string;
    tipe: string;
    _id: string;
    anggota: Anggota[];
    chats: IChat[];
}
export default function Chat({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [eror, setEror] = useState("");
    const [formAddChat, setFormAddChat] = useState({
        pesan: "",
        idChatReply: {
            id: "",
            pesan: "",
            idPengirim: {
                nama: "",
            },
        },
    });
    const refContainerChat = useRef<HTMLDivElement>(null);
    const [room, setRoom] = useState<IRoom | null>(null);
    const { email, id: idUser, nama, token } = useUserStore();
    const {
        connect,
        typing,
        subscribeRoom,
        unsubscribeRoom,
        isConnected,
        online,
    } = useWsStore();
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const inputChatRef = useRef<HTMLInputElement>(null);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const [mengetik, setMengetik] = useState<string[]>([]);

    const scrollToIndex = (index: number) => {
        const target = itemRefs.current[index];
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        if (!email) {
            return router.replace("/");
        }
        async function fetchDataRoom() {
            const response = await fetch("/api/room/" + params.id);
            const result = await response.json();
            console.log(result);
            if (response.status === 401) {
                return router.replace("/");
            }
            if (response.status === 404) {
                return router.replace("/room");
            }
            if (response.status != 200) {
                return setEror(result.pesan);
            }
            setRoom(result);
            setLoading(false);
        }
        fetchDataRoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleMessage = (data: any) => {
            console.log(`📨 Dapat data dari WS (${params.id}):`, data);
            if (data.tipe === "chat" && room) {
                const datanya = data.data;
                const {
                    action,
                    lastchat,
                    chatsUnread,
                    chats,
                    addToSeenUsers,
                    room_id,
                    chat_id,
                    ...dataWithoutAction
                } = datanya;
                switch (action) {
                    case "add":
                        setRoom({
                            ...room,
                            chats: [...room.chats, dataWithoutAction],
                        });
                        break;
                    case "delete":
                        setRoom({
                            ...room,
                            chats: room.chats.filter((c) => c._id != chat_id),
                        });
                        break;
                    default:
                        break;
                }
            } else if (data.tipe == "typing") {
                const datanya = data.data;
                const { user_nama, room_id, status } = datanya;
                if (status) {
                    setMengetik(
                        mengetik.includes(user_nama)
                            ? mengetik
                            : [...mengetik, user_nama]
                    );
                } else {
                    setMengetik(mengetik.filter((t) => t != user_nama));
                }
            }
        };
        if (room) {
            connect();
            (async () => {
                await fetch("/api/chat/" + params.id);
            })();
            subscribeRoom(params.id, handleMessage);

            if (refContainerChat.current)
                refContainerChat.current.scrollTop =
                    refContainerChat.current?.scrollHeight;
        }
        return () => {
            unsubscribeRoom(params.id, handleMessage);
        };
    }, [room]);

    useEffect(() => {
        if (isConnected && email && idUser && nama && token) {
            online({ email, id: idUser, nama, token });
        }
    }, [isConnected, email, idUser, nama, token]);

    const handleSendMessage = (e: SyntheticEvent) => {
        e.preventDefault();
        inputChatRef.current?.blur();
        if (formAddChat.pesan) {
            (async () => {
                const response = await fetch(`/api/chat/${params.id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        pesan: formAddChat.pesan,
                        idChatReply: formAddChat.idChatReply.id
                            ? formAddChat.idChatReply.id
                            : null,
                    }),
                });
                const result = await response.json();
                if (response.status == 401) {
                    return router.replace("/");
                }
                if (response.status === 404) {
                    return router.replace("/room");
                }
                if (response.status != 200) {
                    return setEror(result.pesan);
                }
                setFormAddChat({
                    pesan: "",
                    idChatReply: {
                        id: "",
                        pesan: "",
                        idPengirim: {
                            nama: "",
                        },
                    },
                });
            })();
        }
    };

    const selectChatReply = (id: string) => {
        const selectedChats = room?.chats.find((e) => e._id == id) as IChat;
        if (selectedChats)
            setFormAddChat({
                ...formAddChat,
                idChatReply: {
                    id: selectedChats._id,
                    pesan: selectedChats.pesan,
                    idPengirim: {
                        nama: selectedChats.idPengirim.nama,
                    },
                },
            });
        inputChatRef.current?.focus();
    };

    useEffect(() => {
        if (nama && room) {
            if (formAddChat.pesan) {
                typing(nama, room._id, true);
                if (typingTimeout.current) clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => {
                    typing(nama, room._id, false);
                }, 2000);
            } else {
                typing(nama, room._id, false);
            }
        }
    }, [formAddChat.pesan]);

    return (
        <>
            <div className="konten">
                {eror && (
                    <div
                        style={{ flex: "1" }}
                        className="p-5 flex justify-center items-center"
                    >
                        {eror}
                    </div>
                )}
                <div style={{ flex: "1" }} className="px-5 pt-5 flex flex-col">
                    <NavbarAtasRoom
                        tipe={room ? room.tipe : "private"}
                        nama={room ? room.nama : "Loading .."}
                        anggota={room ? room.anggota : []}
                        idRoom={params.id}
                    />
                    {loading ? (
                        <div
                            style={{ flex: "1" }}
                            className="p-5 flex justify-center items-center text-white"
                        >
                            Loading ...
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "scroll",
                                    position: "relative",
                                }}
                                ref={refContainerChat}
                                className="hidden-scrollbar"
                            >
                                {idUser && (
                                    <div
                                        className="py-2"
                                        style={{
                                            position: "absolute",
                                            width: "100%",
                                        }}
                                    >
                                        <div className="container-chat px-2 gap-1">
                                            {room?.chats.map(
                                                (chat, ind_chat) => (
                                                    <ItemChat
                                                        key={ind_chat}
                                                        chat={chat}
                                                        index_chat={ind_chat}
                                                        idUser={idUser}
                                                        chatBefore={
                                                            ind_chat == 0
                                                                ? null
                                                                : room.chats[
                                                                      ind_chat -
                                                                          1
                                                                  ]
                                                        }
                                                        handleReply={
                                                            selectChatReply
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div
                    className={`mengetik ${mengetik.length > 0 ? "show" : ""}`}
                >
                    <p
                        className="font-semibold text-center"
                        style={{ fontSize: "10px" }}
                    >
                        {mengetik.length > 1
                            ? `${mengetik.length} orang`
                            : mengetik.join("").split(" ")[0]}{" "}
                        mengetik
                    </p>
                </div>
                <form onSubmit={handleSendMessage}>
                    <div className="px-5 py-3 input-chat">
                        <div
                            className={`px-4 reply ${
                                formAddChat.idChatReply.id
                                    ? "py-3 mb-2 show"
                                    : "py-0 mb-0"
                            }`}
                            style={{
                                backgroundColor: "rgba(0,0,0,0.2)",
                                borderRadius: "1em",
                                width: "100%",
                            }}
                            onClick={() => {
                                setFormAddChat({
                                    ...formAddChat,
                                    idChatReply: {
                                        id: "",
                                        pesan: "",
                                        idPengirim: {
                                            nama: "",
                                        },
                                    },
                                });
                            }}
                        >
                            <p
                                className="text-pink-300 mb-1"
                                style={{ fontSize: "10px" }}
                            >
                                {formAddChat.idChatReply.idPengirim.nama}
                            </p>
                            <div className="pesan pe-2 mb-1">
                                <p className="text-white">
                                    {formAddChat.idChatReply.pesan}
                                </p>
                            </div>
                            <p
                                style={{ fontSize: "10px" }}
                                className="text-indigo-300 text-end"
                            >
                                Tap to remove reply
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <input
                                type="text"
                                onChange={(e) => {
                                    setFormAddChat({
                                        ...formAddChat,
                                        pesan: e.target.value,
                                    });
                                }}
                                disabled={room ? false : true}
                                ref={inputChatRef}
                                value={formAddChat.pesan}
                            />
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md text-sm font-semibold leading-6 text-white shadow-sm hover:text-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <i className="material-icons">send</i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
