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
    const response = NextResponse.json(responseLogin, { status: 200 });
    response.cookies.set("token", responseLogin.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date("9999-12-31T23:59:59.000Z"),
    });
    // response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
        "Access-Control-Allow-Origin",
        "https://omong.galihsuks.com"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    return response;
}
