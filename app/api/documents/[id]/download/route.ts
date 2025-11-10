import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { format } = await req.json();

    await connectDB();

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user owns the document
    if (document.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // For now, return document data for client-side processing
    // In production, you might want to generate PDF server-side
    return NextResponse.json({
      success: true,
      document: {
        title: document.title,
        content: document.content,
        styling: document.styling,
      },
      format,
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download document" },
      { status: 500 }
    );
  }
}
