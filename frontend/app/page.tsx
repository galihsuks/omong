"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import imgLogo from "@/app/img/logo.svg";
import Image from "next/image";

export default function Home() {
    const router = useRouter();
    const [value, setValue] = useState({
        email: "",
        sandi: "",
    });
    const [eror, setEror] = useState<string>("");

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
        async function funFetchLogin() {
            const response = await fetch("/api/login", {
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
            router.push("/room");
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
                <div>
                    <Image src={imgLogo} alt="omong" width={200} />
                </div>
                {eror && (
                    <div className="p-5 w-full sm:max-w-sm flex justify-center items-center border-2 border-indigo-500">
                        {eror}
                    </div>
                )}
                <div className="w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleClick}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Email
                            </label>
                            <div className="mt-2">
                                <input
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
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Sandi
                                </label>
                                <div className="text-sm">
                                    <a
                                        href="#"
                                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        Lupa sandi?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    value={value.sandi}
                                    id="password"
                                    name="sandi"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    <p className="mt-10 text-center text-sm text-gray-500">
                        Bukan member?
                        <Link
                            href="/signup"
                            className="ms-1 font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                        >
                            Daftar disini
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
