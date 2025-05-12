import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { email } = await req.json();
    const token = cookies().get("token")?.value;

    const fetchRoom = await fetch(
        "https://omong.galihsuks.com/backend/room/join" + params.id,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ email }),
        }
    );

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

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = cookies().get("token")?.value;
    const fetchRoom = await fetch(
        "https://omong.galihsuks.com/backend/room/getroom/" + params.id,
        {
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const responseRoom: any = await fetchRoom.json();
    if (responseRoom.pesan) {
        return NextResponse.json(
            { error: responseRoom.pesan },
            { status: 401 }
        );
    }

    const fetchRooms = await fetch(
        "https://omong.galihsuks.com/backend/room/chat/" + params.id,
        {
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const responseRooms = await fetchRooms.json();
    if (responseRooms.pesan) {
        return NextResponse.json(
            { error: responseRooms.pesan },
            { status: 401 }
        );
    }

    const fetchUserCur = await fetch(
        "https://omong.galihsuks.com/backend/user",
        {
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const responseUserCur = await fetchUserCur.json();
    if (responseUserCur.pesan) {
        return NextResponse.json(
            { error: responseUserCur.pesan },
            { status: 401 }
        );
    }

    return NextResponse.json(
        {
            data: {
                responseRoom,
                responseRooms,
                responseUserCur,
            },
        },
        { status: 200 }
    );
}
