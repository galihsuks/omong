"use client";

import Link from "next/link";
// import { cookies } from "next/headers";
import NavbarAtas from "../components/NavbarAtas";
import { useEffect, useState } from "react";
import NavbarBawah from "../components/NavbarBawah";
import { useRouter } from "next/navigation";

interface IRooms {
    _id: string;
    nama: string;
    anggota: [];
    createdAt: string;
    updatedAt: string;
    __v: number;
    lastchat: {
        pesan: string;
        idPengirim: string;
        waktu: string;
    };
}

export default function Room() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [responseRooms, setResponseRooms] = useState<IRooms[]>();
    const [eror, setEror] = useState("");

    useEffect(() => {
        async function fetchDataRoom() {
            const response = await fetch("/api/room");
            const result = await response.json();
            console.log(result);
            if (response.status === 401) {
                return router.replace("/");
            }
            setResponseRooms(result);
            setLoading(false);
        }
        fetchDataRoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // const token = cookies().get("token")?.value;
    // const fetchRooms = await fetch("http://localhost:8080/room", {
    //     cache: "no-store",
    //     headers: {
    //         Authorization: `Bearer ${token}`,
    //     },
    // });

    // const responseRooms = await fetchRooms.json();
    // if (fetchRooms.status != 200) {
    //     return (
    //         <div className="p-5 w-full sm:max-w-sm flex justify-center items-center border-2 border-indigo-500">
    //             {responseRooms.pesan}
    //         </div>
    //     );
    // }

    function timeDifference(current: any, previous: any) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;

        if (elapsed < msPerMinute) {
            return Math.round(elapsed / 1000) + " sec";
        } else if (elapsed < msPerHour) {
            return Math.round(elapsed / msPerMinute) + " min";
        } else if (elapsed < msPerDay) {
            return Math.round(elapsed / msPerHour) + " hours";
        } else if (elapsed < msPerMonth) {
            return Math.round(elapsed / msPerDay) + " days";
        } else if (elapsed < msPerYear) {
            return Math.round(elapsed / msPerMonth) + " months";
        } else {
            return Math.round(elapsed / msPerYear) + " years ago";
        }
    }

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
            <NavbarAtas />
            {loading ? (
                <div
                    style={{ flex: "1" }}
                    className="p-5 flex justify-center items-center"
                >
                    Loading ...
                </div>
            ) : (
                <>
                    <div style={{ flex: 1, overflowY: "scroll" }}>
                        <div className="">
                            {responseRooms?.map(
                                (room: IRooms, ind_room: number) => {
                                    return (
                                        <Link
                                            href={"/room/" + room._id}
                                            className="px-5 py-4 item-room"
                                            key={ind_room}
                                        >
                                            <div className="foto">
                                                {room.nama.charAt(0)}
                                            </div>
                                            <div style={{ flex: "1" }}>
                                                <p className="nama">
                                                    {room.nama}
                                                </p>
                                                {room.lastchat.pesan && (
                                                    <p className="pesan">
                                                        {room.lastchat.pesan}
                                                    </p>
                                                )}
                                            </div>
                                            {room.lastchat.pesan && (
                                                <>
                                                    <p className="waktu text-sm">
                                                        {timeDifference(
                                                            Date.now(),
                                                            Date.parse(
                                                                room.lastchat
                                                                    .waktu
                                                            )
                                                        )}
                                                    </p>
                                                </>
                                            )}
                                        </Link>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </>
            )}
            <NavbarBawah path="/room" />
        </div>
    );
}
