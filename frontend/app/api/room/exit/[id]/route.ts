import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = cookies().get("token")?.value;
    const fetchRooms = await fetch(
        `${process.env.BACKEND_URL}/room/exit/${params.id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
    const responseRooms = await fetchRooms.json();
    return NextResponse.json(responseRooms, { status: fetchRooms.status });
}
