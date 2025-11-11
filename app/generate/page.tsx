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
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Close Button */}
        <motion.button
          key="close-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => router.push("/dashboard")}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-violet-600 transition-colors" />
        </motion.button>

        {/* Main Content */}
        {!isGenerating ? (
          <motion.div
            key="form-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex flex-col items-center p-4 sm:p-6 md:p-8 overflow-y-auto"
          >
            {/* Modern Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-xl">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Create Your Document
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                ✨ Powered by GPT-5 AI Technology
              </p>
            </motion.div>

            {/* Main Card - Beautiful Modern Design */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl border-2 border-violet-100 w-full max-w-4xl"
            >
              <div className="p-4 sm:p-6 md:p-8 space-y-6">
                {/* AI Question Mode Toggle - Modern Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 rounded-xl border-2 border-violet-200 hover:border-violet-300 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                      <MessageCircleQuestion className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm sm:text-base text-gray-900 mb-1">
                        AI Question Mode
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        AI asks targeted questions to understand your needs and craft the perfect document
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuestionMode(!questionMode)}
                    disabled={isGeneratingQuestions}
                    className={`relative inline-flex h-7 w-14 sm:h-8 sm:w-16 items-center rounded-full transition-all duration-300 shrink-0 ml-3 ${
                      questionMode ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        questionMode ? "translate-x-8 sm:translate-x-9" : "translate-x-1"
                      }`}
                    />
                  </button>
                </motion.div>

                {/* Document Type - Beautiful Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <label className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    Document Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {docTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setDocType(type.id as DocType)}
                        disabled={isGeneratingQuestions}
                        className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                          docType === type.id
                            ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg"
                            : "border-gray-200 hover:border-violet-300 hover:shadow-md"
                        }`}
                      >
                        <type.icon
                          className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2 transition-colors ${
                            docType === type.id ? "text-violet-600" : "text-gray-500 group-hover:text-violet-500"
                          }`}
                        />
                        <p className="font-bold text-xs sm:text-sm text-gray-900">{type.label}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Thinking Mode - Beautiful Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <label className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    Thinking Mode
                  </label>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    💡 High = Slower but handles complex tasks better
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "minimal", label: "Minimal", emoji: "⚡" },
                      { id: "low", label: "Low", emoji: "🔥" },
                      { id: "medium", label: "Medium", emoji: "💪" },
                      { id: "high", label: "High", emoji: "🧠" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setEffort(opt.id)}
                        disabled={isGeneratingQuestions}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                          effort === opt.id
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md scale-105"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="text-lg mb-1">{opt.emoji}</div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Output Size - Beautiful Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <label className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    Output Size
                  </label>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    📏 High = More detailed and longer content
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "low", label: "Short", emoji: "📝" },
                      { id: "medium", label: "Medium", emoji: "📄" },
                      { id: "high", label: "Long", emoji: "📚" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setVerbosity(opt.id)}
                        disabled={isGeneratingQuestions}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                          verbosity === opt.id
                            ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md scale-105"
                            : "border-gray-200 hover:border-green-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="text-lg mb-1">{opt.emoji}</div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Prompt Input - Modern Design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-3"
                >
                  <label className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    Your Idea
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <textarea
                      placeholder="Describe what you want to create... Be as detailed as you like! 💭"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none resize-none text-sm sm:text-base transition-all duration-300 min-h-[100px] sm:min-h-[120px]"
                      disabled={isGeneratingQuestions}
                    />
                    <div className="shrink-0 self-end sm:self-start">
                      <VoiceRecorder onTranscript={handleVoiceTranscript} />
                    </div>
                  </div>
                </motion.div>

                {/* Generate Button - Big & Beautiful */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={questionMode ? handleGenerateQuestions : handleGenerate}
                    disabled={isGeneratingQuestions || !prompt.trim()}
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : questionMode ? (
                      <>
                        <MessageCircleQuestion className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        Start with AI Questions
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        Generate Document Now
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Quick Suggestions - Beautiful Chips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-3 pt-4 border-t-2 border-gray-100"
                >
                  <p className="text-xs sm:text-sm font-bold text-gray-700 text-center flex items-center justify-center gap-2">
                    <span className="text-lg">✨</span>
                    Quick Start Ideas
                    <span className="text-lg">✨</span>
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickSuggestions.map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPrompt(suggestion)}
                        disabled={isGeneratingQuestions}
                        className="text-xs sm:text-sm px-4 py-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full shadow-md hover:shadow-lg font-semibold transition-all duration-300"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
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
