import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, email, message } = await req.json();

    if (!documentId || !email) {
      return NextResponse.json(
        { error: "Document ID and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get document
    const document = await Document.findById(documentId);
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

    // Create shareable link if not public
    let shareableLink = document.shareableLink;
    if (!document.isPublic) {
      // Make document public for sharing
      document.isPublic = true;
      await document.save();
      shareableLink = document.shareableLink;
    }

    const shareUrl = `${process.env.NEXTAUTH_URL}/shared/${shareableLink}`;
    const senderName = session.user.name || "Docume AI User";
    const senderEmail = session.user.email || "noreply@documeai.com";

    // Send email via Resend
    const emailData = await resend.emails.send({
      from: "Docume AI <noreply@documeai.com>",
      to: email,
      replyTo: "noreply@documeai.com", // Prevent replies
      subject: `${senderName} shared "${document.title}" with you`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
              }
              .message {
                background: white;
                padding: 20px;
                border-left: 4px solid #667eea;
                border-radius: 8px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">📄 Document Shared</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">
                <strong>${senderName}</strong> has shared a document with you:
              </p>
              
              <h2 style="color: #667eea; margin-top: 20px;">${document.title}</h2>
              
              ${message ? `
                <div class="message">
                  <p style="margin: 0; color: #4b5563;"><strong>Message from ${senderName}:</strong></p>
                  <p style="margin: 10px 0 0 0; color: #1f2937;">${message}</p>
                </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${shareUrl}" class="button">
                  View Document
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Or copy this link: <br>
                <a href="${shareUrl}" style="color: #667eea; word-break: break-all;">${shareUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent from Docume AI. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Docume AI. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: emailData.data?.id,
    });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
