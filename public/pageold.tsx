"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Save,
  Share2,
  Download,
  Sparkles,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Loader2,
  Lock,
  Unlock,
  Copy,
  Check,
  Menu,
  X,
  Home,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DocumentData {
  _id: string;
  title: string;
  content: string;
  shareableLink: string;
  isPublic: boolean;
  styling: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
    backgroundColor: string;
    textAlign: "left" | "center" | "right" | "justify";
  };
}

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (resolvedParams && session) {
      fetchDocument();
    }
  }, [resolvedParams, session]);

  const fetchDocument = async () => {
    if (!resolvedParams) return;

    try {
      const response = await axios.get(`/api/documents/${resolvedParams.id}`);
      setDocument(response.data.document);
    } catch (error) {
      toast.error("Failed to fetch document");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document || !resolvedParams) return;

    setIsSaving(true);
    try {
      await axios.patch(`/api/documents/${resolvedParams.id}`, {
        title: document.title,
        content: document.content,
        styling: document.styling,
      });
      toast.success("Document saved!");
    } catch (error) {
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIRewrite = async () => {
    if (!aiPrompt.trim() && !selectedText) {
      toast.error("Please select text or enter a prompt");
      return;
    }

    setIsRewriting(true);
    try {
      const response = await axios.post("/api/documents/rewrite", {
        content: document?.content,
        instruction: aiPrompt,
        selectedText: selectedText || undefined,
      });

      if (selectedText && document) {
        // Replace selected text with rewritten content
        const newContent = document.content.replace(
          selectedText,
          response.data.rewrittenContent
        );
        setDocument({ ...document, content: newContent });
      } else if (document) {
        // Replace entire content
        setDocument({ ...document, content: response.data.rewrittenContent });
      }

      toast.success("Content rewritten!");
      setAiPrompt("");
      setSelectedText("");
    } catch (error) {
      toast.error("Failed to rewrite content");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleShare = async () => {
    if (!document || !resolvedParams) return;

    try {
      const updateData: any = {
        isPublic: true,
      };

      if (sharePassword) {
        updateData.password = sharePassword;
      }

      await axios.patch(`/api/documents/${resolvedParams.id}`, updateData);

      setDocument({ ...document, isPublic: true });
      toast.success("Document is now shareable!");
    } catch (error) {
      toast.error("Failed to update sharing settings");
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/shared/${document?.shareableLink}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: document?.styling.backgroundColor || "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${document?.title || "document"}.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const downloadAsImage = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: document?.styling.backgroundColor || "#ffffff",
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement("a");
          link.href = url;
          link.download = `${document?.title || "document"}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Image downloaded!");
        }
      });
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    }
  };

  if (status === "loading" || isLoading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Vertical Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 text-white transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          sidebarExpanded ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 shrink-0" />
            {sidebarExpanded && <span className="font-bold text-xl">DocAI</span>}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="hidden lg:flex hover:bg-white/10 p-2 rounded transition-colors"
              title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarExpanded ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:bg-white/10 p-2 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
            title="Dashboard"
          >
            <Home className="w-5 h-5 shrink-0" />
            {sidebarExpanded && <span className="font-medium">Dashboard</span>}
          </button>
          
          {sidebarExpanded && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                Document Info
              </div>
              
              <div className="px-4 py-2 space-y-2 text-sm">
                <div className="text-white/80">
                  <span className="text-white/60">Title:</span>
                  <p className="font-medium mt-1 truncate">{document?.title || "Untitled"}</p>
                </div>
                <div className="text-white/80">
                  <span className="text-white/60">Status:</span>
                  <p className="font-medium mt-1">
                    {document?.isPublic ? (
                      <span className="inline-flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                Actions
              </div>
            </>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left disabled:opacity-50"
            title={isSaving ? "Saving..." : "Save Document"}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            ) : (
              <Save className="w-5 h-5 shrink-0" />
            )}
            {sidebarExpanded && (
              <span className="font-medium">{isSaving ? "Saving..." : "Save Document"}</span>
            )}
          </button>

          <button
            onClick={downloadAsPDF}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
            title="Download PDF"
          >
            <Download className="w-5 h-5 shrink-0" />
            {sidebarExpanded && <span className="font-medium">Download PDF</span>}
          </button>

          <button
            onClick={downloadAsImage}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
            title="Download PNG"
          >
            <Download className="w-5 h-5 shrink-0" />
            {sidebarExpanded && <span className="font-medium">Download PNG</span>}
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">{session?.user?.name?.charAt(0) || "U"}</span>
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-white/60 truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Editor Toolbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <Input
              value={document.title}
              onChange={(e) =>
                setDocument({ ...document, title: e.target.value })
              }
              className="max-w-xs sm:max-w-md font-semibold border-0 focus:ring-0 text-base sm:text-lg"
              placeholder="Document Title"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowShareDialog(!showShareDialog)}
              variant="outline"
              size="sm"
            >
              <Share2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 p-4">
            {/* Editor Canvas */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Formatting Toolbar */}
              <div className="border-b border-gray-200 p-3 flex flex-wrap gap-2 items-center bg-gray-50 sticky top-0 z-10">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border-r pr-3 mr-2">
                  <Button
                    size="sm"
                    variant={viewMode === "edit" ? "default" : "outline"}
                    onClick={() => setViewMode("edit")}
                    className="h-8"
                  >
                    <Edit3 className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "preview" ? "default" : "outline"}
                    onClick={() => setViewMode("preview")}
                    className="h-8"
                  >
                    <Eye className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 border-r pr-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  <select
                    value={document.styling.fontSize}
                    onChange={(e) =>
                      setDocument({
                        ...document,
                        styling: {
                          ...document.styling,
                          fontSize: Number(e.target.value),
                        },
                      })
                    }
                    className="text-sm border rounded px-2 py-1"
                  >
                    {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 border-r pr-2">
                  <select
                    value={document.styling.fontFamily}
                    onChange={(e) =>
                      setDocument({
                        ...document,
                        styling: {
                          ...document.styling,
                          fontFamily: e.target.value,
                        },
                      })
                    }
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 border-r pr-2">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <input
                    type="color"
                    value={document.styling.textColor}
                    onChange={(e) =>
                      setDocument({
                        ...document,
                        styling: {
                          ...document.styling,
                          textColor: e.target.value,
                        },
                      })
                    }
                    className="w-8 h-8 border rounded cursor-pointer"
                  />
                  <input
                    type="color"
                    value={document.styling.backgroundColor}
                    onChange={(e) =>
                      setDocument({
                        ...document,
                        styling: {
                          ...document.styling,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    className="w-8 h-8 border rounded cursor-pointer"
                  />
                </div>

                {viewMode === "edit" && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={"outline"}
                      onClick={() => {
                        // Insert selected text wrapped with alignment
                        if (selectedText) {
                          const newContent = document.content.replace(
                            selectedText,
                            `<div style="text-align: left;">${selectedText}</div>`
                          );
                          setDocument({ ...document, content: newContent });
                        }
                      }}
                      title="Align selected text left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={"outline"}
                      onClick={() => {
                        if (selectedText) {
                          const newContent = document.content.replace(
                            selectedText,
                            `<div style="text-align: center;">${selectedText}</div>`
                          );
                          setDocument({ ...document, content: newContent });
                        }
                      }}
                      title="Align selected text center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={"outline"}
                      onClick={() => {
                        if (selectedText) {
                          const newContent = document.content.replace(
                            selectedText,
                            `<div style="text-align: right;">${selectedText}</div>`
                          );
                          setDocument({ ...document, content: newContent });
                        }
                      }}
                      title="Align selected text right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={"outline"}
                      onClick={() => {
                        if (selectedText) {
                          const newContent = document.content.replace(
                            selectedText,
                            `<div style="text-align: justify;">${selectedText}</div>`
                          );
                          setDocument({ ...document, content: newContent });
                        }
                      }}
                      title="Align selected text justify"
                    >
                      <AlignJustify className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div
                ref={contentRef}
                className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-16rem)]"
                style={{
                  backgroundColor: document.styling.backgroundColor,
                }}
              >
                {viewMode === "edit" ? (
                  <textarea
                    value={document.content}
                    onChange={(e) =>
                      setDocument({ ...document, content: e.target.value })
                    }
                    onMouseUp={handleTextSelection}
                    style={{
                      fontSize: `${document.styling.fontSize}px`,
                      fontFamily: document.styling.fontFamily,
                      color: document.styling.textColor,
                    }}
                    className="w-full h-full min-h-[calc(100vh-18rem)] outline-none resize-none bg-transparent text-left"
                    placeholder="Start writing or use AI to generate content..."
                  />
                ) : (
                  <div
                    className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
                    style={{
                      fontSize: `${document.styling.fontSize}px`,
                      fontFamily: document.styling.fontFamily,
                      color: document.styling.textColor,
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-6">
                            <table
                              className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg overflow-hidden"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-gradient-to-r from-violet-50 to-purple-50" {...props} />
                        ),
                        tbody: ({ node, ...props }) => (
                          <tbody className="divide-y divide-gray-200 bg-white" {...props} />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr className="hover:bg-gray-50 transition-colors" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-300"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-200" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-3xl font-bold mt-6 mb-3 text-gray-900" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-2xl font-semibold mt-5 mb-2 text-gray-900" {...props} />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4 className="text-xl font-semibold mt-4 mb-2 text-gray-900" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-4 leading-relaxed" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-4" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-violet-500 pl-4 py-2 my-4 italic bg-gray-50 rounded-r"
                            {...props}
                          />
                        ),
                        code: ({ node, inline, ...props }: any) =>
                          inline ? (
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />
                          ) : (
                            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
                          ),
                        pre: ({ node, ...props }) => (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a className="text-violet-600 hover:text-violet-800 underline" {...props} />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr className="my-8 border-gray-300" {...props} />
                        ),
                      }}
                    >
                      {document.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              {/* AI Rewrite Panel */}
              <Card className="p-4 shadow-md">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  AI Rewrite
                </h3>
                {selectedText && (
                  <div className="mb-2 p-2 bg-violet-50 rounded text-xs">
                    <strong>Selected:</strong> {selectedText.slice(0, 50)}...
                  </div>
                )}
                <Input
                  placeholder="e.g., Make it more professional..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="mb-2"
                />
                <Button
                  onClick={handleAIRewrite}
                  disabled={isRewriting}
                  size="sm"
                  className="w-full"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Rewrite
                    </>
                  )}
                </Button>
              </Card>

              {/* Share Panel */}
              {showShareDialog && (
                <Card className="p-4 shadow-md">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-violet-600" />
                    Share Document
                  </h3>

                  {document.isPublic ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                        <Unlock className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Public</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={`${window.location.origin}/shared/${document.shareableLink}`}
                          readOnly
                          className="text-xs"
                        />
                        <Button size="sm" onClick={copyShareLink}>
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <Lock className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Private</span>
                      </div>
                      <Input
                        type="password"
                        placeholder="Optional password"
                        value={sharePassword}
                        onChange={(e) => setSharePassword(e.target.value)}
                      />
                      <Button
                        onClick={handleShare}
                        size="sm"
                        className="w-full"
                      >
                        Make Public
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
