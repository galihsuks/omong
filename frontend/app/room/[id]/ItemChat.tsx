import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BsReply } from "react-icons/bs";
import { MdOutlineEdit } from "react-icons/md";
import { RiChatDeleteLine } from "react-icons/ri";

interface anggota {
    email: string;
    nama: string;
    _id: string;
}

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

interface ItemChatProps {
    chat: IChat;
    index_chat: number;
    idUser: string;
    chatBefore: null | IChat;
    handleReply: (id: string) => void;
}

function formatTimeOnly(isoString: string): string {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

const ItemChat: React.FC<ItemChatProps> = ({
    chat,
    index_chat,
    idUser,
    chatBefore,
    handleReply,
}) => {
    const [eror, setEror] = useState("");
    const router = useRouter();
    const [hover, setHover] = useState(false);
    const handleHapus = async (id_chat: string) => {
        setHover(false);
        const response = await fetch(`/api/chat/${id_chat}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = await response.json();
        if (response.status == 401) {
            return router.replace("/");
        }
        if (response.status != 200) {
            return setEror(result.pesan);
        }
        console.log("Berhasil dihapus");
        console.log(result);
    };

    function compareDates(date1: string, date2: string) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        // Remove time part for day comparison
        const y1 = d1.getFullYear(),
            m1 = d1.getMonth(),
            day1 = d1.getDate();
        const y2 = d2.getFullYear(),
            m2 = d2.getMonth(),
            day2 = d2.getDate();

        const bedaHari = y1 !== y2 || m1 !== m2 || day1 !== day2;

        // For hariIni
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const target = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
        const diffMs = today.getTime() - target.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let hariIni = "";
        if (diffDays === 0) {
            hariIni = "Today";
        } else if (diffDays === 1) {
            hariIni = "Yesterday";
        } else if (diffDays > 1 && diffDays <= 7) {
            hariIni = target.toLocaleDateString("en-US", { weekday: "long" });
        } else {
            const dd = String(target.getDate()).padStart(2, "0");
            const mm = String(target.getMonth() + 1).padStart(2, "0");
            const yyyy = target.getFullYear();
            hariIni = `${dd}/${mm}/${yyyy}`;
        }

        return {
            bedaHari,
            hariIni,
        };
    }

    function formatHariIni(tgl: string) {
        const d2 = new Date(tgl);
        // For hariIni
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const target = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
        const diffMs = today.getTime() - target.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let hariIni = "";
        if (diffDays === 0) {
            hariIni = "Today";
        } else if (diffDays === 1) {
            hariIni = "Yesterday";
        } else if (diffDays > 1 && diffDays <= 7) {
            hariIni = target.toLocaleDateString("en-US", { weekday: "long" });
        } else {
            const dd = String(target.getDate()).padStart(2, "0");
            const mm = String(target.getMonth() + 1).padStart(2, "0");
            const yyyy = target.getFullYear();
            hariIni = `${dd}/${mm}/${yyyy}`;
        }
        return hariIni;
    }

    return (
        <>
            {chatBefore &&
                compareDates(chatBefore.createdAt, chat.createdAt).bedaHari && (
                    <div className="flex justify-center my-2">
                        <div
                            style={{
                                fontSize: "10px",
                                borderRadius: "3em",
                                backgroundColor: "rgba(255, 255, 255, 0.06)",
                            }}
                            className="text-white px-3 py-1"
                        >
                            {
                                compareDates(
                                    chatBefore.createdAt,
                                    chat.createdAt
                                ).hariIni
                            }
                        </div>
                    </div>
                )}
            {index_chat == 0 && (
                <div className="flex justify-center text-white px-3 py-1 my-2">
                    <div
                        style={{
                            fontSize: "10px",
                            borderRadius: "3em",
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                        }}
                        className="text-white px-3 py-1"
                    >
                        {formatHariIni(chat.createdAt)}
                    </div>
                </div>
            )}
            <div
                className={`chat ${
                    chat.idPengirim._id === idUser ? "kanan" : "kiri"
                } ${
                    chatBefore?.idPengirim._id != chat.idPengirim._id &&
                    chatBefore &&
                    !compareDates(chatBefore.createdAt, chat.createdAt).bedaHari
                        ? "mt-2"
                        : ""
                }`}
            >
                {chatBefore?.idPengirim._id != chat.idPengirim._id &&
                    chat.idPengirim._id != idUser && (
                        <p className="nama">
                            {chat.idPengirim.nama.split(" ")[0]}
                        </p>
                    )}
                {chatBefore &&
                    compareDates(chatBefore.createdAt, chat.createdAt)
                        .bedaHari &&
                    chatBefore?.idPengirim._id == chat.idPengirim._id && (
                        <p className="nama">
                            {chat.idPengirim.nama.split(" ")[0]}
                        </p>
                    )}
                <div
                    className="gap-1 container-waktu-bubble"
                    onMouseEnter={() => {
                        setHover(true);
                    }}
                    onMouseLeave={() => {
                        setHover(false);
                    }}
                >
                    <div className="bubble">
                        {chat.idChatReply && (
                            <div className="reply mb-2">
                                <p
                                    className="text-pink-200"
                                    style={{ fontSize: "10px" }}
                                >
                                    {
                                        chat.idChatReply.idPengirim.nama.split(
                                            " "
                                        )[0]
                                    }
                                </p>
                                <p>{chat.idChatReply.pesan}</p>
                            </div>
                        )}
                        <p className="pesan">{chat.pesan}</p>
                    </div>
                    <p className="waktu">{formatTimeOnly(chat.updatedAt)}</p>
                    <div className={`menu ${hover ? "show" : ""}`}>
                        <span
                            className="flex gap-2 items-center py-2 px-2 hover:bg-indigo-800"
                            onClick={() => {
                                setHover(false);
                                handleReply(chat._id);
                            }}
                        >
                            <BsReply />
                            <p>Replay</p>
                        </span>
                        {chat.idPengirim._id === idUser && (
                            <>
                                {/* <span className="flex gap-2 items-center py-2 px-2 hover:bg-indigo-800">
                                <MdOutlineEdit />
                                <p>Edit</p>
                            </span> */}
                                <span
                                    onClick={() => {
                                        handleHapus(chat._id);
                                    }}
                                    className="flex gap-2 items-center py-2 px-2 hover:bg-indigo-800"
                                >
                                    <RiChatDeleteLine />
                                    <p>Unsend</p>
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {eror && (
                    <p className="text-red-500" style={{ fontSize: "10px" }}>
                        {eror}
                    </p>
                )}
            </div>
        </>
    );
};
export default ItemChat;
