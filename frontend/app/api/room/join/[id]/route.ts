// app/api/login/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(
        "https://omong.galihsuks.com/backend/room/join/" + params.id,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const responseRoom = await fetchRoom.json();

    if (responseRoom.pesan) {
        return NextResponse.json(
            { error: responseRoom.pesan },
            { status: 401 }
        );
    }

    // Set token in cookies (this works in server context)
    return NextResponse.json({ data: responseRoom }, { status: 200 });
}
