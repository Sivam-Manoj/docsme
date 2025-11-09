"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, X, Loader2, MessageCircleQuestion, FileCode, Users, Briefcase, FileText } from "lucide-react";
import { VoiceRecorder } from "./voice-recorder";

interface CreateDocumentCardProps {
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
}

type DocType = "ai-editor" | "developer" | "client" | "general";

interface Question {
  id: string;
  question: string;
  placeholder?: string;
  type: "text" | "yesno";
}

export function CreateDocumentCard({ onGenerate, isGenerating, onExpandChange }: CreateDocumentCardProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [questionMode, setQuestionMode] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [docType, setDocType] = useState<DocType>("general");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const handleShowPromptChange = (show: boolean) => {
    setShowPrompt(show);
    onExpandChange?.(show);
  };

  const quickSuggestions = [
    "Technical specification for a mobile app",
    "API documentation for REST endpoints",
    "Project proposal for client presentation",
    "User guide for software product",
  ];

  const docTypes = [
    { id: "ai-editor", label: "AI Editor", icon: FileCode, desc: "Cursor, Windsurf" },
    { id: "developer", label: "Developer", icon: Users, desc: "Tech docs" },
    { id: "client", label: "Client", icon: Briefcase, desc: "Proposals" },
    { id: "general", label: "General", icon: FileText, desc: "Standard" },
  ];

  const getQuestionsForModal = (): Question[] => {
    return dynamicQuestions;
  };

  const buildPromptFromAnswers = () => {
    const questions = dynamicQuestions;
    const docTypeLabel = docTypes.find(t => t.id === docType)?.label;
    
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

    fullPrompt += "\nPlease create a detailed, comprehensive document based on the original request and all the additional details provided above.";
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
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = questionMode && Object.keys(answers).length > 0 ? buildPromptFromAnswers() : prompt;
    await onGenerate(finalPrompt);
    setPrompt("");
    setShowQuestionModal(false);
    setDynamicQuestions([]);
    handleShowPromptChange(false);
    setQuestionMode(false);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    const questions = dynamicQuestions;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleGenerate();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    if (showQuestionModal && dynamicQuestions.length > 0) {
      const currentQuestion = dynamicQuestions[currentQuestionIndex];
      if (currentQuestion.type === "text") {
        setAnswers({ ...answers, [currentQuestion.id]: (answers[currentQuestion.id] || "") + " " + text });
      }
    } else {
      setPrompt((prev) => prev + " " + text);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!showPrompt ? (
        <motion.div
          key="create-button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mb-8"
        >
          <Card className="border-2 border-dashed border-violet-300 hover:border-violet-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="pt-6">
              <Button
                onClick={() => handleShowPromptChange(true)}
                size="lg"
                className="w-full h-16 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                <Plus className="w-6 h-6 mr-2" />
                Create New Document with AI
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
          <motion.div
            key="prompt-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex items-center justify-center"
          >
            <Card className="border-2 border-violet-500 shadow-2xl bg-white overflow-hidden flex flex-col w-full max-w-4xl rounded-2xl" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
              <CardHeader className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shrink-0 px-4 sm:px-5 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-xl font-bold truncate">AI Document Generator</CardTitle>
                      <CardDescription className="text-violet-100 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate">
                        {questionMode ? "Answer questions" : "Describe your needs"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      handleShowPromptChange(false);
                      setPrompt("");
                      setQuestionMode(false);
                      setAnswers({});
                      setCurrentQuestionIndex(0);
                    }}
                    className="text-white hover:bg-white/20 shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-5 space-y-3 overflow-hidden flex-1 flex flex-col">
                {/* Question Mode Toggle */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200 shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageCircleQuestion className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
                    <div>
                      <p className="font-medium text-xs sm:text-sm text-gray-900">Question Mode</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newMode = !questionMode;
                      setQuestionMode(newMode);
                      setCurrentQuestionIndex(0);
                      setAnswers({});
                      if (!newMode) {
                        setPrompt("");
                      }
                    }}
                    disabled={isGenerating}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      questionMode ? "bg-violet-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        questionMode ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Document Type Selector */}
                <div className="space-y-1.5 shrink-0">
                  <label className="text-xs font-semibold text-gray-900">
                    Document Type
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {docTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          setDocType(type.id as DocType);
                          setCurrentQuestionIndex(0);
                          setAnswers({});
                        }}
                        disabled={isGenerating}
                        className={`p-1.5 rounded-lg border-2 transition-all text-center ${
                          docType === type.id
                            ? "border-violet-500 bg-violet-50 shadow-sm"
                            : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"
                        }`}
                      >
                        <type.icon className={`w-4 h-4 mx-auto mb-0.5 ${
                          docType === type.id ? "text-violet-600" : "text-gray-500"
                        }`} />
                        <p className="font-medium text-[9px] text-gray-900 leading-tight">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Prompt Input */}
                <div className="space-y-2 flex-1 flex flex-col min-h-0">
                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                      <label className="text-xs font-semibold text-gray-900 shrink-0">
                        Describe Your Document
                      </label>
                      <div className="flex gap-2 flex-1 min-h-0">
                        <textarea
                          placeholder="e.g., Create a technical specification for a React Native mobile app..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none resize-none text-sm"
                          disabled={isGenerating}
                          rows={3}
                        />
                        <div className="shrink-0">
                          <VoiceRecorder onTranscript={handleVoiceTranscript} />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={questionMode ? handleGenerateQuestions : handleGenerate}
                      disabled={isGenerating || isGeneratingQuestions || !prompt.trim()}
                      className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
                    >
                      {isGeneratingQuestions ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing & Generating Questions...
                        </>
                      ) : isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : questionMode ? (
                        <>
                          <MessageCircleQuestion className="w-5 h-5 mr-2" />
                          Analyze & Ask Questions
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Document
                        </>
                      )}
                    </Button>

                    {/* Quick Suggestions */}
                    <div className="space-y-1 shrink-0">
                      <p className="text-[10px] font-medium text-gray-600">Quick suggestions:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPrompt(suggestion)}
                            disabled={isGenerating}
                            className="inline-flex items-center text-[10px] px-2 py-1 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 text-violet-700 rounded-full border border-violet-200 transition-all hover:shadow-sm hover:scale-105 font-medium"
                          >
                            <span className="truncate max-w-[200px]">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                {/* Question Modal */}
                {showQuestionModal && dynamicQuestions.length > 0 && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col"
                    >
                      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white p-3 sm:p-4 md:p-5 rounded-t-2xl shrink-0">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold">Question {currentQuestionIndex + 1} of {dynamicQuestions.length}</h3>
                          <Button
                            onClick={() => {
                              setShowQuestionModal(false);
                              setAnswers({});
                              setCurrentQuestionIndex(0);
                              setDynamicQuestions([]);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 shrink-0"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </div>
                        <div className="flex gap-0.5 sm:gap-1">
                          {dynamicQuestions.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 flex-1 rounded-full ${
                                idx <= currentQuestionIndex ? "bg-white" : "bg-white/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1">
                        <div className="space-y-4 sm:space-y-5">
                          <div>
                            <label className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 block leading-tight">
                              {dynamicQuestions[currentQuestionIndex]?.question}
                            </label>

                            {dynamicQuestions[currentQuestionIndex]?.type === "yesno" ? (
                              <div className="flex gap-2 sm:gap-3">
                                <button
                                  onClick={() => {
                                    setAnswers({
                                      ...answers,
                                      [dynamicQuestions[currentQuestionIndex].id]: true,
                                    });
                                  }}
                                  className={`flex-1 p-3 sm:p-4 md:p-5 rounded-xl border-2 transition-all hover:scale-105 ${
                                    answers[dynamicQuestions[currentQuestionIndex].id] === true
                                      ? "border-green-500 bg-green-50 shadow-lg scale-105"
                                      : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                                  }`}
                                >
                                  <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">✅</div>
                                  <p className="font-semibold text-sm sm:text-base text-gray-900">Yes</p>
                                </button>
                                <button
                                  onClick={() => {
                                    setAnswers({
                                      ...answers,
                                      [dynamicQuestions[currentQuestionIndex].id]: false,
                                    });
                                  }}
                                  className={`flex-1 p-3 sm:p-4 md:p-5 rounded-xl border-2 transition-all hover:scale-105 ${
                                    answers[dynamicQuestions[currentQuestionIndex].id] === false
                                      ? "border-red-500 bg-red-50 shadow-lg scale-105"
                                      : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                                  }`}
                                >
                                  <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">❌</div>
                                  <p className="font-semibold text-sm sm:text-base text-gray-900">No</p>
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <textarea
                                  value={(answers[dynamicQuestions[currentQuestionIndex]?.id] as string) || ""}
                                  onChange={(e) =>
                                    setAnswers({
                                      ...answers,
                                      [dynamicQuestions[currentQuestionIndex].id]: e.target.value,
                                    })
                                  }
                                  placeholder={dynamicQuestions[currentQuestionIndex]?.placeholder || "Type your answer here..."}
                                  className="flex-1 min-h-[120px] sm:min-h-[140px] px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none resize-none text-sm sm:text-base"
                                  autoFocus
                                />
                                <div className="flex justify-end sm:block">
                                  <VoiceRecorder onTranscript={handleVoiceTranscript} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 border-t bg-gray-50 rounded-b-2xl shrink-0">
                        <div className="flex gap-2 sm:gap-3">
                          {currentQuestionIndex > 0 && (
                            <Button
                              variant="outline"
                              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                              className="px-4 sm:px-6 text-sm sm:text-base"
                              size="sm"
                            >
                              Previous
                            </Button>
                          )}
                          <Button
                            onClick={handleNextQuestion}
                            disabled={
                              answers[dynamicQuestions[currentQuestionIndex]?.id] === undefined ||
                              (dynamicQuestions[currentQuestionIndex]?.type === "text" &&
                                !(answers[dynamicQuestions[currentQuestionIndex]?.id] as string)?.trim())
                            }
                            className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : currentQuestionIndex === dynamicQuestions.length - 1 ? (
                              <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Document
                              </>
                            ) : (
                              <>
                                Next Question
                                <span className="ml-2">→</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
    </AnimatePresence>
  );
}
