import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = cookies().get("token")?.value;
    const fetchRooms = await fetch(
        "https://omong.galihsuks.com/backend/room/exit/" + params.id,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const responseRooms = await fetchRooms.json();

    if (fetchRooms.status != 200) {
        return NextResponse.json(
            { error: responseRooms.pesan },
            { status: fetchRooms.status }
        );
    }

    return NextResponse.json(responseRooms);
}
