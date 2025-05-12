"use client";

import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import imgLogo from "@/app/img/logo.svg";
import Image from "next/image";

export default function NavbarAtas() {
    const [open, setOpen] = useState(false);
    const html5QrcodeScanner = useRef<any>("");

    const router = useRouter();
    const [value, setValue] = useState({
        nama: "",
    });
    const [eror, setEror] = useState<string>("");

    function handleClick(e: SyntheticEvent) {
        setEror("");
        e.preventDefault();
        async function funFetchLogin() {
            const response = await fetch("/api/room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(value),
            });

            const result = await response.json();

            if (response.status === 401) {
                return setEror(result.error);
            }
            router.refresh();
            setOpen(false);
        }
        funFetchLogin();
    }

    function handleChange(e: React.FormEvent<HTMLInputElement>) {
        setValue({
            ...value,
            [e.currentTarget.name]: e.currentTarget.value,
        });
    }

    function handleClickLogout() {
        async function funFetchLogin() {
            const response = await fetch("/api/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();
            router.push("/");
        }
        funFetchLogin();
    }

    useEffect(() => {
        console.log(open);
        if (open) {
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
    }, [open]);

    return (
        <div className="px-5 py-4 flex justify-between navbar">
            <Image src={imgLogo} alt="Omong" width={100} />
            <div className="flex gap-1">
                <button
                    onClick={() => {
                        setOpen((prev) => !prev);
                    }}
                    className="flex w-full justify-center rounded-md p-1.5 text-sm font-semibold hover:text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <i className="material-icons">add</i>
                </button>
                <button
                    onClick={handleClickLogout}
                    className="flex w-full justify-center rounded-md p-1.5 text-sm font-semibold text-indigo-600 hover:text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <i className="material-icons">power_settings_new</i>
                </button>
            </div>
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
                        <h1 className="font-bold text-lg">Tambah ruang</h1>
                        <p className="text-gray-500 mb-4">
                            Isi nama ruang chat yang ingin Anda buat
                        </p>
                        <form className="space-y-6">
                            <div>
                                <label
                                    htmlFor="nama"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Nama Ruang
                                </label>
                                <div className="mt-2">
                                    <input
                                        value={value.nama}
                                        id="nama"
                                        name="nama"
                                        type="text"
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    onClick={handleClick}
                                >
                                    Tambah
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-gray-500 my-2">
                            atau scan QRcode
                        </p>
                        <div id="reader" className="w-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
