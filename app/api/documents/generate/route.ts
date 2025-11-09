import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import DocumentModel from "@/models/Document";
import OpenAI from "openai";
import crypto from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, documentType } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check subscription limits
    const limits = {
      free: 5,
      pro: 100,
      enterprise: 999999,
    };

    if (
      user.documentsCreated >= limits[user.subscription?.plan || "free"] &&
      user.subscription?.plan !== "enterprise"
    ) {
      return NextResponse.json(
        {
          error:
            "Document limit reached. Please upgrade your plan to continue.",
        },
        { status: 403 }
      );
    }

    // Generate document content with OpenAI
    const systemPrompt = `You are a professional document writer. Generate a well-structured, professional document based on the user's prompt. 
    Format the document with proper headings, paragraphs, and sections. 
    Make it comprehensive and ready to use for ${
      documentType || "general purpose"
    }.
    Use markdown-like formatting for structure but output plain text with line breaks.`;

    const completion = await openai.responses.create({
      model: "gpt-5",
      input: prompt,
      instructions: systemPrompt,
      reasoning: { effort: "medium" },
      text: {
        verbosity: "high",
      },
    });

    const generatedContent = completion?.output_text || "";

    // Generate unique shareable link
    const shareableLink = crypto.randomBytes(16).toString("hex");

    // Create document
    const document = await DocumentModel.create({
      title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
      content: generatedContent,
      userId: user._id,
      shareableLink,
    });

    // Update user's document count
    user.documentsCreated += 1;
    await user.save();

    return NextResponse.json(
      {
        message: "Document generated successfully!",
        document: {
          id: document._id,
          title: document.title,
          content: document.content,
          shareableLink: document.shareableLink,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Document generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate document" },
      { status: 500 }
    );
  }
}
