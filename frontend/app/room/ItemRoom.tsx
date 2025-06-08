import Link from "next/link";
import { BsCheck, BsCheckAll } from "react-icons/bs";

interface anggota {
    email: string;
    nama: string;
    _id: string;
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

interface ItemRoomProps {
    room: IRooms;
    ind_room: number;
    idUser: string;
}

function timeDifference(current: any, previous: any) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;

    const elapsed = current - previous;

    if (elapsed < 1000) {
        return "Just now";
    } else if (elapsed < msPerMinute) {
        return Math.floor(elapsed / 1000) + "s";
    } else if (elapsed < msPerHour) {
        return Math.floor(elapsed / msPerMinute) + "m";
    } else if (elapsed < msPerDay) {
        return Math.floor(elapsed / msPerHour) + "h";
    } else if (elapsed < msPerMonth) {
        return Math.floor(elapsed / msPerDay) + "d";
    } else {
        return new Date(previous).toLocaleDateString();
    }
}

const ItemRoom: React.FC<ItemRoomProps> = ({ room, ind_room, idUser }) => {
    return (
        <Link
            href={"/room/" + room._id}
            className={`px-4 py-3 item-room ${ind_room != 0 ? "no-first" : ""}`}
        >
            <div className="foto">
                <p style={{ fontSize: "15px", fontWeight: "semibold" }}>
                    {room.nama.charAt(0)}
                </p>
                {room.online && <span></span>}
            </div>
            <div style={{ flex: "1" }}>
                <p className="nama">{room.nama}</p>
                {room.lastchat && idUser && (
                    <div className="flex gap-1 items-center">
                        {room.lastchat.idPengirim._id == idUser && (
                            <div
                                className={`seen ${
                                    room.lastchat.seenUsers.filter(
                                        (u) => u.user._id != idUser
                                    ).length ==
                                    room.anggota.filter((u) => u._id != idUser)
                                        .length
                                        ? "check"
                                        : ""
                                }`}
                            >
                                {room.lastchat.seenUsers.filter(
                                    (u) => u.user._id != idUser
                                ).length == 0 ? (
                                    <BsCheck size={20} />
                                ) : (
                                    <BsCheckAll size={20} />
                                )}
                            </div>
                        )}
                        <p
                            className="pesan"
                            style={{
                                width: `${window.innerWidth - 230}px`,
                            }}
                        >
                            {room.tipe == "group" &&
                                (room.lastchat.idPengirim._id == idUser
                                    ? "You"
                                    : room.lastchat.idPengirim.nama.split(
                                          " "
                                      )[0]) + ": "}
                            {room.lastchat.pesan}
                        </p>
                    </div>
                )}
            </div>
            {room.lastchat && (
                <div className="flex flex-col items-end">
                    <p className="waktu mb-1">
                        {timeDifference(
                            Date.now(),
                            Date.parse(room.lastchat.createdAt)
                        )}
                    </p>
                    {room.chatsUnread > 0 && (
                        <div
                            style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "3em",
                            }}
                            className="bg-indigo-100 text-indigo-600 flex justify-center items-center"
                        >
                            <p className="font-bold">{room.chatsUnread}</p>
                        </div>
                    )}
                </div>
            )}
        </Link>
    );
};

export default ItemRoom;
