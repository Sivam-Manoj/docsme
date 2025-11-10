"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/dashboard/voice-recorder";
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
      <AnimatePresence>
        {/* Close Button */}
        <motion.button
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
            <div className="w-full max-w-5xl">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Create Your Document
                </h1>
                <p className="text-gray-600 text-lg sm:text-xl">
                  Powered by GPT-5 with real-time generation
                </p>
              </motion.div>

              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-2xl border-2 border-violet-200 overflow-hidden"
              >
                <div className="p-6 sm:p-8 md:p-10 space-y-6">
                  {/* Question Mode Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <div className="flex items-center gap-3">
                      <MessageCircleQuestion className="w-5 h-5 text-violet-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Question Mode
                        </p>
                        <p className="text-xs text-gray-600">
                          Get guided questions for better results
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setQuestionMode(!questionMode)}
                      disabled={isGeneratingQuestions}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        questionMode ? "bg-violet-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          questionMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Document Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-600" />
                      Document Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {docTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setDocType(type.id as DocType)}
                          disabled={isGeneratingQuestions}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            docType === type.id
                              ? "border-violet-500 bg-violet-50 shadow-md scale-105"
                              : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"
                          }`}
                        >
                          <type.icon
                            className={`w-6 h-6 mx-auto mb-2 ${
                              docType === type.id
                                ? "text-violet-600"
                                : "text-gray-500"
                            }`}
                          />
                          <p className="font-semibold text-sm text-gray-900">
                            {type.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {type.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Effort Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-violet-600" />
                      Thinking Effort
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: "minimal", label: "Minimal", desc: "⚡ 3-5s" },
                        { id: "low", label: "Low", desc: "🚀 5-10s" },
                        { id: "medium", label: "Medium", desc: "⚖️ 10-20s" },
                        { id: "high", label: "High", desc: "🧠 20-40s" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setEffort(opt.id)}
                          disabled={isGeneratingQuestions}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            effort === opt.id
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <p className="font-semibold text-sm text-gray-900">
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verbosity Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-600" />
                      Content Detail
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "low", label: "Concise", desc: "📝 Brief" },
                        {
                          id: "medium",
                          label: "Balanced",
                          desc: "📄 Standard",
                        },
                        {
                          id: "high",
                          label: "Detailed",
                          desc: "📚 Comprehensive",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setVerbosity(opt.id)}
                          disabled={isGeneratingQuestions}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            verbosity === opt.id
                              ? "border-green-500 bg-green-50 shadow-md"
                              : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                          }`}
                        >
                          <p className="font-semibold text-sm text-gray-900">
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900">
                      Describe Your Document
                    </label>
                    <div className="flex gap-3">
                      <textarea
                        placeholder="e.g., Create a technical specification for a React Native mobile app with authentication, real-time updates, and offline support..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none resize-none text-base min-h-[120px]"
                        disabled={isGeneratingQuestions}
                        rows={4}
                      />
                      <div className="shrink-0">
                        <VoiceRecorder onTranscript={handleVoiceTranscript} />
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={
                      questionMode ? handleGenerateQuestions : handleGenerate
                    }
                    disabled={isGeneratingQuestions || !prompt.trim()}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Generating Questions...
                      </>
                    ) : questionMode ? (
                      <>
                        <MessageCircleQuestion className="w-6 h-6 mr-3" />
                        Start with Questions
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 mr-3" />
                        Generate Document
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </>
                    )}
                  </Button>

                  {/* Quick Suggestions */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-300 to-transparent"></div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        Quick Suggestions
                      </p>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-300 to-transparent"></div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickSuggestions.map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPrompt(suggestion)}
                          disabled={isGeneratingQuestions}
                          className="inline-flex items-center text-sm px-4 py-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-2" />
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // Streaming View
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-4xl">
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Sparkles className="w-16 h-16 text-violet-600" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {generatedDocId
                      ? "Document Generated!"
                      : "Generating Your Document..."}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {generatedDocId
                      ? "Opening editor..."
                      : `${characterCount} characters generated`}
                  </p>
                </div>

                {generatedDocId && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center"
                  >
                    <CheckCircle2 className="w-20 h-20 text-green-500" />
                  </motion.div>
                )}

                {streamingContent && !generatedDocId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 max-h-[400px] overflow-y-auto border-2 border-violet-200"
                  >
                    <div
                      className="text-left prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: streamingContent }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && dynamicQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Question {currentQuestionIndex + 1} of{" "}
                    {dynamicQuestions.length}
                  </h3>
                  <Button
                    onClick={() => {
                      setShowQuestionModal(false);
                      setAnswers({});
                      setCurrentQuestionIndex(0);
                      setDynamicQuestions([]);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  {dynamicQuestions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        idx <= currentQuestionIndex ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  <label className="text-2xl font-bold text-gray-900 block">
                    {dynamicQuestions[currentQuestionIndex]?.question}
                  </label>

                  {dynamicQuestions[currentQuestionIndex]?.type === "yesno" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setAnswers({
                            ...answers,
                            [dynamicQuestions[currentQuestionIndex].id]: true,
                          });
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                          answers[dynamicQuestions[currentQuestionIndex].id] ===
                          true
                            ? "border-green-500 bg-green-50 shadow-lg scale-105"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                        }`}
                      >
                        <div className="text-5xl mb-3">✅</div>
                        <p className="font-bold text-lg text-gray-900">Yes</p>
                      </button>
                      <button
                        onClick={() => {
                          setAnswers({
                            ...answers,
                            [dynamicQuestions[currentQuestionIndex].id]: false,
                          });
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                          answers[dynamicQuestions[currentQuestionIndex].id] ===
                          false
                            ? "border-red-500 bg-red-50 shadow-lg scale-105"
                            : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                        }`}
                      >
                        <div className="text-5xl mb-3">❌</div>
                        <p className="font-bold text-lg text-gray-900">No</p>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
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
                        placeholder={
                          dynamicQuestions[currentQuestionIndex]?.placeholder ||
                          "Type your answer here..."
                        }
                        className="w-full min-h-[150px] px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none resize-none text-base"
                        autoFocus
                      />
                      <VoiceRecorder onTranscript={handleVoiceTranscript} />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex gap-3">
                  {currentQuestionIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentQuestionIndex(currentQuestionIndex - 1)
                      }
                      className="px-6"
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={handleNextQuestion}
                    disabled={
                      answers[dynamicQuestions[currentQuestionIndex]?.id] ===
                        undefined ||
                      (dynamicQuestions[currentQuestionIndex]?.type ===
                        "text" &&
                        !(
                          answers[
                            dynamicQuestions[currentQuestionIndex]?.id
                          ] as string
                        )?.trim())
                    }
                    className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
                  >
                    {currentQuestionIndex === dynamicQuestions.length - 1 ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Document
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="w-5 h-5 ml-2" />
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
