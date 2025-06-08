// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, sandi, nama } = await req.json();
    const fetchSignup = await fetch(`${process.env.BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, sandi, nama }),
    });
    const responseSignup = await fetchSignup.json();
    return NextResponse.json(responseSignup, { status: fetchSignup.status });
}
