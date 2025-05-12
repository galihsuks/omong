"use client";

import { useEffect, useState } from "react";
import NavbarAtas from "../components/NavbarAtas";
import NavbarBawah from "../components/NavbarBawah";
import { useRouter } from "next/navigation";

// interface IUser {
//     _id: string;
//     emai: string;
//     sandi: string;
//     nama: string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
// }

export default function Account() {
    const router = useRouter();
    const [changePass, setChangePass] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [nama, setNama] = useState("");
    const [sandi, setSandi] = useState("");
    const [confirmSandi, setConfirmSandi] = useState("");
    const [eror, setEror] = useState("");
    const [submitBtn, setSubmitBtn] = useState(false);
    const [confirmPass, setConfirmPass] = useState(false);
    const [info, setInfo] = useState("");

    useEffect(() => {
        async function fetchDataRoom() {
            const response = await fetch("/api/account");
            const result = await response.json();
            if (response.status === 401) {
                return router.replace("/");
            }
            console.log(result);
            setEmail(result.email);
            setNama(result.nama);
            setLoading(false);
        }
        fetchDataRoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (changePass) {
            if (email && nama && sandi && confirmSandi) {
                if (sandi == confirmSandi) {
                    setConfirmPass(true);
                    setSubmitBtn(true);
                } else {
                    setConfirmPass(false);
                    setSubmitBtn(false);
                }
            } else {
                setConfirmPass(false);
                setSubmitBtn(false);
            }
        } else {
            if (email && nama) {
                setSubmitBtn(true);
            } else {
                setSubmitBtn(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, nama, sandi, confirmSandi]);

    useEffect(() => {
        if (changePass) {
            setSandi("");
            setConfirmSandi("");
            setSubmitBtn(false);
        } else {
            if (email && nama) {
                setSubmitBtn(true);
            } else {
                setSubmitBtn(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changePass]);

    const handleClickUbah = async () => {
        if (submitBtn) {
            const response = await fetch("/api/account", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    changePass ? { email, nama, sandi } : { email, nama }
                ),
            });
            const result = await response.json();
            if (response.status === 401) {
                setInfo(result.error);
                return setEror(result.error);
            }
            setChangePass(false);
            setInfo("Data berhasil diubah");
        }
    };

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
            <div style={{ flex: "1" }} className="p-5">
                <h1 className="text-xl font-bold">Akun Saya</h1>
                <p className="text-sm text-gray-500">
                    Berikut informasi mengenai akun saya
                </p>
                <hr className="my-5" />
                {info && (
                    <div className="p-4 mb-5 w-full sm:max-w-sm flex justify-center items-center border-2 border-indigo-500">
                        {info}
                    </div>
                )}
                <div className="mb-3">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                    >
                        Email
                    </label>
                    <div className="mt-2">
                        <input
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            value={email}
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label
                        htmlFor="nama"
                        className="block text-sm font-medium leading-6 text-gray-900"
                    >
                        Nama Panggilan
                    </label>
                    <div className="mt-2">
                        <input
                            onChange={(e) => {
                                setNama(e.target.value);
                            }}
                            value={nama}
                            id="nama"
                            name="nama"
                            type="text"
                            required
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
                {changePass && (
                    <>
                        <div className="mb-3">
                            <label
                                htmlFor="sandi"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Sandi Baru
                            </label>
                            <div className="mt-2">
                                <input
                                    onChange={(e) => {
                                        setSandi(e.target.value);
                                    }}
                                    value={sandi}
                                    name="sandi"
                                    type="password"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="confimsandi"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Konfirmasi Sandi Baru
                            </label>
                            <div className="mt-2">
                                <input
                                    onChange={(e) => {
                                        setConfirmSandi(e.target.value);
                                    }}
                                    value={confirmSandi}
                                    name="confirmsandi"
                                    type="password"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {!confirmPass && (
                                <p className="text-red-500 text-sm">
                                    Konfirmasi sandi masih salah
                                </p>
                            )}
                        </div>
                    </>
                )}

                <div className="flex justify-center mb-2 mt-5">
                    <button
                        onClick={() => {
                            setChangePass((prev) => !prev);
                        }}
                        className="font-bold text-indigo-600"
                    >
                        {changePass ? "Batal ganti sandi" : "Ganti sandi"}
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        className={
                            "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 " +
                            (submitBtn ? "hover:bg-indigo-500" : "btn-disabled")
                        }
                        onClick={handleClickUbah}
                    >
                        Ubah
                    </button>
                </div>
            </div>
            <NavbarBawah path="/account" />
        </div>
    );
}
