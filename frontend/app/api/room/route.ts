// app/api/login/route.ts
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const token = cookies().get("token")?.value;
    const fetchRooms = await fetch(`${process.env.BACKEND_URL}/room`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    const responseRooms = await fetchRooms.json();
    return NextResponse.json(responseRooms, { status: fetchRooms.status });
}
export async function POST(req: NextRequest) {
    const body = await req.json();
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(`${process.env.BACKEND_URL}/room`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
    });
    const responseRoom = await fetchRoom.json();
    return NextResponse.json(responseRoom, { status: fetchRoom.status });
}
