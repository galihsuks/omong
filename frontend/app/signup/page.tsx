"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import imgLogo from "@/app/img/logo.svg";

export default function Signup() {
    const router = useRouter();
    const [value, setValue] = useState({
        email: "",
        nama: "",
        sandi: "",
        confirmsandi: "",
    });
    const [eror, setEror] = useState<string>("");
    const [showSandi, setShowSandi] = useState(false);

    useEffect(() => {
        async function cekLogin() {
            const cekIsLogin = await fetch("/api/islogin");
            if (cekIsLogin.status === 200) return router.replace("/room");
        }
        cekLogin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleClick(e: SyntheticEvent) {
        setEror("");
        e.preventDefault();
        if (value.confirmsandi != value.sandi) {
            return setEror("Konfirmasi sandi tidak sesuai");
        }
        async function funFetchLogin() {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(value),
            });

            const result = await response.json();
            console.log(result);
            if (response.status === 401) {
                return setEror(result.error);
            }
            setEror(result.data);
            setValue({
                email: "",
                nama: "",
                sandi: "",
                confirmsandi: "",
            });
        }
        funFetchLogin();
    }

    function handleChange(e: React.FormEvent<HTMLInputElement>) {
        setValue({
            ...value,
            [e.currentTarget.name]: e.currentTarget.value,
        });
    }

    return (
        <>
            <div
                style={{ height: "100svh" }}
                className="flex gap-3 flex-col justify-center items-center px-6 py-12 lg:px-8"
            >
                <div className="flex flex-col items-center">
                    <div>
                        <Image src={imgLogo} alt="omong" width={200} />
                    </div>
                    <p className="text-gray-500 text-sm">
                        Isi form dibawah untuk mendaftar
                    </p>
                </div>
                {eror && (
                    <div className="p-5 w-full sm:max-w-sm flex justify-center items-center border-2 border-indigo-500">
                        {eror}
                    </div>
                )}
                <div className="w-full sm:max-w-sm">
                    <form onSubmit={handleClick}>
                        <div className="flex flex-col gap-2 mb-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Email
                                </label>
                                <div>
                                    <input
                                        required
                                        value={value.email}
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="nama"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Nama
                                </label>
                                <div>
                                    <input
                                        required
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
                                <label
                                    htmlFor="sandi"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Sandi
                                </label>
                                <div>
                                    <input
                                        required
                                        value={value.sandi}
                                        id="sandi"
                                        name="sandi"
                                        type={showSandi ? "text" : "password"}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="confirmsandi"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Konfirmasi Sandi
                                </label>
                                <div>
                                    <input
                                        required
                                        value={value.confirmsandi}
                                        id="confirmsandi"
                                        name="confirmsandi"
                                        type={showSandi ? "text" : "password"}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="checkbox"
                                    id="show-sandi"
                                    onChange={() => {
                                        setShowSandi((prev) => !prev);
                                    }}
                                />
                                <label htmlFor="show-sandi" className="text-sm">
                                    Tampilkan sandi dan confirm sandi
                                </label>
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Daftar
                            </button>
                        </div>
                    </form>
                    <p className="mt-10 text-center text-sm text-gray-500">
                        Sudah pernah daftar?
                        <Link
                            href="/"
                            className="ms-1 font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                        >
                            Login disini
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
