"use client";

import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import Toast from "./Toast";
import Image from "next/image";
import { FaChevronLeft, FaPlus } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { RiLetterSpacing2 } from "react-icons/ri";
import useUserStore from "@/store/userStore";
import Link from "next/link";

interface IAnggota {
    nama: string;
    email: string;
    _id: string;
    online: {
        last: string;
        status: boolean;
    };
}

interface NavbarAtasRoomProps {
    nama: string;
    anggota: IAnggota[];
    idRoom: string;
    tipe: string;
    // bwhJudulProps: string;
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

const NavbarAtasRoom: React.FC<NavbarAtasRoomProps> = ({
    nama,
    anggota,
    idRoom,
    tipe,
    // bwhJudulProps,
}) => {
    const [qrCode, setQrCode] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [openInfo, setOpenInfo] = useState(false);
    const [openLeave, setOpenLeave] = useState(false);
    const [bwhJudul, setBwhJudul] = useState("Tap here to info");
    const bwhJudulAnggota = useRef("");
    const [namaGrup, setNamaGrup] = useState(nama);
    const router = useRouter();
    const [eror, setEror] = useState<string>("");
    const { id: idUser } = useUserStore();

    function handleUpdateRoom(e: SyntheticEvent) {
        setEror("");
        e.preventDefault();
        async function funFetchUpdate() {
            const response = await fetch("/api/room/" + idRoom, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nama: namaGrup,
                }),
            });

            const result = await response.json();

            if (response.status === 401) {
                return setEror(result.error);
            }
            router.push("/room");
            setOpenInfo(false);
        }
        funFetchUpdate();
    }

    useEffect(() => {
        const generateQRCode = async (text: string) => {
            try {
                const qrCodeUrl = await QRCode.toDataURL(text);
                console.log(qrCodeUrl);
                setQrCode(qrCodeUrl);
            } catch (err) {
                console.error(err);
            }
        };
        generateQRCode(idRoom);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setNamaGrup(nama);
    }, [nama]);

    useEffect(() => {
        if (anggota.length > 0) {
            const arrNamaAnggota = anggota.reduce((prev, curr, ind) => {
                return `${prev}${ind == 0 ? "" : ", "}${
                    curr.nama.split(" ")[0]
                }`;
            }, "");
            setTimeout(() => {
                if (bwhJudul == "Tap here to info") {
                    setBwhJudul(arrNamaAnggota);
                }
            }, 3000);
        }
    }, [anggota]);

    function openState() {
        setOpenLeave((prev) => !prev);
    }

    return (
        <>
            <Toast
                show={openLeave}
                judul="Keluar room!"
                subjudul={"Do you want to leave this room?"}
                api={"/api/room/exit/" + idRoom}
                callbackurl="/room"
                openState={openState}
            />
            <div
                className={`modal ${open ? "show" : ""}`}
                onClick={() => {
                    setOpen((prev) => !prev);
                }}
            >
                <div
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    className="container-modal px-5 py-3 rounded-md"
                >
                    <h1 className="font-bold">Tambah Anggota</h1>
                    <p className="text-pink-300">Scan disini untuk join</p>
                    <div
                        style={{
                            height: "1px",
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.3)",
                        }}
                        className="my-3"
                    ></div>
                    <div className="flex justify-center gap-1">
                        {qrCode && (
                            <Image
                                src={qrCode}
                                alt="QR Code"
                                width={200}
                                height={200}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div
                className={`modal ${openInfo ? "show" : ""}`}
                onClick={() => {
                    setOpenInfo((prev) => !prev);
                }}
            >
                <div
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    className="container-modal px-5 py-5 rounded-md"
                >
                    <h1 className="font-bold">Info Room</h1>
                    <p className="text-pink-300">Tipe : {tipe}</p>
                    <div
                        style={{
                            height: "1px",
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.3)",
                        }}
                        className="my-3"
                    ></div>
                    {eror && (
                        <div className="p-3 flex justify-center border border-indigo-500 my-2 items-center">
                            {eror}
                        </div>
                    )}
                    {tipe == "group" && (
                        <form onSubmit={handleUpdateRoom} className="mb-3">
                            <div className="formulir mb-3">
                                <label className="text-indigo-100">
                                    Nama Grup
                                </label>
                                <div className="input flex items-center gap-3 px-3">
                                    <RiLetterSpacing2 />
                                    <input
                                        value={namaGrup}
                                        type="text"
                                        name="nama"
                                        required
                                        onChange={(e) => {
                                            setNamaGrup(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Ubah
                            </button>
                        </form>
                    )}
                    <p className="text-indigo-200 mb-2">
                        Anggota ({anggota.length})
                    </p>
                    <div className="flex flex-col gap-2">
                        {anggota.map((e: IAnggota, ind_e: number) => {
                            return (
                                <div key={ind_e}>
                                    <p className="font-bold text-white">
                                        {e.nama}
                                    </p>
                                    <p className="text-indigo-200">{e.email}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="px-5 py-4 flex gap-2 navbar items-center">
                <Link
                    href={"/room"}
                    className="flex justify-center rounded-md p-2 text-indigo-200 hover:text-white"
                >
                    <FaChevronLeft />
                </Link>
                <div
                    onClick={() => {
                        setOpenInfo((prev) => !prev);
                    }}
                    style={{ flex: "1", cursor: "pointer" }}
                    className="hover:text-indigo-600"
                >
                    <h4 className="font-bold text-white">{nama}</h4>
                    <p
                        className={
                            tipe == "private" &&
                            anggota.find((a) => a._id != idUser)?.online.status
                                ? "text-pink-300"
                                : "text-indigo-300"
                        }
                        style={{
                            width: `${window.innerWidth - 200}px`,
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            fontWeight: bwhJudul.includes("mengetik")
                                ? "bold"
                                : "normal",
                        }}
                    >
                        {tipe == "private"
                            ? anggota.find((a) => a._id != idUser)?.online
                                  .status
                                ? "online"
                                : `Last active ${timeDifference(
                                      Date.now(),
                                      Date.parse(
                                          anggota.find((a) => a._id != idUser)
                                              ?.online.last ?? ""
                                      )
                                  )}`
                            : bwhJudul}
                    </p>
                </div>
                <div className="flex gap-1 items-center">
                    {tipe == "group" && (
                        <button
                            onClick={() => {
                                setOpen((prev) => !prev);
                            }}
                            className="flex w-full justify-center rounded-md p-2 text-indigo-200 hover:text-white"
                        >
                            <FaPlus />
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setOpenLeave((prev) => !prev);
                        }}
                        className="flex w-full justify-center rounded-md p-2 text-indigo-200 hover:text-white"
                    >
                        <HiOutlineLogout size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default NavbarAtasRoom;
