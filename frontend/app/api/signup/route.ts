// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, sandi, nama } = await req.json();

    const fetchSignup = await fetch(
        "https://omong.galihsuks.com/backend/user/signup",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, sandi, nama }),
        }
    );

    const responseSignup = await fetchSignup.json();

    if (!responseSignup.email) {
        return NextResponse.json(
            { error: responseSignup.pesan },
            { status: 401 }
        );
    }

    // Set token in cookies (this works in server context)
    return NextResponse.json(
        { data: "Pendaftaran berhasil, silahkan login" },
        { status: 200 }
    );
}
