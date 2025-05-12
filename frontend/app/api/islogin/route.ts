import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const token = cookies().get("token")?.value;

    if (token) {
        const fetchRooms = await fetch(
            "https://omong.galihsuks.com/backend/user",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        // const responseRooms = await fetchRooms.json();
        if (fetchRooms.status != 200) {
            return NextResponse.json({ data: "Tidak login" }, { status: 401 });
        }
        return NextResponse.json({ data: "Sudah login" }, { status: 200 });
    }
    return NextResponse.json({ data: "Tidak login" }, { status: 401 });
}
