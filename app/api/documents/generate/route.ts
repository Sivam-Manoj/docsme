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
      images = [],
      pdf = null,
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
    const systemPrompt = `You are a professional document writer with expertise in creating visually rich, data-driven documents. Generate a well-structured, professional document based on the user's prompt. 
    
    Format the document with proper HTML formatting for structure.
    Make it comprehensive and ready to use for ${documentType || "general purpose"}.
    
    **IMPORTANT STYLING GUIDELINES:**
    - Use proper HTML tags like <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em> for formatting.
    - When the document includes business data, statistics, or numerical comparisons, CREATE VISUAL CHARTS AND GRAPHS using inline HTML/CSS.
    - For charts, use styled HTML divs with gradients, bars, and visual elements (NOT canvas or external libraries).
    - Create beautiful bar charts, progress bars, or data tables with proper styling.
    - Use modern CSS with gradients (linear-gradient), shadows, borders, and colors.
    - Make charts visually appealing with violet/purple/pink color schemes.
    
    **CHART FORMAT EXAMPLES:**
    For data visualization, create charts like this:
    <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0; max-width: 600px;">
      <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px;">Chart Title</h3>
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 13px; font-weight: 600; color: #374151;">Label</span>
          <span style="font-size: 13px; font-weight: 700; color: #8b5cf6;">Value</span>
        </div>
        <div style="width: 100%; height: 24px; background: #f3f4f6; border-radius: 6px; overflow: hidden;">
          <div style="height: 100%; width: 75%; background: linear-gradient(90deg, #8b5cf6, #a78bfa);"></div>
        </div>
      </div>
    </div>
    
    **WHEN TO USE CHARTS:**
    - Business reports with KPIs or metrics
    - Financial data or revenue comparisons
    - Survey results or statistics
    - Performance comparisons
    - Any quantitative data that benefits from visualization
    
    Make the document visually engaging, professional, and data-driven when appropriate.`;

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.log("🚀 Starting document generation...");
      console.log("📝 Config:", {
        model: "gpt-5",
        effort,
        verbosity,
        documentType,
        promptLength: prompt.length,
      });
    }

    // Build input array with text and files
    const inputContent: any[] = [
      {
        type: "input_text",
        text: prompt,
      },
    ];

    // Add PDF file if provided
    if (pdf && pdf.data) {
      inputContent.push({
        type: "input_file",
        filename: pdf.filename,
        file_data: pdf.data,
      });
      
      if (isDev) {
        console.log("📄 PDF attached:", pdf.filename);
      }
    }

    // Add image files if provided
    if (images && images.length > 0) {
      images.forEach((img: any) => {
        inputContent.push({
          type: "input_file",
          filename: img.filename,
          file_data: img.data,
        });
      });
      
      if (isDev) {
        console.log(`🖼️ ${images.length} image(s) attached`);
      }
    }

    let stream;
    try {
      stream = await openai.responses.stream({
        model: "gpt-5",
        input: [
          {
            role: "user",
            content: inputContent,
          },
        ],
        instructions: systemPrompt,
        reasoning: {
          effort: effort as "minimal" | "low" | "medium" | "high",
          summary: "auto",
        },
        text: {
          verbosity: verbosity as "low" | "medium" | "high",
        },
        stream: true,
      });

      if (isDev) {
        console.log("✅ Stream initialized successfully");
      }
    } catch (streamError: any) {
      if (isDev) {
        console.error("❌ Failed to initialize stream:", {
          message: streamError.message,
          status: streamError.status,
          code: streamError.code,
          type: streamError.type,
          error: streamError.error,
        });
      }
      throw streamError;
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    let fullContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let eventCount = 0;
          let reasoningCount = 0;
          let contentCount = 0;

          if (isDev) {
            console.log("📡 Starting stream processing...");
          }

          for await (const event of stream) {
            eventCount++;

            // Log all event types in dev mode with FULL event details (first 30 events)
            if (isDev && eventCount <= 30) {
              console.log(`📨 Event #${eventCount}:`, {
                type: event.type,
                hasData: !!(event as any).delta || !!(event as any).text,
                fullEvent: event, // Log the complete event object
              });
            }

            // Check for reasoning output item
            if (
              event.type === "response.output_item.added" ||
              event.type === "response.output_item.done"
            ) {
              const item = (event as any).item;
              if (item && item.type === "reasoning") {
                if (isDev) {
                  console.log(`🧠 REASONING ITEM ${event.type}:`, {
                    id: item.id,
                    hasSummary: Array.isArray(item.summary),
                    summaryLength: Array.isArray(item.summary)
                      ? item.summary.length
                      : 0,
                    summary: item.summary,
                  });
                }

                // If summary is populated, send it to client
                if (Array.isArray(item.summary) && item.summary.length > 0) {
                  const summaryText = item.summary
                    .map((s: any) => s.text || s)
                    .join(" ");

                  if (summaryText && isDev) {
                    console.log(`🧠 Reasoning summary found:`, {
                      length: summaryText.length,
                      preview: summaryText.slice(0, 100),
                    });
                  }

                  if (summaryText) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          reasoning: summaryText,
                          done: false,
                        })}\n\n`
                      )
                    );
                  }
                }
              }
            }

            // Listen for reasoning summary delta events (if they exist)
            if (event.type === "response.reasoning_summary_text.delta") {
              reasoningCount++;
              const reasoningText = (event as any).delta || "";

              if (isDev && reasoningCount <= 5) {
                console.log(`🧠 Reasoning delta #${reasoningCount}:`, {
                  length: reasoningText.length,
                  preview: reasoningText.slice(0, 50),
                });
              }

              // Send reasoning chunk to client
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    reasoning: reasoningText,
                    done: false,
                  })}\n\n`
                )
              );
            }

            // Listen for output_text.delta events
            if (event.type === "response.output_text.delta") {
              contentCount++;
              const text = (event as any).delta || "";
              fullContent += text;

              if (isDev && contentCount <= 5) {
                console.log(`✍️ Content chunk #${contentCount}:`, {
                  length: text.length,
                  totalLength: fullContent.length,
                  preview: text.slice(0, 50),
                });
              }

              // Send chunk to client
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: text, done: false })}\n\n`
                )
              );
            }
          }

          if (isDev) {
            console.log("✅ Stream completed:", {
              totalEvents: eventCount,
              reasoningChunks: reasoningCount,
              contentChunks: contentCount,
              finalContentLength: fullContent.length,
            });
          }

          // Save the document after streaming completes
          if (isDev) {
            console.log("💾 Saving document to database...");
          }

          // Generate unique shareable link
          const shareableLink = crypto.randomBytes(16).toString("hex");

          // Create document
          const newDocument = await DocumentModel.create({
            title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
            content: fullContent,
            userId: user._id,
            shareableLink,
          });

          if (isDev) {
            console.log("✅ Document saved:", {
              id: (newDocument as any)._id.toString(),
              title: newDocument.title,
              contentLength: fullContent.length,
            });
          }

          // Update user's document count
          user.documentsCreated += 1;
          await user.save();

          if (isDev) {
            console.log(
              "✅ User document count updated:",
              user.documentsCreated
            );
          }

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

          if (isDev) {
            console.log(
              "🎉 Generation complete! Document ID:",
              documentData.id
            );
          }

          controller.close();
        } catch (error: any) {
          if (isDev) {
            console.error("❌ Streaming error details:", {
              message: error.message,
              status: error.status,
              code: error.code,
              type: error.type,
              headers: error.headers,
              requestID: error.requestID,
              error: error.error,
              stack: error.stack,
            });
          } else {
            console.error("Streaming error:", error.message);
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: error.message || "Failed to generate document",
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
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.error("❌ Document generation error (top level):", {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        headers: error.headers,
        requestID: error.requestID,
        error: error.error,
        stack: error.stack,
      });
    } else {
      console.error("Document generation error:", error.message);
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate document" },
      { status: 500 }
    );
  }
}
