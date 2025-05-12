// app/api/login/route.ts
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const token = cookies().get("token")?.value;

    const fetchRooms = await fetch("https://omong.galihsuks.com/backend/room", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const responseRooms = await fetchRooms.json();

    if (fetchRooms.status != 200) {
        return NextResponse.json(
            { error: responseRooms.pesan },
            { status: fetchRooms.status }
        );
    }

    return NextResponse.json(responseRooms);
}
export async function POST(req: NextRequest) {
    const { nama } = await req.json();
    const token = cookies().get("token")?.value;

    const fetchRoom = await fetch("https://omong.galihsuks.com/backend/room", {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ nama }),
    });

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
