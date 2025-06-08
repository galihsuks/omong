import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const token = cookies().get("token")?.value;
    const fetchLogin = await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    const responseLogin = await fetchLogin.json();
    if (fetchLogin.status != 200) {
        return NextResponse.json(responseLogin, { status: fetchLogin.status });
    }
    const response = NextResponse.json(responseLogin, { status: 200 });
    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60,
    });
    return response;
}
