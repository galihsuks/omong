import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { filter: string } }
) {
    const body = await req.json();
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(
        `${process.env.BACKEND_URL}/user/getby/${params.filter}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(body),
        }
    );
    const responseRoom = await fetchRoom.json();
    return NextResponse.json(responseRoom, { status: fetchRoom.status });
}
