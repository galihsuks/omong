import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { nama } = await req.json();
    const token = cookies().get("token")?.value;

    const fetchRoom = await fetch(
        "https://omong.galihsuks.com/backend/room/updateroom/" + params.id,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ nama }),
        }
    );

    const responseRoom = await fetchRoom.json();

    if (fetchRoom.status != 200) {
        return NextResponse.json(
            { error: responseRoom.pesan },
            { status: 401 }
        );
    }
    // Set token in cookies (this works in server context)
    return NextResponse.json({ data: responseRoom }, { status: 200 });
}
