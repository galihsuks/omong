// app/api/login/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(
        `${process.env.BACKEND_URL}/room/join/${params.id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
    const responseRoom = await fetchRoom.json();
    return NextResponse.json(responseRoom, { status: fetchRoom.status });
}
