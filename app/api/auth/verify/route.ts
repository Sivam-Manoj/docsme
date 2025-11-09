import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const verificationToken = await VerificationToken.findOne({ token });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      await VerificationToken.deleteOne({ token });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const user = await User.findOne({ email: verificationToken.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.isVerified = true;
    user.emailVerified = new Date();
    await user.save();

    await VerificationToken.deleteOne({ token });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json(
      { message: "Email verified successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
