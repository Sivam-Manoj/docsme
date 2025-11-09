"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Lock, Loader2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";

interface DocumentData {
  _id: string;
  title: string;
  content: string;
  views: number;
  styling: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
    backgroundColor: string;
    textAlign: "left" | "center" | "right" | "justify";
  };
}

export default function SharedDocumentPage({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ link: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      checkDocument();
    }
  }, [resolvedParams]);

  const checkDocument = async () => {
    if (!resolvedParams) return;

    try {
      const response = await axios.get(`/api/shared/${resolvedParams.link}`);

      if (response.data.requiresPassword) {
        setRequiresPassword(true);
        setIsLoading(false);
      } else {
        const fetchedDoc = response.data.document;
        // Normalize styling to ensure all properties exist
        const normalizedDoc = {
          ...fetchedDoc,
          styling: {
            fontSize: fetchedDoc.styling?.fontSize || 16,
            fontFamily: fetchedDoc.styling?.fontFamily || "Arial",
            textColor: fetchedDoc.styling?.textColor || "#000000",
            backgroundColor: fetchedDoc.styling?.backgroundColor || "#ffffff",
            textAlign: fetchedDoc.styling?.textAlign || "left",
          },
        };
        setDocument(normalizedDoc);
        setIsLoading(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Document not found");
      setIsLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedParams) return;

    setIsUnlocking(true);
    try {
      const response = await axios.post(`/api/shared/${resolvedParams.link}`, {
        password,
      });

      const fetchedDoc = response.data.document;
      // Normalize styling to ensure all properties exist
      const normalizedDoc = {
        ...fetchedDoc,
        styling: {
          fontSize: fetchedDoc.styling?.fontSize || 16,
          fontFamily: fetchedDoc.styling?.fontFamily || "Arial",
          textColor: fetchedDoc.styling?.textColor || "#000000",
          backgroundColor: fetchedDoc.styling?.backgroundColor || "#ffffff",
          textAlign: fetchedDoc.styling?.textAlign || "left",
        },
      };
      setDocument(normalizedDoc);
      setRequiresPassword(false);
      toast.success("Document unlocked!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid password");
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Protected Document</CardTitle>
            <CardDescription>
              This document is password protected. Enter the password to view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isUnlocking}>
                {isUnlocking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  "Unlock Document"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                Go to Docume AI
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Document Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              This document doesn't exist or has been deleted.
            </p>
            <Link href="/">
              <Button>Go to Docume AI</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{document.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="w-3 h-3" />
                <span>{document.views} views</span>
              </div>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              Create Your Own
            </Button>
          </Link>
        </div>
      </div>

      {/* Document Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          className="bg-white rounded-lg shadow-lg p-8 md:p-12"
          style={{
            backgroundColor: document.styling.backgroundColor,
          }}
        >
          <MarkdownRenderer
            content={document.content}
            fontSize={document.styling.fontSize}
            fontFamily={document.styling.fontFamily}
            textColor={document.styling.textColor}
          />
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <Card className="border-2 border-violet-200">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-bold text-xl mb-2">
                Create Your Own AI Documents
              </h3>
              <p className="text-gray-600 mb-4">
                Generate professional documents instantly with Docume AI
              </p>
              <Link href="/auth/register">
                <Button size="lg">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
