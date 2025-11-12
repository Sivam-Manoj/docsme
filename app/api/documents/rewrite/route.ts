import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, instruction, selectedText } = await req.json();

    if (!content && !selectedText) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const textToRewrite = selectedText || content;

    const systemPrompt = `You are a professional document editor with expertise in creating visually rich, data-driven content. Rewrite the provided text according to the user's instructions while maintaining the overall structure and meaning. 

IMPORTANT: Return the content in Markdown format that supports:
- Headings: # Heading 1, ## Heading 2, ### Heading 3
- Bold: **bold text**
- Italic: *italic text* or _italic text_
- Lists: - item or 1. item
- Links: [text](url)
- Code: \`inline code\` or \`\`\`language code block\`\`\`
- Blockquotes: > quote text
- Tables: | Header | Header |
- Task lists: - [ ] task or - [x] done

**VISUAL ENHANCEMENTS:**
- If the content contains business data, statistics, or comparisons, INCLUDE styled HTML charts/graphs using inline CSS
- Use modern HTML/CSS with gradients, shadows, and visual styling
- Create bar charts, progress indicators, or styled data tables when appropriate
- Use violet/purple/pink color schemes for professional look

**Example chart format (use when data is present):**
<div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0; max-width: 600px;">
  <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">Chart Title</h3>
  <div style="margin-bottom: 12px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
      <span style="font-size: 13px; font-weight: 600;">Label</span>
      <span style="font-size: 13px; font-weight: 700; color: #8b5cf6;">Value</span>
    </div>
    <div style="width: 100%; height: 24px; background: #f3f4f6; border-radius: 6px;">
      <div style="height: 100%; width: 80%; background: linear-gradient(90deg, #8b5cf6, #a78bfa);"></div>
    </div>
  </div>
</div>

Return Markdown with embedded HTML for visual elements when appropriate. No additional explanations.`;

    const userPrompt = instruction
      ? `Instruction: ${instruction}\n\nText to rewrite (return as Markdown):\n${textToRewrite}`
      : `Improve and refine this text (return as Markdown with proper formatting):\n${textToRewrite}`;

    const result = await openai.responses.create({
      model: "gpt-5",
      reasoning: { effort: "minimal" },
      input: userPrompt,
      instructions: systemPrompt,
    });

    const rewrittenContent = result?.output_text || "";

    return NextResponse.json(
      {
        rewrittenContent,
        selectedText: selectedText || null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Rewrite error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rewrite content" },
      { status: 500 }
    );
  }
}
