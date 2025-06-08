// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, sandi } = await req.json();

    const fetchLogin = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, sandi }),
    });

    const responseLogin = await fetchLogin.json();

    if (fetchLogin.status != 200) {
        return NextResponse.json(responseLogin, { status: fetchLogin.status });
    }
    // return NextResponse.json(responseLogin, {
    //     status: fetchLogin.status,
    //     headers: {
    //         // Remove Max-Age and Expires to make it a session cookie (expires when browser closes)
    //         // But to make it "never expire", set a far future Expires date
    //         "Set-Cookie": `token=${responseLogin.token}; HttpOnly; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`,
    //     },
    // });
    const response = NextResponse.json(responseLogin, { status: 200 });
    response.cookies.set("token", responseLogin.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60,
    });
    return response;
    // return NextResponse.json(responseLogin, {
    //     status: 200,
    //     headers: {
    //         "Set-Cookie": `token=${responseLogin.token}; HttpOnly; Path=/; Max-Age=86400`,
    //     },
    // });
}
