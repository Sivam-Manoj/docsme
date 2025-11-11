"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, FileText, Briefcase, GraduationCap, Mail, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface TryNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  {
    icon: FileText,
    title: "Business Proposal",
    description: "Professional project proposal",
    prompt: "Create a comprehensive business proposal for a mobile app development project",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Briefcase,
    title: "Marketing Plan",
    description: "Strategic marketing document",
    prompt: "Generate a detailed marketing plan for a new product launch",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: GraduationCap,
    title: "Research Report",
    description: "Academic research document",
    prompt: "Create a research report on AI trends in technology",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Mail,
    title: "Email Campaign",
    description: "Professional email series",
    prompt: "Write a professional email campaign for customer onboarding",
    gradient: "from-orange-500 to-red-500",
  },
];

export function TryNowModal({ isOpen, onClose }: TryNowModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const handleContinue = () => {
    // If user is authenticated, go directly to generate page
    if (session) {
      // Store the prompt and redirect to generate page
      if (selectedSuggestion) {
        sessionStorage.setItem("pendingPrompt", selectedSuggestion);
      }
      router.push("/generate");
      onClose();
    } else {
      // Store the selected prompt and redirect to register
      if (selectedSuggestion) {
        sessionStorage.setItem("pendingPrompt", selectedSuggestion);
      }
      router.push("/auth/register?return=/generate");
    }
  };

  const handleSignIn = () => {
    router.push("/auth/login?return=/generate");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal - Full height on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
          >
            <div className="bg-white w-full h-full sm:h-auto sm:max-h-[95vh] sm:rounded-3xl shadow-2xl max-w-4xl overflow-hidden flex flex-col">
              {/* Header - Fixed */}
              <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-4 py-4 sm:px-6 sm:py-5 shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 sm:top-5 sm:right-6 text-white/80 hover:text-white transition-colors z-10"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      ✨ Try Docume AI Free
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                      Start creating professional documents instantly
                    </p>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                    Choose Your Document Type
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Select a template to get started
                  </p>
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  {suggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion.title}
                      onClick={() => setSelectedSuggestion(suggestion.prompt)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all ${
                        selectedSuggestion === suggestion.prompt
                          ? "border-violet-600 bg-violet-50 shadow-lg ring-2 ring-violet-200"
                          : "border-gray-200 hover:border-violet-300 bg-white hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${suggestion.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <suggestion.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-gray-900 mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {suggestion.description}
                      </p>

                      {selectedSuggestion === suggestion.prompt && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Divider */}
                {!session && (
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-3 sm:px-4 bg-white text-gray-500 font-semibold">
                        ALREADY A USER?
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleContinue}
                    disabled={!selectedSuggestion}
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed h-12 sm:h-14 text-sm sm:text-base font-bold shadow-xl"
                  >
                    {!selectedSuggestion ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Select a Template Above
                      </>
                    ) : session ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Creating
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Get Started Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {!session && (
                    <Button
                      onClick={handleSignIn}
                      variant="outline"
                      size="lg"
                      className="w-full border-2 border-gray-300 hover:border-violet-600 hover:bg-violet-50 h-11 sm:h-12 text-sm sm:text-base font-semibold"
                    >
                      <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Sign In Instead
                    </Button>
                  )}

                  {/* Info Text */}
                  <p className="text-center text-xs sm:text-sm text-gray-500 pt-2">
                    {!session ? (
                      <>
                        🎉 <span className="font-semibold">Free forever</span> • No credit card required
                      </>
                    ) : (
                      <>
                        ⚡ <span className="font-semibold">Ready to create</span> • Your prompt will be pre-filled
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
