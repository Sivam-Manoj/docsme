import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user's uploaded images (sorted by most recent first)
    const images = (user.uploadedImages || []).sort((a: any, b: any) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    console.error("Fetch images error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
