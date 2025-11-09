"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { AIRewritePanel } from "@/components/editor/ai-rewrite-panel";
import { SharePanel } from "@/components/editor/share-panel";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { TiptapToolbar } from "@/components/editor/tiptap-toolbar";

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
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const isInitialLoadRef = useRef(true);

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
      const fetchedDoc = response.data.document;

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
      setIsSaved(true);
      isInitialLoadRef.current = true;
    } catch (error) {
      toast.error("Failed to fetch document");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document || !resolvedParams || isSaving) return;

    setIsSaving(true);
    try {
      await axios.patch(`/api/documents/${resolvedParams.id}`, {
        title: document.title,
        content: document.content,
        styling: document.styling,
      });
      setIsSaved(true);
      toast.success("Document saved!");
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage = error.response?.data?.error || "Failed to save document";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Track changes and mark as unsaved
  useEffect(() => {
    if (!document) return;
    
    // Skip the first render after loading document
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    
    setIsSaved(false);
  }, [document?.content, document?.title]);

  const handleAIRewrite = async (instruction: string) => {
    if (!document) return;

    setIsRewriting(true);
    try {
      const response = await axios.post("/api/documents/rewrite", {
        content: document.content,
        instruction: instruction,
        selectedText: selectedText || undefined,
      });

      if (selectedText && editorInstance) {
        // Replace selected text with Markdown content
        const markdownContent = response.data.rewrittenContent;
        editorInstance
          .chain()
          .focus()
          .deleteSelection()
          .insertContent(markdownContent)
          .run();
      } else {
        // Replace entire document content with Markdown
        const markdownContent = response.data.rewrittenContent;
        setDocument({ ...document, content: markdownContent });
      }

      toast.success("Content rewritten!");
      setSelectedText("");
    } catch (error) {
      toast.error("Failed to rewrite content");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleShare = async (password?: string) => {
    if (!document || !resolvedParams) return;

    try {
      const updateData: any = { isPublic: true };
      if (password) {
        updateData.password = password;
      }

      await axios.patch(`/api/documents/${resolvedParams.id}`, updateData);
      setDocument({ ...document, isPublic: true });
      toast.success("Document is now shareable!");
    } catch (error) {
      toast.error("Failed to update sharing settings");
    }
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

  if (status === "loading" || isLoading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Top Toolbar */}
      <EditorToolbar
        title={document.title}
        isSaving={isSaving}
        isSaved={isSaved}
        onTitleChange={(title) => setDocument({ ...document, title })}
        onSave={handleSave}
        onToggleShare={() => setShowShareDialog(!showShareDialog)}
        onDownloadPDF={downloadAsPDF}
        onDownloadImage={downloadAsImage}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid lg:grid-cols-[1fr_320px] gap-2 sm:gap-4 p-2 sm:p-4">
          {/* Editor Canvas */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Sticky Tiptap Formatting Toolbar */}
            {editorInstance && (
              <div className="sticky top-0 z-10 bg-white border-b">
                <TiptapToolbar
                  editor={editorInstance}
                  fontSize={document.styling.fontSize}
                  fontFamily={document.styling.fontFamily}
                  textColor={document.styling.textColor}
                  backgroundColor={document.styling.backgroundColor}
                  onFontSizeChange={(size) =>
                    setDocument({
                      ...document,
                      styling: { ...document.styling, fontSize: size },
                    })
                  }
                  onFontFamilyChange={(family) =>
                    setDocument({
                      ...document,
                      styling: { ...document.styling, fontFamily: family },
                    })
                  }
                  onTextColorChange={(color) =>
                    setDocument({
                      ...document,
                      styling: { ...document.styling, textColor: color },
                    })
                  }
                  onBackgroundColorChange={(color) =>
                    setDocument({
                      ...document,
                      styling: { ...document.styling, backgroundColor: color },
                    })
                  }
                />
              </div>
            )}

            {/* Tiptap Editor */}
            <div ref={contentRef}>
              <TiptapEditor
                content={document.content}
                onChange={(html) => setDocument({ ...document, content: html })}
                onSelectionChange={setSelectedText}
                onEditorReady={setEditorInstance}
                fontSize={document.styling.fontSize}
                fontFamily={document.styling.fontFamily}
                textColor={document.styling.textColor}
                backgroundColor={document.styling.backgroundColor}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            {/* AI Rewrite Panel */}
            <AIRewritePanel
              selectedText={selectedText}
              isRewriting={isRewriting}
              onRewrite={handleAIRewrite}
            />

            {/* Share Panel */}
            {showShareDialog && (
              <SharePanel
                isPublic={document.isPublic}
                shareableLink={document.shareableLink}
                onMakePublic={handleShare}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
