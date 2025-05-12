"use client";

import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import Toast from "./Toast";
import Image from "next/image";

interface IAnggota {
    nama: string;
    email: string;
    _id: string;
}

interface NavbarAtasRoomProps {
    nama: string;
    anggota: IAnggota[];
    idRoom: string;
    bwhJudulProps: string;
}
const NavbarAtasRoom: React.FC<NavbarAtasRoomProps> = ({
    nama,
    anggota,
    idRoom,
    bwhJudulProps,
}) => {
    const [qrCode, setQrCode] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [openInfo, setOpenInfo] = useState(false);
    const [openLeave, setOpenLeave] = useState(false);
    const [bwhJudul, setBwhJudul] = useState("Tekan disini untuk info grup");
    const bwhJudulAnggota = useRef("");
    const [namaGrup, setNamaGrup] = useState(nama);

    const router = useRouter();
    const [eror, setEror] = useState<string>("");

    function handleClick(e: SyntheticEvent) {
        setEror("");
        e.preventDefault();
        async function funFetchUpdate() {
            const response = await fetch("/api/room/update/" + idRoom, {
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
            router.refresh();
            setOpenInfo(false);
        }
        funFetchUpdate();
    }

    // function handleChange(e: React.FormEvent<HTMLInputElement>) {
    //     setValue({
    //         ...value,
    //         [e.currentTarget.name]: e.currentTarget.value,
    //     });
    // }

    useEffect(() => {
        const generateQRCode = async (text: string) => {
            try {
                const qrCodeUrl = await QRCode.toDataURL(text);
                setQrCode(qrCodeUrl);
            } catch (err) {
                console.error(err);
            }
        };
        generateQRCode(idRoom);

        const arrNamaAnggota = anggota.map((e) => {
            return e.nama.split(" ")[0];
        });
        bwhJudulAnggota.current = arrNamaAnggota.join(", ");
        setTimeout(() => {
            if (bwhJudul == "Tekan disini untuk info grup") {
                setBwhJudul(arrNamaAnggota.join(", "));
            }
        }, 3000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (bwhJudulProps) return setBwhJudul(bwhJudulProps + " mengetik..");
        setBwhJudul(bwhJudulAnggota.current);
    }, [bwhJudulProps]);

    function openState() {
        setOpenLeave((prev) => !prev);
    }

    return (
        <div className="px-5 py-4 flex gap-2 navbar">
            <div
                onClick={() => {
                    setOpenInfo((prev) => !prev);
                }}
                style={{ flex: "1", cursor: "pointer" }}
                className="hover:text-indigo-600"
            >
                <h1 className="font-bold text-2xl">{nama}</h1>
                <p
                    className={
                        "text-sm " +
                        (bwhJudul.includes("mengetik")
                            ? "text-indigo-600"
                            : "text-gray-500")
                    }
                    style={{
                        width: "100%",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        fontWeight: bwhJudul.includes("mengetik")
                            ? "bold"
                            : "normal",
                    }}
                >
                    {bwhJudul}
                </p>
            </div>
            <div className="flex gap-1 items-center">
                <button
                    onClick={() => {
                        setOpen((prev) => !prev);
                    }}
                    className="flex w-full justify-center rounded-md p-1.5 text-sm font-semibold hover:text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <i className="material-icons">add</i>
                </button>
                <button
                    onClick={() => {
                        setOpenLeave((prev) => !prev);
                    }}
                    className="flex w-full justify-center rounded-md p-1.5 text-sm font-semibold hover:text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <i className="material-icons">exit_to_app</i>
                </button>
            </div>
            {openLeave && (
                <Toast
                    judul="Keluar room!"
                    subjudul={
                        "Apakah Anda akan keluar dan menghapus room " +
                        nama +
                        "?"
                    }
                    api={"/api/room/exit/" + idRoom}
                    callbackurl="/room"
                    openState={openState}
                />
            )}
            {open && (
                <div
                    className="modal"
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
                        <h1 className="font-bold text-lg">Tambah Anggota</h1>
                        <p className="text-gray-500 mb-4">
                            Scan disini untuk join
                        </p>
                        <div className="flex flex-col gap-1">
                            {qrCode && (
                                <Image src={qrCode} alt="QR Code" width={200} />
                            )}
                        </div>
                    </div>
                </div>
            )}
            {openInfo && (
                <div
                    className="modal"
                    onClick={() => {
                        setOpenInfo((prev) => !prev);
                    }}
                >
                    <div
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                        className="container-modal px-5 py-3 rounded-md"
                    >
                        <h1 className="font-bold text-lg w-80">Info Room</h1>
                        {eror && (
                            <div className="p-3 flex justify-center border border-indigo-500 my-2 items-center">
                                {eror}
                            </div>
                        )}
                        <p className="text-gray-500 mb-2 font-bold">Nama</p>
                        <form onSubmit={handleClick}>
                            <input
                                value={namaGrup}
                                id="nama"
                                name="nama"
                                type="text"
                                className="mb-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                onChange={(e) => {
                                    setNamaGrup(e.target.value);
                                }}
                            />
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Ubah
                            </button>
                        </form>
                        <hr className="my-3" />
                        <p className="text-gray-500 mb-2 font-bold">Anggota</p>
                        <div className="flex flex-col gap-2">
                            {anggota.map((e: IAnggota, ind_e: number) => {
                                return (
                                    <div key={ind_e}>
                                        <p className="font-bold text-indigo-600">
                                            {e.nama}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {e.email}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavbarAtasRoom;
