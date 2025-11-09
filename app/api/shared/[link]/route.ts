import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DocumentModel from "@/models/Document";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ link: string }> }
) {
  try {
    const { link } = await params;
    const { password } = await req.json();

    await connectDB();

    const document = await DocumentModel.findOne({
      shareableLink: link,
    }).select("+password");

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check password if document is protected
    if (document.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required", requiresPassword: true },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, document.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Increment views
    document.views += 1;
    await document.save();

    // Return document without password
    const docData = document.toObject();
    delete docData.password;

    return NextResponse.json({ document: docData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shared document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ link: string }> }
) {
  try {
    const { link } = await params;

    await connectDB();

    const document = await DocumentModel.findOne({
      shareableLink: link,
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if password protected
    const docWithPassword = await DocumentModel.findOne({
      shareableLink: link,
    }).select("+password");
    
    const hasPassword = !!docWithPassword?.password;

    if (hasPassword) {
      return NextResponse.json(
        { requiresPassword: true },
        { status: 200 }
      );
    }

    // Increment views
    document.views += 1;
    await document.save();

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shared document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
