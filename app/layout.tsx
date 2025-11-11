import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "docsme AI - AI-Powered Document Generation",
    template: "%s | docsme AI",
  },
  description: "Create professional documents instantly with AI assistance. Generate, edit, share, and collaborate seamlessly with advanced AI-powered document creation.",
  keywords: [
    "AI document generation",
    "document creation",
    "AI writing assistant",
    "document editor",
    "AI content generator",
    "professional documents",
    "automated documentation",
    "smart document creation",
    "docsme AI",
    "AI-powered writing",
  ],
  authors: [{ name: "docsme AI" }],
  creator: "docsme AI",
  publisher: "docsme AI",
  applicationName: "docsme AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "docsme AI - AI-Powered Document Generation",
    description: "Create professional documents instantly with AI assistance. Generate, edit, share, and collaborate seamlessly.",
    siteName: "docsme AI",
    images: [
      {
        url: "/cardImage.png",
        width: 1200,
        height: 630,
        alt: "docsme AI - AI-Powered Document Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "docsme AI - AI-Powered Document Generation",
    description: "Create professional documents instantly with AI assistance. Generate, edit, share, and collaborate seamlessly.",
    images: ["/cardImage.png"],
    creator: "@docsmeAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
