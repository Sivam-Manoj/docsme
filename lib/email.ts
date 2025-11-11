import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to docsme AI! 🚀</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Thank you for signing up! We're excited to have you on board.</p>
                <p>Please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${confirmLink}" class="button">Verify Email</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${confirmLink}</p>
                <p>This link will expire in 24 hours.</p>
              </div>
              <div class="footer">
                <p>© 2024 docsme AI. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "Welcome to docsme AI! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>You're All Set! 🎉</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Your email has been verified successfully! You can now access all features of docsme AI.</p>
                <h3>What you can do:</h3>
                <div class="feature">
                  <strong>✨ Generate Documents</strong><br/>
                  Create professional documents with AI assistance
                </div>
                <div class="feature">
                  <strong>🎨 Edit with Canvas</strong><br/>
                  Customize your documents with our powerful editor
                </div>
                <div class="feature">
                  <strong>🔗 Share & Collaborate</strong><br/>
                  Share documents with password protection
                </div>
                <div class="feature">
                  <strong>📥 Export Anywhere</strong><br/>
                  Download as PDF or share as a link
                </div>
                <p style="margin-top: 30px;">Ready to create your first document?</p>
              </div>
              <div class="footer">
                <p>© 2024 docsme AI. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}
