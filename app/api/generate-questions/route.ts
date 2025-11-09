import { auth } from "@/auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, docType } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Ask AI to generate relevant questions based on the prompt using structured output
    const response = await openai.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
      input: `You are an expert at analyzing document requirements and generating relevant clarifying questions.
      
      Document type: ${docType}
      User's prompt: ${prompt}
      
      Based on this prompt, generate 5-7 specific questions that would help gather more detailed information to create a comprehensive document.
      
      Questions should be:
      - Specific to the prompt context
      - Help clarify technical requirements, scope, timeline, budget, features and anything else that is important to the document or other important details
      - Mix of yes/no questions and open-ended questions
      - Practical and actionable`,
      text: {
        format: {
          type: "json_schema",
          name: "questions_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      minLength: 1,
                    },
                    question: {
                      type: "string",
                      minLength: 1,
                    },
                    type: {
                      type: "string",
                      enum: ["text", "yesno"],
                    },
                  },
                  required: ["id", "question", "type"],
                  additionalProperties: false,
                },
                minItems: 5,
                maxItems: 7,
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    });

    // Extract structured JSON response
    const output = response?.output_text || "{}";
    const data = JSON.parse(output);

    if (!data?.questions) {
      return NextResponse.json(
        { error: "No questions generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: data.questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
