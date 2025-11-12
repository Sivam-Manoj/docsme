"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Sparkles, X, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { AIRewritePanel } from "@/components/editor/ai-rewrite-panel";
import { SharePanel } from "@/components/editor/share-panel";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { TiptapToolbar } from "@/components/editor/tiptap-toolbar";
import { EmailShareModal } from "@/components/editor/email-share-modal";
import { ChartGenerator } from "@/components/editor/chart-generator";
import { ImageUploader } from "@/components/editor/image-uploader";
import { ContextMenu } from "@/components/editor/context-menu";

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
  const [showChartModal, setShowChartModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
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
        } else if (format === 'docx') {
          downloadAsDocx();
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

  const handleInsertChart = (chartHtml: string) => {
    if (!editorInstance) return;
    
    // Insert HTML content with parseOptions to ensure it's rendered as HTML
    editorInstance
      .chain()
      .focus()
      .insertContent(chartHtml, {
        parseOptions: {
          preserveWhitespace: 'full',
        },
      })
      .run();
    setShowChartModal(false);
  };

  const handleInsertImage = (imageData: { src: string; alt: string; caption?: string }) => {
    if (!editorInstance) return;
    
    // Insert image as a proper node using insertContent
    // Remove inline styles - let CSS handle styling
    editorInstance
      .chain()
      .focus()
      .insertContent(`<img src="${imageData.src}" alt="${imageData.alt}" />`)
      .enter()
      .run();
    
    // If there's a caption, add it as italic text
    if (imageData.caption) {
      editorInstance
        .chain()
        .insertContent(`<p><em>${imageData.caption}</em></p>`)
        .run();
    }
    
    setShowImageModal(false);
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
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the element to convert
      const element = contentRef.current;
      
      // Clone element and fix unsupported color functions
      const clone = element.cloneNode(true) as HTMLElement;
      window.document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.width = `${element.offsetWidth}px`;
      
      // Replace unsupported color functions (lab, lch, oklab, etc.)
      const allElements = clone.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        
        // Fix color, background-color, border-color
        ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
          const value = computedStyle[prop as any];
          if (value && (value.includes('lab') || value.includes('lch') || value.includes('oklab'))) {
            // Convert to RGB fallback
            htmlEl.style[prop as any] = 'rgb(0, 0, 0)';
          }
        });
      });
      
      // Detect if mobile for optimized settings
      const isMobile = window.innerWidth < 768;
      
      // Create canvas with mobile-optimized options
      const canvas = await html2canvas(clone, {
        scale: isMobile ? 1.5 : 2, // Lower scale on mobile to avoid memory issues
        useCORS: true,
        allowTaint: true,
        backgroundColor: document.styling?.backgroundColor || "#ffffff",
        logging: false,
        removeContainer: false, // Keep container for cleanup
        imageTimeout: 0,
        ignoreElements: (element) => {
          return element.classList?.contains('no-print') || false;
        },
        onclone: (clonedDoc) => {
          // Remove any borders from the cloned document
          const clonedContent = clonedDoc.querySelector('[data-pdf-content]');
          if (clonedContent) {
            const elem = clonedContent as HTMLElement;
            elem.style.border = 'none';
            elem.style.outline = 'none';
            elem.style.boxShadow = 'none';
            
            // Remove borders from ProseMirror editor
            const prosemirror = elem.querySelector('.ProseMirror');
            if (prosemirror) {
              (prosemirror as HTMLElement).style.border = 'none';
              (prosemirror as HTMLElement).style.outline = 'none';
            }
            
            // Remove borders from all children
            const allChildren = elem.querySelectorAll('*');
            allChildren.forEach((child) => {
              const el = child as HTMLElement;
              if (el.style.border && el.style.border.includes('2px')) {
                el.style.border = 'none';
              }
              if (el.style.outline) {
                el.style.outline = 'none';
              }
            });
          }
        },
      });

      // Remove clone
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }

      // Convert canvas to image with quality based on device
      const imgData = canvas.toDataURL("image/png", isMobile ? 0.9 : 1.0);
      
      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // 10mm margin
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Calculate image dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let heightLeft = imgHeight;
      let position = margin;
      let pageNumber = 0;

      // Add pages
      while (heightLeft > 0 || pageNumber === 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        // Calculate the source Y position for this page
        const sourceY = pageNumber * contentHeight * (canvas.width / contentWidth);
        const sourceHeight = Math.min(
          contentHeight * (canvas.width / contentWidth),
          canvas.height - sourceY
        );

        // Only add image if there's content to show
        if (sourceHeight > 0) {
          // Calculate the portion of the image to show on this page
          const yPosition = margin;
          const heightToShow = Math.min(contentHeight, heightLeft);
          
          if (pageNumber === 0) {
            // First page - show from top
            pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
          } else {
            // Subsequent pages - offset the image
            const offsetY = yPosition - (pageNumber * contentHeight);
            pdf.addImage(imgData, "PNG", margin, offsetY, imgWidth, imgHeight);
          }
        }

        heightLeft -= contentHeight;
        pageNumber++;

        // Safety break to avoid infinite loop
        if (pageNumber > 50) break;
      }

      // Save the PDF
      const fileName = `${document.title.replace(/[^a-z0-9\s]/gi, '_').trim() || "document"}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF downloaded!", { id: toastId });
    } catch (error: any) {
      console.error("PDF download error:", error);
      
      // Provide more helpful error messages
      let errorMessage = "Failed to download PDF";
      if (error.message?.includes("memory") || error.message?.includes("canvas")) {
        errorMessage = "Document too large. Try reducing content or images.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: toastId, duration: 4000 });
    }
  };

  const downloadAsDocx = async () => {
    if (!editorInstance || !document) {
      toast.error("Document not ready");
      return;
    }

    try {
      const toastId = toast.loading("Preparing DOCX file...");
      
      // Get HTML content from editor
      const htmlContent = editorInstance.getHTML();
      
      // Create a simple DOCX-like structure
      // For a more robust solution, you'd use the 'docx' library
      // For now, we'll create an HTML file that Word can open as DOCX
      const docContent = `
        <!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset='utf-8'>
          <title>${document.title}</title>
          <style>
            body { font-family: ${document.styling.fontFamily}; font-size: ${document.styling.fontSize}px; color: ${document.styling.textColor}; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;
      
      // Create blob and download
      const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      const fileName = `${document.title.replace(/[^a-z0-9\s]/gi, '_').trim() || "document"}.docx`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("DOCX downloaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("DOCX download error:", error);
      toast.error(error.message || "Failed to download DOCX. Please try again.");
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
        onDownloadDocx={downloadAsDocx}
        onEmailShare={() => setShowEmailModal(true)}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className={`${showAIPanel ? 'lg:grid lg:grid-cols-[1fr_360px]' : ''} gap-4 p-2 sm:p-3 lg:p-4 max-w-[1400px] mx-auto`}>
          {/* Editor Canvas */}
          <div className="bg-white rounded-lg shadow-sm flex flex-col">
            {/* Sticky Tiptap Formatting Toolbar */}
            {editorInstance && (
              <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
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
                  onInsertChart={() => setShowChartModal(true)}
                  onInsertImage={() => setShowImageModal(true)}
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
            <div className="flex-1 overflow-y-auto">
              <div ref={contentRef} data-pdf-content>
                <TiptapEditor
                  content={document.content}
                  onChange={(html) => setDocument({ ...document, content: html })}
                  onSelectionChange={setSelectedText}
                  onEditorReady={setEditorInstance}
                  onRewriteClick={(selectedText) => {
                    setSelectedText(selectedText);
                    setShowAIPanel(true);
                  }}
                  fontSize={document.styling.fontSize}
                  fontFamily={document.styling.fontFamily}
                  textColor={document.styling.textColor}
                  backgroundColor={document.styling.backgroundColor}
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Desktop (toggleable) */}
          {showAIPanel && (
            <div className="hidden lg:flex flex-col sticky top-4 self-start max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border bg-white shadow-sm">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between rounded-t-lg">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  <span>Rewrite with AI</span>
                  <button
                    title="Select any text in your document to rewrite, improve, expand, or transform it using AI. The AI will help you enhance your content based on your instructions."
                    className="text-gray-400 hover:text-violet-600 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <AIRewritePanel
                  selectedText={selectedText}
                  isRewriting={isRewriting}
                  onRewrite={handleAIRewrite}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile AI Panel - Floating Button */}
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Toggle AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>

        {/* Desktop AI Panel - Floating Button (when closed) */}
        {!showAIPanel && (
          <button
            onClick={() => setShowAIPanel(true)}
            className="hidden lg:flex fixed bottom-6 right-6 z-30 px-4 h-11 items-center gap-2 rounded-full bg-gray-900 text-white shadow-xl hover:bg-gray-800"
            aria-label="Open AI Rewrite"
          >
            <Sparkles className="w-5 h-5 text-violet-300" />
            <span className="text-sm font-medium">Rewrite with AI</span>
          </button>
        )}

        {/* Mobile AI Panel - Side Drawer */}
        {showAIPanel && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setShowAIPanel(false)}
            />
            {/* Drawer */}
            <div className="lg:hidden fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto">
              <div className="sticky top-0 bg-linear-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Rewrite with AI</span>
                  <button
                    title="Select any text in your document to rewrite, improve, expand, or transform it using AI. The AI will help you enhance your content based on your instructions."
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </h2>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <AIRewritePanel
                  selectedText={selectedText}
                  isRewriting={isRewriting}
                  onRewrite={handleAIRewrite}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Share Dialog Modal */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-linear-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Document
              </h2>
              <button
                onClick={() => setShowShareDialog(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6">
              <SharePanel
                isPublic={document.isPublic}
                shareableLink={document.shareableLink}
                onMakePublic={handleShare}
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Share Modal */}
      <EmailShareModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        documentId={resolvedParams?.id || ""}
        documentTitle={document.title}
      />

      {/* Chart Generator Modal */}
      {showChartModal && (
        <ChartGenerator
          onInsert={handleInsertChart}
          onClose={() => setShowChartModal(false)}
        />
      )}

      {/* Image Uploader Modal */}
      {showImageModal && (
        <ImageUploader
          onInsert={handleInsertImage}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {/* Custom Context Menu */}
      <ContextMenu editor={editorInstance} />
    </div>
  );
}
