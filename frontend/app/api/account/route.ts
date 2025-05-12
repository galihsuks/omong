// app/api/login/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const token = cookies().get("token")?.value;

    const fetchRooms = await fetch("https://omong.galihsuks.com/backend/user", {
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

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const token = cookies().get("token")?.value;

    const fetchRoom = await fetch("https://omong.galihsuks.com/backend/user", {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(body),
    });

    const responseRoom = await fetchRoom.json();

    if (fetchRoom.status != 200) {
        return NextResponse.json(
            { error: responseRoom.pesan },
            { status: 401 }
        );
    }

    return NextResponse.json({ data: responseRoom }, { status: 200 });
}
