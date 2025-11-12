"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Loader2,
  MessageCircleQuestion,
  FileCode,
  Users,
  Briefcase,
  FileText,
  Brain,
  Zap,
  ArrowRight,
  CheckCircle2,
  StopCircle,
  Upload,
  Image as ImageIcon,
  File,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/dashboard/voice-recorder";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { FileUploader } from "@/components/generate/file-uploader";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type DocType = "ai-editor" | "developer" | "client" | "general";

interface Question {
  id: string;
  question: string;
  placeholder?: string;
  type: "text" | "yesno";
}

export default function GeneratePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [questionMode, setQuestionMode] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [docType, setDocType] = useState<DocType>("general");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [effort, setEffort] = useState<string>("medium");
  const [verbosity, setVerbosity] = useState<string>("medium");
  const [generatedDocId, setGeneratedDocId] = useState<string>("");
  const [streamingContent, setStreamingContent] = useState("");
  const [reasoningSummary, setReasoningSummary] = useState("");
  const [isReasoning, setIsReasoning] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const streamingViewRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // File upload state
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedPDF, setUploadedPDF] = useState<File | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Load pending prompt from try-now modal
  useEffect(() => {
    const pendingPrompt = sessionStorage.getItem("pendingPrompt");
    if (pendingPrompt) {
      setPrompt(pendingPrompt);
      sessionStorage.removeItem("pendingPrompt");
    }
  }, []);

  const quickSuggestions = [
    "Technical specification for a mobile app",
    "API documentation for REST endpoints",
    "Project proposal for client presentation",
    "User guide for software product",
  ];

  const docTypes = [
    {
      id: "ai-editor",
      label: "AI Editor",
      icon: FileCode,
      desc: "Cursor, Windsurf",
    },
    { id: "developer", label: "Developer", icon: Users, desc: "Tech docs" },
    { id: "client", label: "Client", icon: Briefcase, desc: "Proposals" },
    { id: "general", label: "General", icon: FileText, desc: "Standard" },
  ];

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const buildPromptFromAnswers = () => {
    const questions = dynamicQuestions;
    const docTypeLabel = docTypes.find((t) => t.id === docType)?.label;

    let fullPrompt = `Original Request: ${prompt}\n\n`;
    fullPrompt += `Document Type: ${docTypeLabel}\n\n`;
    
    // Add file context
    if (uploadedPDF) {
      fullPrompt += `Attached Files: 1 PDF document (${uploadedPDF.name})\n`;
      fullPrompt += "Please analyze the PDF content and incorporate relevant information into the document.\n\n";
    }
    if (uploadedImages.length > 0) {
      fullPrompt += `Attached Images: ${uploadedImages.length} image(s)\n`;
      fullPrompt += "Please analyze the images and incorporate relevant visual information into the document.\n\n";
    }
    
    fullPrompt += `Additional Details from Questions:\n\n`;

    questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer !== undefined && answer !== "") {
        if (q.type === "yesno") {
          fullPrompt += `- ${q.question} ${answer === true ? "Yes" : "No"}\n`;
        } else {
          fullPrompt += `- ${q.question} ${answer}\n`;
        }
      }
    });

    fullPrompt +=
      "\nPlease create a detailed, comprehensive document based on the original request and all the additional details provided above.";
    return fullPrompt;
  };

  const handleGenerateQuestions = async () => {
    if (!prompt.trim()) return;

    setIsGeneratingQuestions(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, docType }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setDynamicQuestions(data.questions);
      setShowQuestionModal(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
    } catch (error: any) {
      // Don't show error if it was aborted by user
      if (error.name === "AbortError") {
        console.log("Generation aborted by user");
        return;
      }
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setIsReasoning(false);
    toast.info("Generation stopped");
  };

  const handleGenerate = async (finalPrompt?: string) => {
    const promptToUse = questionMode
      ? Object.entries(answers)
          .map(([key, value]) => {
            const question = dynamicQuestions.find((q) => q.id === key);
            return `${question?.question}: ${value}`;
          })
          .join("\n")
      : prompt;

    if (!promptToUse.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setStreamingContent("");
    setReasoningSummary("");
    setIsReasoning(false);
    setCharacterCount(0);
    setGeneratedDocId("");

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Convert files to base64
      setIsUploadingFiles(true);
      const imageFiles = await Promise.all(
        uploadedImages.map(async (file) => ({
          filename: file.name,
          type: file.type,
          data: await fileToBase64(file),
        }))
      );
      
      let pdfFile = null;
      if (uploadedPDF) {
        pdfFile = {
          filename: uploadedPDF.name,
          type: uploadedPDF.type,
          data: await fileToBase64(uploadedPDF),
        };
      }
      setIsUploadingFiles(false);

      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          documentType: docType,
          effort: effort || "medium",
          verbosity: verbosity || "medium",
          images: imageFiles,
          pdf: pdfFile,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let fullReasoning = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              // Handle reasoning summary
              if (data.reasoning) {
                fullReasoning += data.reasoning;
                setReasoningSummary(fullReasoning);

                // Set reasoning mode and update character count
                if (data.reasoning.trim()) {
                  setIsReasoning(true);
                  setCharacterCount(fullReasoning.length);
                }

                // Smart scroll: follow the last line smoothly
                setTimeout(() => {
                  if (streamingViewRef.current) {
                    const element = streamingViewRef.current;
                    const scrollHeight = element.scrollHeight;
                    const clientHeight = element.clientHeight;
                    const maxScroll = scrollHeight - clientHeight;
                    
                    // Smooth scroll to bottom with a small offset to show the last line
                    element.scrollTo({
                      top: maxScroll,
                      behavior: "smooth",
                    });
                  }
                }, 100);
              }

              // Handle content streaming
              if (data.content) {
                // Switch to writing mode when content starts
                if (fullContent.length === 0) {
                  setIsReasoning(false);
                }

                fullContent += data.content;
                setStreamingContent(fullContent);
                setCharacterCount(fullContent.length);

                // Smart scroll: follow the last line of content
                setTimeout(() => {
                  if (streamingViewRef.current) {
                    const element = streamingViewRef.current;
                    const scrollHeight = element.scrollHeight;
                    const clientHeight = element.clientHeight;
                    const currentScroll = element.scrollTop;
                    const maxScroll = scrollHeight - clientHeight;
                    
                    // Only scroll if content has grown beyond current view
                    // This keeps the last line visible without aggressive scrolling
                    if (maxScroll > currentScroll) {
                      element.scrollTo({
                        top: maxScroll,
                        behavior: "smooth",
                      });
                    }
                  }
                }, 100);
              }

              if (data.done) {
                if (data.document?.id) {
                  setGeneratedDocId(data.document.id);
                  // Wait a moment then redirect
                  setTimeout(() => {
                    router.push(`/editor/${data.document.id}`);
                  }, 1500);
                }
                if (data.error) {
                  throw new Error(data.error);
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate document");
      setIsGenerating(false);
    }
  };

  const handleNextQuestion = () => {
    const questions = dynamicQuestions;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowQuestionModal(false);
      handleGenerate();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    if (showQuestionModal && dynamicQuestions.length > 0) {
      const currentQuestion = dynamicQuestions[currentQuestionIndex];
      if (currentQuestion.type === "text") {
        setAnswers({
          ...answers,
          [currentQuestion.id]:
            (answers[currentQuestion.id] || "") + " " + text,
        });
      }
    } else {
      setPrompt((prev) => prev + " " + text);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <AnimatePresence mode="wait">
        {/* Close Button */}
        <motion.button
          key="close-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => router.push("/dashboard")}
          className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-violet-600 transition-colors" />
        </motion.button>

        {/* Main Content */}
        {!isGenerating ? (
          <motion.div
            key="form-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl border-2 border-violet-100 w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Create Document
                  </h1>
                  <p className="text-xs text-white/90">Powered by AI</p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* AI Question Mode */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <div className="flex items-center gap-2">
                      <MessageCircleQuestion className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        AI Questions (AI ask questions based on your idea)
                      </span>
                    </div>
                    <button
                      onClick={() => setQuestionMode(!questionMode)}
                      disabled={isGeneratingQuestions}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                        questionMode
                          ? "bg-gradient-to-r from-violet-600 to-purple-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          questionMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Document Type */}
                  <div>
                    <label className="text-sm font-bold text-gray-900 mb-2 block">
                      Document Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {docTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setDocType(type.id as DocType)}
                          disabled={isGeneratingQuestions}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            docType === type.id
                              ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-md"
                              : "border-gray-200 hover:border-violet-300"
                          }`}
                        >
                          <type.icon
                            className={`w-5 h-5 mx-auto mb-1 ${
                              docType === type.id
                                ? "text-violet-600"
                                : "text-gray-500"
                            }`}
                          />
                          <p className="text-[10px] font-semibold text-gray-900">
                            {type.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thinking Mode & Output Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-gray-900 mb-2 block flex items-center gap-1">
                        <Brain className="w-4 h-4 text-blue-600" />
                        Thinking
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: "minimal", label: "Min" },
                          { id: "low", label: "Low" },
                          { id: "medium", label: "Med" },
                          { id: "high", label: "High" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setEffort(opt.id)}
                            disabled={isGeneratingQuestions}
                            className={`p-1.5 rounded border-2 text-xs font-semibold transition-all ${
                              effort === opt.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-900 mb-2 block flex items-center gap-1">
                        <Zap className="w-4 h-4 text-green-600" />
                        Output
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "low", label: "Short" },
                          { id: "medium", label: "Med" },
                          { id: "high", label: "Long" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setVerbosity(opt.id)}
                            disabled={isGeneratingQuestions}
                            className={`p-1.5 rounded border-2 text-xs font-semibold transition-all ${
                              verbosity === opt.id
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-green-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Prompt Input */}
                  <div>
                    <label className="text-sm font-bold text-gray-900 mb-2 block">
                      Your Idea
                    </label>
                    
                    {/* File Uploader - Above prompt */}
                    <div className="mb-2">
                      <FileUploader
                        uploadedImages={uploadedImages}
                        uploadedPDF={uploadedPDF}
                        onImagesChange={setUploadedImages}
                        onPDFChange={setUploadedPDF}
                        disabled={isGeneratingQuestions}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Describe what you want to create..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none resize-none text-sm h-32"
                        disabled={isGeneratingQuestions}
                      />
                      <VoiceRecorder onTranscript={handleVoiceTranscript} />
                    </div>
                  </div>

                  {/* Quick Suggestions */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 text-center">
                      Quick Start
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPrompt(suggestion)}
                          disabled={isGeneratingQuestions}
                          className="text-xs px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg shadow-sm font-medium truncate transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={() =>
                      questionMode
                        ? handleGenerateQuestions()
                        : handleGenerate(prompt)
                    }
                    disabled={isGeneratingQuestions || !prompt.trim()}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : questionMode ? (
                      <>
                        <MessageCircleQuestion className="w-5 h-5 mr-2" />
                        Start with AI Questions
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Streaming View
          <motion.div
            key="streaming-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-violet-100 w-full max-w-4xl h-[70vh] sm:h-[75vh] md:h-[70vh] overflow-hidden flex flex-col mt-8 sm:mt-12 md:mt-16"
          >
            {/* Header - Mobile Optimized */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 shrink-0">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="shrink-0"
                  >
                    <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-sm md:text-lg font-bold text-white truncate leading-tight">
                      {generatedDocId
                        ? "✨ Complete!"
                        : isReasoning
                        ? "🧠 Thinking..."
                        : "✍️ Writing..."}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-white/90">
                      {characterCount} chars
                    </p>
                  </div>
                </div>

                {/* Controls - Better Touch Targets */}
                <div className="flex items-center gap-2 shrink-0">
                  {generatedDocId ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-400" />
                      <button
                        onClick={() => {
                          setIsGenerating(false);
                          setStreamingContent("");
                          setReasoningSummary("");
                          setGeneratedDocId("");
                          setCharacterCount(0);
                        }}
                        className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all active:scale-95"
                        title="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Stop button - Always visible */}
                      <button
                        onClick={handleStopGeneration}
                        className="flex items-center justify-center gap-1 min-w-[36px] sm:min-w-0 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-2 sm:py-1.5 md:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-xs sm:text-xs md:text-sm font-bold shadow-md active:scale-95"
                        title="Stop Generation"
                      >
                        <StopCircle className="w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4" />
                        <span className="hidden sm:inline whitespace-nowrap">Stop</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div
              ref={streamingViewRef}
              className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 bg-gray-50"
            >
              {isReasoning && reasoningSummary ? (
                <div className="bg-blue-50 border border-blue-200 sm:border-2 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h3 className="text-sm sm:text-base font-bold text-blue-900">AI Reasoning</h3>
                  </div>
                  <div className="prose prose-sm prose-blue max-w-none text-xs sm:text-sm text-blue-900">
                    <ReactMarkdown
                      components={{
                        h1: ({ ...props }) => (
                          <h1
                            className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-1 sm:mb-2"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-xs sm:text-sm md:text-base font-bold text-blue-900 mb-1 sm:mb-2"
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3
                            className="text-xs sm:text-sm font-bold text-blue-800 mb-0.5 sm:mb-1"
                            {...props}
                          />
                        ),
                        p: ({ ...props }) => (
                          <p
                            className="text-xs sm:text-sm text-blue-800 mb-1 sm:mb-2"
                            {...props}
                          />
                        ),
                        strong: ({ ...props }) => (
                          <strong
                            className="font-bold text-blue-900"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul
                            className="list-disc list-inside text-xs sm:text-sm text-blue-800 mb-1 sm:mb-2 ml-2"
                            {...props}
                          />
                        ),
                        ol: ({ ...props }) => (
                          <ol
                            className="list-decimal list-inside text-xs sm:text-sm text-blue-800 mb-1 sm:mb-2 ml-2"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {reasoningSummary}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {streamingContent && !generatedDocId && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-2 sm:p-3 md:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                      Document Preview
                    </span>
                  </div>
                  <TiptapEditor
                    content={streamingContent}
                    onChange={() => {}}
                    editable={false}
                    fontSize={12}
                    fontFamily="Inter, system-ui, Arial"
                    textColor="#111827"
                  />
                </div>
              )}

              {generatedDocId && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 sm:border-2 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-green-500 mx-auto mb-2 sm:mb-3" />
                  <p className="text-base sm:text-lg font-bold text-green-900 mb-1">
                    Document Ready!
                  </p>
                  <p className="text-xs sm:text-sm text-green-700">
                    Redirecting to editor...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Modal - Same as before but more compact */}
      <AnimatePresence>
        {showQuestionModal && dynamicQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-bold">
                    Question {currentQuestionIndex + 1}/
                    {dynamicQuestions.length}
                  </h3>
                  <button
                    onClick={() => {
                      setShowQuestionModal(false);
                      setAnswers({});
                      setCurrentQuestionIndex(0);
                      setDynamicQuestions([]);
                    }}
                    className="text-white hover:bg-white/20 active:bg-white/30 p-2 rounded-lg transition-all active:scale-95"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {dynamicQuestions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full ${
                        idx <= currentQuestionIndex ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 sm:p-4 overflow-y-auto flex-1">
                <label className="text-sm sm:text-base font-bold text-gray-900 block mb-3">
                  {dynamicQuestions[currentQuestionIndex]?.question}
                </label>

                {dynamicQuestions[currentQuestionIndex]?.type === "yesno" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          [dynamicQuestions[currentQuestionIndex].id]: true,
                        })
                      }
                      className={`p-4 rounded-xl border-2 ${
                        answers[dynamicQuestions[currentQuestionIndex].id] ===
                        true
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="text-3xl mb-1">✅</div>
                      <p className="font-bold text-sm">Yes</p>
                    </button>
                    <button
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          [dynamicQuestions[currentQuestionIndex].id]: false,
                        })
                      }
                      className={`p-4 rounded-xl border-2 ${
                        answers[dynamicQuestions[currentQuestionIndex].id] ===
                        false
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="text-3xl mb-1">❌</div>
                      <p className="font-bold text-sm">No</p>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={
                        (answers[
                          dynamicQuestions[currentQuestionIndex]?.id
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [dynamicQuestions[currentQuestionIndex].id]:
                            e.target.value,
                        })
                      }
                      placeholder="Type your answer..."
                      className="w-full min-h-[100px] px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none resize-none text-sm"
                      autoFocus
                    />
                    <VoiceRecorder onTranscript={handleVoiceTranscript} />
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 border-t bg-gray-50 flex gap-2">
                {currentQuestionIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentQuestionIndex(currentQuestionIndex - 1)
                    }
                    className="h-10 sm:h-9 px-4 font-semibold"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNextQuestion}
                  disabled={
                    answers[dynamicQuestions[currentQuestionIndex]?.id] ===
                      undefined ||
                    (dynamicQuestions[currentQuestionIndex]?.type === "text" &&
                      !(
                        answers[
                          dynamicQuestions[currentQuestionIndex]?.id
                        ] as string
                      )?.trim())
                  }
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 h-10 sm:h-9 font-semibold"
                >
                  {currentQuestionIndex === dynamicQuestions.length - 1 ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
