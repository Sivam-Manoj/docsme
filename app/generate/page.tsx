"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, MessageCircleQuestion, FileCode, Users, Briefcase, FileText, Brain, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/dashboard/voice-recorder";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { toast } from "sonner";

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
  const [characterCount, setCharacterCount] = useState(0);
  const streamingViewRef = useRef<HTMLDivElement>(null);

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

  const buildPromptFromAnswers = () => {
    const questions = dynamicQuestions;
    const docTypeLabel = docTypes.find((t) => t.id === docType)?.label;

    let fullPrompt = `Original Request: ${prompt}\n\n`;
    fullPrompt += `Document Type: ${docTypeLabel}\n\n`;
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
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt =
      questionMode && Object.keys(answers).length > 0
        ? buildPromptFromAnswers()
        : prompt;

    if (!finalPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setStreamingContent("");
    setCharacterCount(0);

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          documentType: docType,
          effort: effort || "medium",
          verbosity: verbosity || "medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
                setCharacterCount(fullContent.length);
                
                // Auto-scroll to bottom
                setTimeout(() => {
                  if (streamingViewRef.current) {
                    streamingViewRef.current.scrollTop = streamingViewRef.current.scrollHeight;
                  }
                }, 50);
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
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Close Button */}
        <motion.button
          key="close-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => router.push("/dashboard")}
          className="fixed top-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group"
        >
          <X className="w-6 h-6 text-gray-700 group-hover:text-violet-600 transition-colors" />
        </motion.button>

        {/* Main Content */}
        {!isGenerating ? (
          <motion.div
            key="form-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex flex-col p-2 sm:p-3 md:p-4 overflow-hidden"
          >
            {/* Ultra Compact Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-1.5 shrink-0"
            >
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-0.5">
                Create Document
              </h1>
              <p className="text-gray-600 text-[10px] sm:text-xs">
                Powered by GPT-5
              </p>
            </motion.div>

            {/* Main Card - Ultra Compact */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-violet-200 flex flex-col min-h-0 flex-1 w-full max-w-none"
            >
              <div className="p-2 sm:p-3 md:p-3 overflow-y-auto space-y-2 md:space-y-0 md:grid md:grid-cols-12 md:gap-2">
                {/* Question Mode Toggle - Ultra Compact */}
                <div className="md:col-span-12 col-span-12 flex items-center justify-between p-1.5 bg-gradient-to-r from-violet-50 to-purple-50 rounded border border-violet-200">
                  <div className="flex items-start gap-1.5">
                    <MessageCircleQuestion className="w-3.5 h-3.5 text-violet-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-gray-900">AI Question Mode</p>
                      <p className="text-[10px] text-gray-600">When enabled, AI asks targeted questions based on your request to craft the best document.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuestionMode(!questionMode)}
                    disabled={isGeneratingQuestions}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${questionMode ? "bg-violet-600" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${questionMode ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {/* Document Type - Ultra Compact */}
                <div className="space-y-1 md:col-span-4 col-span-12">
                  <label className="text-[10px] font-semibold text-gray-900 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-violet-600" />
                    Document Type
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {docTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setDocType(type.id as DocType)}
                        disabled={isGeneratingQuestions}
                        className={`p-1 rounded border-2 transition-all ${docType === type.id ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-300"}`}
                      >
                        <type.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${docType === type.id ? "text-violet-600" : "text-gray-500"}`} />
                        <p className="font-semibold text-[10px] text-gray-900">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thinking Mode */}
                <div className="space-y-1 md:col-span-4 col-span-12">
                  <label className="text-[10px] font-semibold text-gray-900 flex items-center gap-1">
                    <Brain className="w-3 h-3 text-violet-600" />
                    Thinking Mode
                  </label>
                  <p className="text-[10px] text-gray-500">High = slower, best for complex tasks and info points</p>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: "minimal", label: "Minimal" },
                      { id: "low", label: "Low" },
                      { id: "medium", label: "Medium" },
                      { id: "high", label: "High" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setEffort(opt.id)}
                        disabled={isGeneratingQuestions}
                        className={`p-1 rounded border-2 transition-all ${effort === opt.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                      >
                        <p className="text-[11px] font-medium">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Size */}
                <div className="space-y-1 md:col-span-4 col-span-12">
                  <label className="text-[10px] font-semibold text-gray-900 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-violet-600" />
                    Output Size
                  </label>
                  <p className="text-[10px] text-gray-500">High = longer text length</p>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "low", label: "Low" },
                      { id: "medium", label: "Medium" },
                      { id: "high", label: "High" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setVerbosity(opt.id)}
                        disabled={isGeneratingQuestions}
                        className={`p-1 rounded border-2 transition-all ${verbosity === opt.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                      >
                        <p className="text-[11px] font-medium">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Input - Ultra Compact */}
                <div className="space-y-1 md:col-span-12 col-span-12">
                  <label className="text-[10px] font-semibold text-gray-900">Prompt</label>
                  <div className="flex gap-1.5">
                    <textarea
                      placeholder="Describe your document..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:border-violet-500 focus:ring-1 focus:ring-violet-100 outline-none resize-none text-xs"
                      disabled={isGeneratingQuestions}
                      rows={2}
                    />
                    <div className="shrink-0">
                      <VoiceRecorder onTranscript={handleVoiceTranscript} />
                    </div>
                  </div>
                </div>

                {/* Generate Button - Compact */}
                <Button
                  onClick={questionMode ? handleGenerateQuestions : handleGenerate}
                  disabled={isGeneratingQuestions || !prompt.trim()}
                  className="md:col-span-12 col-span-12 w-full h-9 text-xs font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700"
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Loading...
                    </>
                  ) : questionMode ? (
                    <>
                      <MessageCircleQuestion className="w-3.5 h-3.5 mr-1.5" />
                      Questions
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Generate
                    </>
                  )}
                </Button>

                {/* Quick Suggestions - Ultra Compact (Hidden on small screens) */}
                <div className="hidden sm:block space-y-1 pt-1.5 border-t border-gray-200 md:col-span-12 col-span-12">
                  <p className="text-[10px] font-semibold text-gray-700 text-center">Quick Start</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                    {quickSuggestions.slice(0, 4).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(suggestion)}
                        disabled={isGeneratingQuestions}
                        className="text-[10px] px-1.5 py-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded shadow-sm font-medium truncate"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Streaming View - Centered & Responsive
          <motion.div
            key="streaming-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-start p-3 sm:p-4 md:p-6 overflow-hidden"
          >
            <div className="w-full max-w-5xl mx-auto space-y-3 sm:space-y-4 flex flex-col h-full">
              {/* Header Section - Centered */}
              <div className="text-center space-y-2 sm:space-y-3 shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-violet-600" />
                </motion.div>

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {generatedDocId ? "✨ Document Generated!" : "🚀 Generating Your Document..."}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                    <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full font-medium">
                      {characterCount} characters
                    </span>
                    {!generatedDocId && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </div>
                </div>

                {generatedDocId && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
                  </motion.div>
                )}
              </div>

              {/* Content Preview - Centered & Auto-scrolling */}
              {streamingContent && !generatedDocId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-2xl border-2 border-violet-200 flex flex-col min-h-0 flex-1 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-2 border-b border-violet-200 shrink-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700">📝 Live Preview</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-600">
                        <span className="px-1.5 py-0.5 bg-white rounded border border-violet-200">
                          {effort}
                        </span>
                        <span className="px-1.5 py-0.5 bg-white rounded border border-violet-200">
                          {verbosity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div 
                    ref={streamingViewRef}
                    className="flex-1 overflow-y-auto p-3 sm:p-4 scroll-smooth"
                  >
                    <TiptapEditor
                      content={streamingContent}
                      onChange={() => {}}
                      editable={false}
                      variant="viewer"
                      fontSize={14}
                      fontFamily="Inter, system-ui, Arial"
                      textColor="#111827"
                    />
                  </div>
                </motion.div>
              )}

              {/* Completion Message */}
              {generatedDocId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center"
                >
                  <p className="text-sm sm:text-base font-semibold text-green-900 mb-1">
                    🎉 Your document is ready!
                  </p>
                  <p className="text-xs sm:text-sm text-green-700">
                    Redirecting to the editor...
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Modal - Compact */}
      <AnimatePresence>
        {showQuestionModal && dynamicQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-base sm:text-lg font-bold">
                    Q {currentQuestionIndex + 1}/{dynamicQuestions.length}
                  </h3>
                  <button
                    onClick={() => {
                      setShowQuestionModal(false);
                      setAnswers({});
                      setCurrentQuestionIndex(0);
                      setDynamicQuestions([]);
                    }}
                    className="text-white hover:bg-white/20 p-1 rounded"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {dynamicQuestions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all ${idx <= currentQuestionIndex ? "bg-white" : "bg-white/30"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 sm:p-4 overflow-y-auto flex-1">
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-base sm:text-lg font-bold text-gray-900 block">
                    {dynamicQuestions[currentQuestionIndex]?.question}
                  </label>

                  {dynamicQuestions[currentQuestionIndex]?.type === "yesno" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setAnswers({
                            ...answers,
                            [dynamicQuestions[currentQuestionIndex].id]: true,
                          });
                        }}
                        className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                          answers[dynamicQuestions[currentQuestionIndex].id] === true
                            ? "border-green-500 bg-green-50 scale-105"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="text-3xl sm:text-4xl mb-2">✅</div>
                        <p className="font-bold text-sm sm:text-base text-gray-900">Yes</p>
                      </button>
                      <button
                        onClick={() => {
                          setAnswers({
                            ...answers,
                            [dynamicQuestions[currentQuestionIndex].id]: false,
                          });
                        }}
                        className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                          answers[dynamicQuestions[currentQuestionIndex].id] === false
                            ? "border-red-500 bg-red-50 scale-105"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                      >
                        <div className="text-3xl sm:text-4xl mb-2">❌</div>
                        <p className="font-bold text-sm sm:text-base text-gray-900">No</p>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={(answers[dynamicQuestions[currentQuestionIndex]?.id] as string) || ""}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [dynamicQuestions[currentQuestionIndex].id]: e.target.value,
                          })
                        }
                        placeholder={dynamicQuestions[currentQuestionIndex]?.placeholder || "Type your answer..."}
                        className="w-full min-h-[100px] px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none resize-none text-sm"
                        autoFocus
                      />
                      <VoiceRecorder onTranscript={handleVoiceTranscript} />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-4 border-t bg-gray-50 shrink-0">
                <div className="flex gap-2">
                  {currentQuestionIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      className="px-4"
                      size="sm"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNextQuestion}
                    disabled={
                      answers[dynamicQuestions[currentQuestionIndex]?.id] === undefined ||
                      (dynamicQuestions[currentQuestionIndex]?.type === "text" &&
                        !(answers[dynamicQuestions[currentQuestionIndex]?.id] as string)?.trim())
                    }
                    className="flex-1 h-10 text-sm sm:text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    size="sm"
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
