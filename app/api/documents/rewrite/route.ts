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

    const systemPrompt = `You are a professional document editor. Rewrite the provided text according to the user's instructions while maintaining the overall structure and meaning. 

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

Return ONLY Markdown. No HTML tags. No explanations.`;

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
