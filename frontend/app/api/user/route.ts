// app/api/login/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const token = cookies().get("token")?.value;
    const fetchRooms = await fetch(`${process.env.BACKEND_URL}/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const responseRooms = await fetchRooms.json();
    return NextResponse.json(responseRooms, { status: fetchRooms.status });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(`${process.env.BACKEND_URL}/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(body),
    });
    const responseRoom = await fetchRoom.json();
    return NextResponse.json(responseRoom, { status: fetchRoom.status });
}
export async function DELETE(req: NextRequest) {
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(`${process.env.BACKEND_URL}/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "DELETE",
    });
    const responseRoom = await fetchRoom.json();
    return NextResponse.json(responseRoom, { status: fetchRoom.status });
}
