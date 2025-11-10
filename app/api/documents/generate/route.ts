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

    const {
      prompt,
      documentType,
      effort = "medium",
      verbosity = "medium",
    } = await req.json();

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

    // Generate document content with OpenAI (Streaming)
    const systemPrompt = `You are a professional document writer. Generate a well-structured, professional document based on the user's prompt. 
    Format the document with proper HTML formatting for structure.
    Make it comprehensive and ready to use for ${
      documentType || "general purpose"
    }.
    Use proper HTML tags like <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em> for formatting.`;

    const stream = await openai.responses.stream({
      model: "gpt-5",
      input: prompt,
      instructions: systemPrompt,
      reasoning: { effort: effort as "minimal" | "low" | "medium" | "high" },
      text: {
        verbosity: verbosity as "low" | "medium" | "high",
      },
      stream: true,
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    let fullContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            // Listen for output_text.delta events
            if (event.type === "response.output_text.delta") {
              const text = (event as any).delta || "";
              fullContent += text;

              // Send chunk to client
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: text, done: false })}\n\n`
                )
              );
            }
          }

          // Save the document after streaming completes

          // Generate unique shareable link
          const shareableLink = crypto.randomBytes(16).toString("hex");

          // Create document
          const newDocument = await DocumentModel.create({
            title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
            content: fullContent,
            userId: user._id,
            shareableLink,
          });

          // Update user's document count
          user.documentsCreated += 1;
          await user.save();

          // Send final message with document ID
          const documentData = {
            id: (newDocument as any)._id.toString(),
            title: newDocument.title,
            shareableLink: newDocument.shareableLink,
          };

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                content: "",
                done: true,
                document: documentData,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error: any) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: error.message,
                done: true,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Document generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate document" },
      { status: 500 }
    );
  }
}
