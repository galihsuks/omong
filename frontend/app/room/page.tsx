"use client";

import Link from "next/link";
import NavbarAtas from "../components/NavbarAtas";
import { useEffect, useRef, useState } from "react";
import NavbarBawah from "../components/NavbarBawah";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";
import ItemRoom from "./ItemRoom";
import useRoomsStore from "@/store/roomsStore";
import { useWsStore } from "@/store/wsStore";

type MessageHandler = (data: any) => void;

interface anggota {
    email: string;
    nama: string;
    _id: string;
    online: {
        last: string;
        status: boolean;
    };
}

interface seen {
    timestamp: string;
    user: anggota;
}

interface IChat {
    idChatReply: string | null;
    _id: string;
    pesan: string;
    idPengirim: anggota;
    idRoom: string;
    createdAt: string;
    updatedAt: string;
    seenUsers: seen[];
}

interface IRooms {
    _id: string;
    nama: string;
    tipe: string;
    anggota: anggota[];
    createdAt: string;
    lastchat: IChat | null;
    chats: IChat[];
    chatsUnread: number;
    online: boolean;
}

export default function Room() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [eror, setEror] = useState();
    const { email, id: idUser, nama, token, clearUser } = useUserStore();
    const { rooms, setRooms } = useRoomsStore();
    const {
        connect,
        subscribeRoom,
        unsubscribeRoom,
        isConnected,
        online,
        setMessageHandlerUser,
    } = useWsStore();

    useEffect(() => {
        if (!email) {
            // clearUser();
            return router.replace("/");
        }
        connect();
        (async () => {
            const response = await fetch("/api/room");
            const result = await response.json();
            if (response.status === 401) {
                clearUser();
                return router.replace("/");
            }
            console.log(result);
            setRooms(result);
            setLoading(false);
        })();

        return () => {
            setMessageHandlerUser(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isConnected && email && idUser && nama && token) {
            online({ email, id: idUser, nama, token });
        }
    }, [isConnected, email, idUser, nama, token]);

    useEffect(() => {
        const arrHandleMessage = [] as MessageHandler[];

        rooms.forEach((room) => {
            const handleMessage = (data: any) => {
                console.log(`📨 Dapat data dari WS (${room._id}):`, data);
                if (data.tipe === "chat") {
                    const datanya = data.data;
                    const {
                        action,
                        lastchat,
                        chatsUnread,
                        chats,
                        addToSeenUsers,
                        room_id,
                        ...dataWithoutAction
                    } = datanya;
                    switch (action) {
                        case "add":
                            setRooms(
                                rooms.map((r) => {
                                    if (r._id == room._id) {
                                        return {
                                            ...r,
                                            lastchat: dataWithoutAction,
                                            chatsUnread:
                                                dataWithoutAction.idPengirim
                                                    ._id == idUser
                                                    ? r.chatsUnread
                                                    : r.chatsUnread + 1,
                                        };
                                    } else return r;
                                })
                            );
                            break;
                        case "delete":
                            setRooms(
                                rooms.map((r) => {
                                    if (r._id == room._id) {
                                        return {
                                            ...r,
                                            lastchat,
                                            chatsUnread,
                                        };
                                    } else return r;
                                })
                            );
                            break;
                        case "seen":
                            setRooms(
                                rooms.map((r) => {
                                    if (
                                        r._id == room._id &&
                                        chats.includes(r.lastchat?._id)
                                    ) {
                                        return {
                                            ...r,
                                            lastchat: r.lastchat
                                                ? {
                                                      ...r.lastchat,
                                                      seenUsers: [
                                                          ...r.lastchat
                                                              .seenUsers,
                                                          addToSeenUsers,
                                                      ],
                                                  }
                                                : null,
                                        };
                                    } else return r;
                                })
                            );
                            break;
                        default:
                            break;
                    }
                }
            };
            arrHandleMessage.push(handleMessage);
        });
        rooms.forEach((room, ind_room) => {
            subscribeRoom(room._id, arrHandleMessage[ind_room]);
        });

        const handleMessageUser = (data: any) => {
            if (data.tipe === "room") {
                const datanya = data.data;
                const { action, users_id, ...dataWithoutAction } = datanya;
                switch (action) {
                    case "add":
                        setRooms([
                            {
                                ...dataWithoutAction,
                                nama:
                                    dataWithoutAction.tipe == "private"
                                        ? dataWithoutAction.anggota.filter(
                                              (a: anggota) => a._id != idUser
                                          )[0].nama
                                        : dataWithoutAction.nama,
                                online:
                                    dataWithoutAction.tipe == "private"
                                        ? dataWithoutAction.anggota.filter(
                                              (a: anggota) => a._id != idUser
                                          )[0].online.status
                                        : false,
                            },
                            ...rooms,
                        ]);
                        break;
                    case "delete": {
                        setRooms(
                            rooms.filter((r) => r._id != dataWithoutAction._id)
                        );
                        break;
                    }
                    default:
                        break;
                }
            }
        };
        setMessageHandlerUser(handleMessageUser);

        return () => {
            rooms.forEach((room, ind_room) => {
                unsubscribeRoom(room._id, arrHandleMessage[ind_room]);
            });
        };
    }, [rooms]);

    return (
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
                <NavbarAtas />
                {loading ? (
                    <div
                        style={{ flex: "1" }}
                        className="p-5 flex justify-center items-center text-white"
                    >
                        <p>Loading ..</p>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                flex: 1,
                                overflowY: "scroll",
                                position: "relative",
                            }}
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
                                    {rooms.map((room, ind_room) => {
                                        return (
                                            <ItemRoom
                                                room={room}
                                                ind_room={ind_room}
                                                idUser={idUser}
                                                key={ind_room}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <NavbarBawah path="/room" />
        </div>
    );
}
