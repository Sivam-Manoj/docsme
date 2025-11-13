import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 client (Cloudflare R2 is S3-compatible)
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${timestamp}.${fileExtension}`;
    const key = `documeai/user-images/${session.user.id}/${uniqueFileName}`;

    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Generate public URL
    const imageUrl = `${PUBLIC_URL}/${key}`;

    // Save to user's uploadedImages
    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newImage = {
      _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: imageUrl,
      filename: file.name,
      uploadedAt: new Date(),
    };

    if (!user.uploadedImages) {
      user.uploadedImages = [];
    }

    user.uploadedImages.push(newImage as any);
    await user.save();

    return NextResponse.json({ success: true, image: newImage });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
