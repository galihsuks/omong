"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import imgLogo from "@/app/img/logo_white.svg";
import { HiOutlineMail } from "react-icons/hi";
import { RiLetterSpacing2, RiLockPasswordLine } from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import useUserStore from "@/store/userStore";

export default function Signup() {
    const router = useRouter();
    const [value, setValue] = useState({
        email: "",
        nama: "",
        sandi: "",
        confirmsandi: "",
    });
    const { email } = useUserStore();
    const [eror, setEror] = useState<string>("");
    const [showPass, setShowPass] = useState<boolean>(false);
    const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
    const emailRef = useRef<HTMLInputElement>(null);
    const namaRef = useRef<HTMLInputElement>(null);
    const sandiRef = useRef<HTMLInputElement>(null);
    const confirmSandiRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (email) {
            router.push("/room");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleClick(e: SyntheticEvent) {
        e.preventDefault();
        setEror("");
        emailRef.current?.blur();
        namaRef.current?.blur();
        sandiRef.current?.blur();
        confirmSandiRef.current?.blur();
        if (value.confirmsandi != value.sandi) {
            return setEror("Konfirmasi sandi tidak sesuai");
        }
        async function funFetchLogin() {
            const response = await fetch("/api/auth/signup", {
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
            setEror(result.pesan);
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
                style={{
                    height: "100svh",
                    minHeight: "600px",
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
                            Register Member
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
                    <form onSubmit={handleClick} className="w-full mt-5">
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
                        <div className="formulir mb-5">
                            <label className="text-indigo-100">Nama</label>
                            <div className="input flex items-center gap-3 px-3">
                                <RiLetterSpacing2 />
                                <input
                                    value={value.nama}
                                    type="text"
                                    name="nama"
                                    required
                                    ref={namaRef}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="formulir mb-5">
                            <label className="text-indigo-100">Sandi</label>
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
                        <div className="formulir mb-10">
                            <label className="text-indigo-100">
                                Konfirmasi Sandi
                            </label>
                            <div className="input flex items-center gap-3 px-3">
                                <RiLockPasswordLine />
                                <input
                                    value={value.confirmsandi}
                                    type={showConfirmPass ? "text" : "password"}
                                    name="confirmsandi"
                                    required
                                    ref={confirmSandiRef}
                                    onChange={handleChange}
                                />
                                {showConfirmPass ? (
                                    <FaRegEyeSlash
                                        onClick={() =>
                                            setShowConfirmPass(false)
                                        }
                                        style={{
                                            opacity: 1,
                                            cursor: "pointer",
                                        }}
                                    />
                                ) : (
                                    <FaRegEye
                                        onClick={() => setShowConfirmPass(true)}
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
                                Daftar
                            </button>
                        </div>
                    </form>
                    <p className="mt-7 text-center text-indigo-100">
                        Sudah pernah daftar?{" "}
                        <Link
                            href="/"
                            className="text-white font-bold hover:text-indigo-100"
                        >
                            Login disini
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
