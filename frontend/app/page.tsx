"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import imgLogo from "@/app/img/logo_white.svg";
import Image from "next/image";
import useUserStore from "@/store/userStore";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function Home() {
    const router = useRouter();
    const [value, setValue] = useState({
        email: "",
        sandi: "",
    });
    const [eror, setEror] = useState<string>("");
    const { email, setUser } = useUserStore();
    const emailRef = useRef<HTMLInputElement>(null);
    const sandiRef = useRef<HTMLInputElement>(null);
    const [showPass, setShowPass] = useState<boolean>(false);

    useEffect(() => {
        console.log(email);
        if (email) {
            router.push("/room");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    function handleLogin(e: SyntheticEvent) {
        e.preventDefault();
        setEror("");
        emailRef.current?.blur();
        sandiRef.current?.blur();
        async function funFetchLogin() {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(value),
            });
            const result = await response.json();
            if (response.status != 200) {
                return setEror(result.pesan);
            }
            setUser(result.id, result.email, result.nama, result.token);
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
                style={{
                    height: "100svh",
                    minHeight: "500px",
                    backgroundImage:
                        "linear-gradient(to right top, #4f46e5, #6f46e6, #8946e6, #a046e6, #b446e5)",
                }}
                className="flex justify-center items-center px-10"
            >
                <div
                    style={{ maxWidth: "450px" }}
                    className="w-full flex flex-col justify-center items-center"
                >
                    <div className="mb-4">
                        <p className="text-white font-bold mb-2">
                            Login Member
                        </p>
                        <Image src={imgLogo} alt="omong" width={200} />
                    </div>
                    {eror && (
                        <div
                            style={{
                                fontSize: "12px",
                                backgroundColor: "rgba(255, 0, 0, 0.1)",
                            }}
                            className="text-white font-semibold border border-red-500 px-4 py-2 rounded-md mt-2"
                        >
                            {eror}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="w-full mt-5">
                        <div className="formulir mb-5">
                            <label className="text-indigo-100">Email</label>
                            <div className="input flex items-center gap-3 px-3">
                                <HiOutlineMail />
                                <input
                                    value={value.email}
                                    type="email"
                                    name="email"
                                    required
                                    ref={emailRef}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="formulir mb-10">
                            <div className="flex justify-between w-full">
                                <label className="text-indigo-100">Sandi</label>
                                <p className="text-white font-bold hover:text-indigo-100">
                                    Lupa Sandi?
                                </p>
                            </div>
                            <div className="input flex items-center gap-3 px-3">
                                <RiLockPasswordLine />
                                <input
                                    value={value.sandi}
                                    type={showPass ? "text" : "password"}
                                    name="sandi"
                                    required
                                    ref={sandiRef}
                                    onChange={handleChange}
                                />
                                {showPass ? (
                                    <FaRegEyeSlash
                                        onClick={() => setShowPass(false)}
                                        style={{
                                            opacity: 1,
                                            cursor: "pointer",
                                        }}
                                    />
                                ) : (
                                    <FaRegEye
                                        onClick={() => setShowPass(true)}
                                        style={{
                                            opacity: 0.5,
                                            cursor: "pointer",
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                style={{
                                    borderRadius: "3em",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                }}
                                className="flex w-full justify-center text-white px-3 py-1.5 font-semibold hover:bg-indigo-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    <p className="mt-7 text-center text-indigo-100">
                        Bukan member?{" "}
                        <Link
                            href="/signup"
                            className="text-white font-bold hover:text-indigo-100"
                        >
                            Daftar disini
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
