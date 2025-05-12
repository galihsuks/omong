"use client";

import Link from "next/link";
import NavbarAtasRoom from "@/app/components/NavbarAtasRoom";
import {
    SyntheticEvent,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";

interface Chat {
    _id: string;
    idRoom: string;
    pesan: string;
    idPengirim: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    user: {
        nama: string;
    };
}

interface Anggota {
    nama: string;
    _id: string;
}

interface IRoom {
    nama: string;
    detailAnggota: [];
}

interface IUser {
    _id: string;
    nama: string;
}

export default function Chat({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [responseRoom, setResponseRoom] = useState<IRoom>();
    const [responseRooms, setResponseRooms] = useState<Chat[]>();
    const [responseUserCur, setresponseUserCur] = useState<IUser>();
    const [eror, setEror] = useState("");
    const [input, setInput] = useState("");
    const idChatDummy = useRef<string>(Date.now().toString());
    const refContainerChat = useRef<HTMLDivElement>(null);
    const ws = useRef(
        new WebSocket("wss://ws.amag/ngomongo?room=" + params.id)
    );
    const [typing, setTyping] = useState("");
    const [typingText, setTypingText] = useState("");
    const dumTypingUsersOnMessage = useRef<Anggota[]>([]);
    const runRef = useRef([false]);

    ws.current.onopen = () => {
        console.log("Connected to WebSocket over WSS on port 8080");
    };
    ws.current.onmessage = (event) => {
        console.log(event.data);
        const datanya = JSON.parse(event.data);
        switch (datanya.tipeData) {
            case "chat":
                generateChatRealtime(datanya);
                break;
            case "typing":
                sedangMengetik(datanya);
                break;
            default:
                break;
        }
    };

    const sedangMengetik = (datanya: { pengirim: string; nilai: boolean }) => {
        if (datanya.nilai) {
            dumTypingUsersOnMessage.current.push({
                nama: datanya.pengirim,
                _id: "",
            });
        } else {
            let dataFilter = dumTypingUsersOnMessage.current.filter((obj) => {
                return obj.nama !== datanya.pengirim;
            });
            dumTypingUsersOnMessage.current = dataFilter;
        }
        let typingTextString = "";
        if (dumTypingUsersOnMessage.current.length > 0)
            typingTextString =
                dumTypingUsersOnMessage.current[
                    dumTypingUsersOnMessage.current.length - 1
                ].nama;
        return setTypingText(typingTextString);
    };
    const handleSendMessage = async (e: SyntheticEvent) => {
        e.preventDefault();
        const datanya = {
            pengirim: responseUserCur?.nama as string,
            idPengirim: responseUserCur?._id as string,
            pesan: input as string,
            tipeData: "chat",
        };
        ws.current.send(JSON.stringify(datanya));
        generateChatRealtime(datanya);

        const response = await fetch("/api/room/chat/" + params.id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pesan: input }),
        });

        const result = await response.json();

        if (response.status === 401) {
            return router.replace("/");
        }

        setInput("");
    };

    const generateChatRealtime = (datanya: {
        pengirim: string;
        idPengirim: string;
        pesan: string;
    }) => {
        const dateSkrg = Date.now().toString();
        if (responseRooms) {
            setResponseRooms([
                ...responseRooms,
                {
                    _id: idChatDummy.current,
                    idRoom: params.id,
                    pesan: datanya.pesan,
                    idPengirim: datanya.idPengirim,
                    createdAt: dateSkrg,
                    updatedAt: dateSkrg,
                    __v: 0,
                    user: {
                        nama: datanya.pengirim,
                    },
                },
            ]);
        }
        idChatDummy.current = dateSkrg;
    };

    useEffect(() => {
        async function fetchDataRoom() {
            const response = await fetch("/api/room/" + params.id);
            const result = await response.json();
            if (response.status === 401) {
                return setEror(result.error);
            }
            setResponseRoom(result.data.responseRoom);
            setResponseRooms(result.data.responseRooms);
            setresponseUserCur(result.data.responseUserCur);
            setLoading(false);
        }
        fetchDataRoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (refContainerChat.current)
            refContainerChat.current.scrollTop =
                refContainerChat.current?.scrollHeight;
    }, [responseRooms]);

    useEffect(() => {
        if (input != "")
            return setTyping(responseUserCur?.nama.split(" ")[0] as string);
        if (typing == responseUserCur?.nama.split(" ")[0]) return setTyping("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input]);

    useEffect(() => {
        if (!runRef.current[0]) {
            runRef.current[0] = true;
            return;
        }
        console.log(typing);
        let nilai = false;
        if (typing) nilai = true;
        ws.current.send(
            JSON.stringify({
                pengirim: responseUserCur?.nama.split(" ")[0] as string,
                nilai: nilai,
                tipeData: "typing",
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typing]);

    useEffect(() => {
        console.log("typingtext: " + typingText);
    }, [typingText]);

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
                {loading ? (
                    <div
                        style={{ flex: "1" }}
                        className="p-5 flex justify-center items-center"
                    >
                        Loading ...
                    </div>
                ) : (
                    <>
                        <NavbarAtasRoom
                            bwhJudulProps={typingText}
                            nama={
                                responseRoom?.nama
                                    ? responseRoom.nama
                                    : "Loading"
                            }
                            anggota={
                                responseRoom?.detailAnggota
                                    ? responseRoom.detailAnggota
                                    : []
                            }
                            idRoom={params.id}
                        />
                        <div
                            ref={refContainerChat}
                            className="container-chat px-5"
                        >
                            <div className="container-chat-sub py-3">
                                {responseRooms?.map(
                                    (chat, ind_chat: number) => {
                                        return (
                                            <div
                                                key={ind_chat}
                                                className={
                                                    "flex" +
                                                    (chat.idPengirim ==
                                                        responseUserCur?._id &&
                                                        " justify-end")
                                                }
                                            >
                                                <div
                                                    className={
                                                        chat.idPengirim ==
                                                        responseUserCur?._id
                                                            ? "chat-kanan"
                                                            : "chat-kiri"
                                                    }
                                                    key={ind_chat}
                                                >
                                                    <p className="nama">
                                                        {chat.user.nama}
                                                    </p>
                                                    <p className="pesan">
                                                        {chat.pesan}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                                {/* <div className="chat-kanan">
                            <p className="nama">Galih</p>
                            <p className="pesan">Ayo dolan cuy</p>
                        </div>
                        <div className="chat-kiri">
                            <p className="nama">Sukma</p>
                            <p className="pesan">Ayo dolan cuy</p>
                        </div> */}
                            </div>
                        </div>
                    </>
                )}
                <form action="" onSubmit={handleSendMessage}>
                    <div className="px-5 py-3 input-chat">
                        <input
                            type="text"
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            value={input}
                        />
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <i className="material-icons">send</i>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
