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
import { TiptapViewer } from "@/components/shared/tiptap-viewer";

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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-xl border border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Document Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              This document doesn't exist or has been deleted.
            </p>
            <Link href="/">
              <Button className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                Go to Docume AI
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-linear-to-r from-violet-600 to-purple-600 p-2.5 rounded-xl shadow-lg shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                  {document.title || "Untitled Document"}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{document.views} {document.views === 1 ? 'view' : 'views'}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium">
                    Shared Document
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
                >
                  <FileText className="w-4 h-4" />
                  Create Your Own
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="sm:hidden bg-white hover:bg-gray-50 border-gray-300"
                >
                  Create
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Document Toolbar */}
          <div className="bg-linear-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-violet-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">Live Document</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Font: {document.styling.fontFamily}</span>
                <span>Size: {document.styling.fontSize}px</span>
              </div>
            </div>
          </div>

          {/* Document Body */}
          <div 
            className="p-6 sm:p-8 lg:p-12 overflow-y-auto"
            style={{
              backgroundColor: document.styling.backgroundColor,
              minHeight: '60vh'
            }}
          >
            <TiptapViewer
              content={document.content}
              fontSize={document.styling.fontSize}
              fontFamily={document.styling.fontFamily}
              textColor={document.styling.textColor}
              backgroundColor={document.styling.backgroundColor}
              textAlign={document.styling.textAlign}
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 sm:mt-12 text-center">
          <Card className="border-2 border-violet-200 bg-linear-to-br from-violet-50 to-purple-50 overflow-hidden">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-linear-to-r from-violet-600 to-purple-600 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl text-gray-900 mb-2">
                    Create Your Own AI Documents
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                    Generate professional documents instantly with Docume AI's powerful AI technology
                  </p>
                </div>
                <Link href="/auth/register">
                  <Button 
                    size="lg" 
                    className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
