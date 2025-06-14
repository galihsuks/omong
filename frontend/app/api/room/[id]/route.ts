import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(
        `${process.env.BACKEND_URL}/room/${params.id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        }
    );
    const responseRoom = await fetchRoom.json();
    return NextResponse.json(responseRoom, { status: fetchRoom.status });
}
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(
        `${process.env.BACKEND_URL}/room/${params.id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify(body),
        }
    );
    const responseRoom = await fetchRoom.json();
    return NextResponse.json(responseRoom, { status: fetchRoom.status });
}
