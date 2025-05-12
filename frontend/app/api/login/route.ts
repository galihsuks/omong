// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, sandi } = await req.json();

    const fetchLogin = await fetch(
        "https://omong.galihsuks.com/backend/user/login",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, sandi }),
        }
    );
    console.log(fetchLogin);

    const responseLogin = await fetchLogin.json();

    if (!responseLogin.token) {
        return NextResponse.json(
            { error: responseLogin.pesan },
            { status: 401 }
        );
    }

    // Set token in cookies (this works in server context)
    return NextResponse.json(
        { token: responseLogin.token },
        {
            status: 200,
            headers: {
                "Set-Cookie": `token=${responseLogin.token}; HttpOnly; Path=/; Max-Age=86400`,
            },
        }
    );
}
