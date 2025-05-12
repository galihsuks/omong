// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    // Set token in cookies (this works in server context)
    return NextResponse.json(
        { pesan: "berhasil logout" },
        {
            status: 200,
            headers: {
                "Set-Cookie": `token=${""}; HttpOnly; Path=/; Max-Age=86400`,
            },
        }
    );
}
