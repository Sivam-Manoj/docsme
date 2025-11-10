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
import { EmailShareModal } from "@/components/editor/email-share-modal";

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
  const [showEmailModal, setShowEmailModal] = useState(false);
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

  // Auto-trigger download if coming from dashboard
  useEffect(() => {
    if (!document || !editorInstance) return;

    const params = new URLSearchParams(window.location.search);
    const downloadFormat = params.get('download');
    const autoDownload = sessionStorage.getItem('autoDownload');

    if (downloadFormat || autoDownload) {
      const format = downloadFormat || autoDownload;
      
      // Clear the session storage
      sessionStorage.removeItem('autoDownload');
      
      // Remove query param from URL without reload
      window.history.replaceState({}, '', `/editor/${resolvedParams?.id}`);

      // Trigger download after a short delay to ensure content is rendered
      setTimeout(() => {
        if (format === 'pdf') {
          downloadAsPDF();
        } else if (format === 'image') {
          downloadAsImage();
        }
      }, 1000);
    }
  }, [document, editorInstance]);

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
    if (!contentRef.current || !document) {
      toast.error("Document not ready");
      return;
    }

    const toastId = toast.loading("Generating PDF...");

    try {
      // Wait for any pending renders
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get the element to convert
      const element = contentRef.current;
      
      // Create canvas with better options
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: document.styling?.backgroundColor || "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if content is longer
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `${document.title.replace(/[^a-z0-9]/gi, '_') || "document"}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("PDF download error:", error);
      toast.error(error.message || "Failed to download PDF. Please try again.", { id: toastId });
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
        onEmailShare={() => setShowEmailModal(true)}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid lg:grid-cols-[1fr_320px] gap-3 sm:gap-4 p-2 sm:p-3 lg:p-4">
          {/* Editor Canvas */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden order-2 lg:order-1">
            {/* Sticky Tiptap Formatting Toolbar */}
            {editorInstance && (
              <div className="sticky top-0 z-20 bg-white border-b">
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
          <div className="space-y-3 sm:space-y-4 order-1 lg:order-2 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            {/* AI Rewrite Panel - Compact on Mobile */}
            <div className="lg:block">
              <AIRewritePanel
                selectedText={selectedText}
                isRewriting={isRewriting}
                onRewrite={handleAIRewrite}
              />
            </div>

            {/* Share Panel - Compact on Mobile */}
            {showShareDialog && (
              <div className="lg:block">
                <SharePanel
                  isPublic={document.isPublic}
                  shareableLink={document.shareableLink}
                  onMakePublic={handleShare}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Share Modal */}
      <EmailShareModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        documentId={resolvedParams?.id || ""}
        documentTitle={document.title}
      />
    </div>
  );
}
