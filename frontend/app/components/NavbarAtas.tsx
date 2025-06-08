"use client";

import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import imgLogo from "@/app/img/logo_white.svg";
import Image from "next/image";
import useUserStore from "@/store/userStore";
import { FaPlus } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { RiLetterSpacing2, RiSearch2Line } from "react-icons/ri";
import { VscTypeHierarchySub } from "react-icons/vsc";
import { FiCheckSquare } from "react-icons/fi";

interface anggota {
    email: string;
    nama: string;
}

export default function NavbarAtas() {
    const [open, setOpen] = useState(false);
    const html5QrcodeScanner = useRef<any>("");

    const router = useRouter();
    const [formData, setFormData] = useState({
        nama: "",
        tipe: "private",
        anggota: [] as anggota[],
    });
    const [eror, setEror] = useState({
        style: "",
        teks: "",
    });
    const [jenisTambah, setJenisTambah] = useState("new");
    const { clearUser } = useUserStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [optAnggota, setOptAnggota] = useState<anggota[]>([]);
    const [searchAnggota, setSearchAnggota] = useState("");

    const handleSearchAnggota = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        setSearchAnggota(value);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (value == "") {
            return setOptAnggota([]);
        }
        setOptAnggota([
            {
                email: "",
                nama: "Loading ..",
            },
        ]);
        timeoutRef.current = setTimeout(() => {
            (async () => {
                const fetchUsersByNama = await fetch("/api/user/getby/nama", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ value }),
                });
                const responseUserByNama = await fetchUsersByNama.json();
                if (fetchUsersByNama.status != 200) {
                    return setEror(responseUserByNama.pesan);
                }
                setOptAnggota(responseUserByNama);
            })();
        }, 500); // Delay of 300 milliseconds
    };

    function handleAddRoom(e: SyntheticEvent) {
        setEror({ style: "", teks: "" });
        e.preventDefault();
        const formDataFix = {
            ...formData,
            anggota: formData.anggota.map((e) => e.email),
        };
        (async () => {
            const response = await fetch("/api/room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formDataFix),
            });

            const result = await response.json();

            if (response.status === 401) {
                return router.replace("/");
            }
            if (response.status != 200) {
                return setEror({
                    style: "text-red-600 bg-red-100",
                    teks: result.pesan,
                });
            }
            setOpen(false);
            // console.log(result);
            // window.location.reload();
        })();
    }

    function handleClickLogout() {
        async function funFetchLogin() {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            clearUser();
            router.push("/");
        }
        funFetchLogin();
    }

    useEffect(() => {
        console.log(open);
        if (open && jenisTambah == "join") {
            html5QrcodeScanner.current = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                },
                /* verbose= */ false
            );
            html5QrcodeScanner.current.render(
                (decodedText: any, decodedResult: any) => {
                    html5QrcodeScanner.current.clear();
                    console.log("bergabung di grup " + decodedText);
                    async function funFetchJoin() {
                        try {
                            const response = await fetch(
                                "/api/room/join/" + decodedText
                            );
                            const result = await response.json();
                            if (response.status != 200) {
                                return setEror({
                                    style: "text-red-600 bg-red-100",
                                    teks: result.pesan,
                                });
                            }
                            router.refresh();
                            setOpen(false);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    funFetchJoin();
                }
            );
        } else {
            if (html5QrcodeScanner.current) {
                html5QrcodeScanner.current.clear();
                html5QrcodeScanner.current = false;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, jenisTambah]);

    const handleSelectAnggota = (email: string) => {
        const selected = optAnggota.find((a) => a.email === email);
        if (selected && !formData.anggota.find((e) => e.email === email)) {
            setFormData({
                ...formData,
                anggota: [
                    ...formData.anggota,
                    {
                        email: selected.email,
                        nama: selected.nama,
                    },
                ],
            });
        }
        setSearchAnggota("");
        setOptAnggota([]);
    };

    const handleDeleteAnggota = (email: string) => {
        setFormData({
            ...formData,
            anggota: formData.anggota.filter((e) => e.email != email),
        });
    };

    return (
        <>
            <div className="px-5 pt-4 pb-3 flex justify-between navbar items-center">
                <Image src={imgLogo} alt="Omong" width={100} />
                <div className="flex gap-1 items-center">
                    <button
                        onClick={() => {
                            setOpen((prev) => !prev);
                        }}
                        className="flex w-full justify-center rounded-md p-2 text-indigo-200 hover:text-white"
                    >
                        <FaPlus />
                    </button>
                    <button
                        onClick={handleClickLogout}
                        className="flex w-full justify-center rounded-md p-2 text-indigo-200 hover:text-white"
                    >
                        <HiOutlineLogout size={18} />
                    </button>
                </div>
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
                        className="container-modal px-5 py-5"
                    >
                        <h1 className="font-bold">Add Room</h1>
                        <p className="mb-3 text-indigo-200">
                            {jenisTambah == "new"
                                ? "Enter the name of the chat room you want to create"
                                : "Scan the QR code of the group you want to join"}
                        </p>
                        {eror.teks && (
                            <div
                                style={{ borderRadius: "3em" }}
                                className={`px-5 mb-3 py-1 ${eror.style}`}
                            >
                                <p>{eror.teks}</p>
                            </div>
                        )}
                        {jenisTambah == "new" ? (
                            <form className="w-full" onSubmit={handleAddRoom}>
                                <div className="formulir mb-5">
                                    <label className="text-indigo-100">
                                        Tipe
                                    </label>
                                    <div className="input flex items-center gap-3 px-3">
                                        <VscTypeHierarchySub />
                                        <select
                                            value={formData.tipe}
                                            name="tipe"
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    tipe: e.target.value,
                                                });
                                            }}
                                        >
                                            <option value="private">
                                                Private
                                            </option>
                                            <option value="group">Group</option>
                                        </select>
                                    </div>
                                </div>
                                {formData.tipe != "private" && (
                                    <div className="formulir mb-5">
                                        <label className="text-indigo-100">
                                            Nama
                                        </label>
                                        <div className="input flex items-center gap-3 px-3">
                                            <RiLetterSpacing2 />
                                            <input
                                                value={formData.nama}
                                                type="text"
                                                name="nama"
                                                required
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        nama: e.target.value,
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div
                                    className="formulir mb-5"
                                    style={{ position: "relative" }}
                                >
                                    <label className="text-indigo-100">
                                        Anggota
                                    </label>
                                    <div className="input flex items-center gap-3 px-3">
                                        <input
                                            type="text"
                                            placeholder="Search friends .."
                                            onChange={handleSearchAnggota}
                                            value={searchAnggota}
                                        />
                                        <RiSearch2Line />
                                    </div>
                                    <div
                                        className="flex flex-col bg-white"
                                        style={{
                                            position: "absolute",
                                            width: "100%",
                                        }}
                                    >
                                        {optAnggota.map((a, ind_a) => (
                                            <div
                                                key={ind_a}
                                                className="px-4 py-2 w-full text-indigo-600 hover:bg-indigo-400 hover:text-white"
                                                onClick={() => {
                                                    handleSelectAnggota(
                                                        a.email
                                                    );
                                                }}
                                            >
                                                <p className="font-bold">
                                                    {a.nama}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: "10px",
                                                        opacity: 0.8,
                                                    }}
                                                >
                                                    {a.email}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        {formData.anggota.map((a, ind_a) => (
                                            <div
                                                key={ind_a}
                                                className="flex gap-3 items-center py-2 hover:text-indigo-200 hover:cursor-pointer"
                                                onClick={() => {
                                                    handleDeleteAnggota(
                                                        a.email
                                                    );
                                                }}
                                            >
                                                <FiCheckSquare />
                                                <div>
                                                    <p className="font-bold">
                                                        {a.nama}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: "10px",
                                                            opacity: 0.8,
                                                        }}
                                                    >
                                                        {a.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        style={{ borderRadius: "3em" }}
                                        className="flex w-full justify-center text-white border border-white px-3 py-1.5 font-semibold hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                                    >
                                        Tambah
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div id="reader" className="w-full"></div>
                        )}
                        <p className="text-center text-gray-500 my-2">
                            or{" "}
                            {jenisTambah == "new"
                                ? "scan QRcode"
                                : "add new room"}
                        </p>
                        <button
                            type="button"
                            style={{ borderRadius: "3em" }}
                            className="flex w-full justify-center text-white bg-indigo-600 px-3 py-1.5 font-semibold hover:bg-indigo-300 hover:text-indigo-600"
                            onClick={() => {
                                setJenisTambah(
                                    jenisTambah == "new" ? "join" : "new"
                                );
                            }}
                        >
                            {jenisTambah == "new"
                                ? "Scan QR to join"
                                : "Add new"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
