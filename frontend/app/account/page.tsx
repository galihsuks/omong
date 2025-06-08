"use client";

import { useEffect, useState } from "react";
import NavbarAtas from "../components/NavbarAtas";
import NavbarBawah from "../components/NavbarBawah";
import { useRouter } from "next/navigation";
import { HiOutlineMail } from "react-icons/hi";
import { RiLetterSpacing2, RiLockPasswordLine } from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import useUserStore from "@/store/userStore";

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
    const { clearUser } = useUserStore();

    useEffect(() => {
        async function fetchDataRoom() {
            const response = await fetch("/api/user");
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
            const response = await fetch("/api/user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    changePass ? { email, nama, sandi } : { email, nama }
                ),
            });
            const result = await response.json();
            console.log(result);
            if (response.status === 401) {
                clearUser();
                return router.replace("/");
            }
            setChangePass(false);
            setInfo(result.pesan);
            setInfo("Data berhasil diubah");
        }
    };

    return (
        <div className="konten">
            {eror && (
                <div
                    style={{ flex: "1", borderRadius: "3em" }}
                    className="p-5 flex justify-center items-center"
                >
                    {eror}
                </div>
            )}
            <div style={{ flex: "1" }} className="px-5 pt-5 flex flex-col">
                <NavbarAtas />
                <div style={{ flex: "1" }} className="p-5 text-white">
                    <div
                        style={{
                            flex: 1,
                            overflowY: "scroll",
                            position: "relative",
                            height: "100%",
                        }}
                        className="hidden-scrollbar"
                    >
                        <div
                            className="py-2"
                            style={{
                                position: "absolute",
                                width: "100%",
                            }}
                        >
                            <h1 className="text-lg font-bold">Akun Saya</h1>
                            <p className="text-indigo-200 mb-6">
                                Berikut informasi mengenai akun saya
                            </p>
                            {info && (
                                <div
                                    style={{ borderRadius: "1em" }}
                                    className="p-4 mb-5 w-full flex justify-center items-center border-2 border-indigo-500"
                                >
                                    {info}
                                </div>
                            )}
                            <div className="formulir mb-5">
                                <label className="text-indigo-100">Email</label>
                                <div className="input flex items-center gap-3 px-3">
                                    <HiOutlineMail />
                                    <input
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                        }}
                                        value={email}
                                        type="email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="formulir mb-5">
                                <label className="text-indigo-100">Nama</label>
                                <div className="input flex items-center gap-3 px-3">
                                    <RiLetterSpacing2 />
                                    <input
                                        onChange={(e) => {
                                            setNama(e.target.value);
                                        }}
                                        value={nama}
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>
                            {changePass && (
                                <>
                                    <div className="formulir mb-5">
                                        <label className="text-indigo-100">
                                            Sandi
                                        </label>
                                        <div className="input flex items-center gap-3 px-3">
                                            <RiLockPasswordLine />
                                            <input
                                                onChange={(e) => {
                                                    setSandi(e.target.value);
                                                }}
                                                value={sandi}
                                                type="password"
                                                name="sandi"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="formulir mb-1">
                                        <label className="text-indigo-100">
                                            Konfirmasi Sandi
                                        </label>
                                        <div className="input flex items-center gap-3 px-3">
                                            <RiLockPasswordLine />
                                            <input
                                                onChange={(e) => {
                                                    setConfirmSandi(
                                                        e.target.value
                                                    );
                                                }}
                                                value={confirmSandi}
                                                type="password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    {!confirmPass && (
                                        <p className="text-red-300">
                                            Konfirmasi sandi masih salah
                                        </p>
                                    )}
                                </>
                            )}

                            <div className="flex justify-center mb-2 mt-5">
                                <button
                                    onClick={() => {
                                        setChangePass((prev) => !prev);
                                    }}
                                    className="text-white font-semibold"
                                >
                                    <p>
                                        {changePass
                                            ? "Batal ganti sandi"
                                            : "Ganti sandi"}
                                    </p>
                                </button>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    style={{
                                        borderRadius: "3em",
                                    }}
                                    className={`flex w-full justify-center px-3 py-1.5 font-semibold ${
                                        submitBtn
                                            ? "bg-indigo-500 hover:bg-indigo-700"
                                            : "opacity-30 bg-indigo-100 text-indigo-600"
                                    }`}
                                    // className={
                                    //     "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 " +
                                    //     (submitBtn ? "hover:bg-indigo-500" : "btn-disabled")
                                    // }
                                    onClick={handleClickUbah}
                                >
                                    Ubah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NavbarBawah path="/account" />
        </div>
    );
}
