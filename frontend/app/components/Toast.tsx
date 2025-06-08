"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface ToastProps {
    judul: string;
    subjudul: string;
    api?: string;
    callbackurl?: string;
    openState: any;
    show: boolean;
}

const Toast: React.FC<ToastProps> = ({
    judul,
    subjudul,
    api,
    callbackurl,
    openState,
    show,
}) => {
    const router = useRouter();
    function handleClick() {
        async function funFetchOut() {
            const response = await fetch(api ? api : "");
            const result = await response.json();
            console.log("hasil fetch api toast : ", result);
            router.replace(callbackurl ? callbackurl : "/");
        }
        funFetchOut();
    }

    return (
        <div className={`toast ${show ? "show" : ""}`}>
            <div className="container-toast px-5 py-4">
                <h1 className="font-bold">{judul}</h1>
                <p>{subjudul}</p>
                <hr className="my-3" />
                <div className="flex gap-1">
                    {api && (
                        <button
                            onClick={handleClick}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Ok
                        </button>
                    )}
                    <button
                        onClick={openState}
                        className="flex w-full justify-center rounded-md border border-black px-3 py-1.5 text-sm font-semibold hover:border-indigo-600"
                    >
                        {api ? "Batal" : "Ok"}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Toast;
