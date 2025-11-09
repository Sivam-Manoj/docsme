"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, FileText, Briefcase, GraduationCap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TryNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  {
    icon: FileText,
    title: "Business Proposal",
    description: "Create a professional project proposal",
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
    description: "Academic or business research",
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
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const handleContinue = () => {
    // Store the selected prompt in sessionStorage
    if (selectedSuggestion) {
      sessionStorage.setItem("pendingPrompt", selectedSuggestion);
    }
    // Redirect to register with a return URL
    router.push("/auth/register?return=/dashboard&tryNow=true");
  };

  const handleSignIn = () => {
    // Redirect to login
    router.push("/auth/login?return=/dashboard");
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-8 py-6">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Try Docume AI</h2>
                    <p className="text-white/90 text-sm">
                      Start creating professional documents in seconds
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Choose a Template to Get Started
                  </h3>
                  <p className="text-gray-600">
                    Select one of our popular templates or describe your own idea
                  </p>
                </div>

                {/* Suggestion Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {suggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion.title}
                      onClick={() => setSelectedSuggestion(suggestion.prompt)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative text-left p-6 rounded-2xl border-2 transition-all ${
                        selectedSuggestion === suggestion.prompt
                          ? "border-violet-600 bg-violet-50 shadow-lg"
                          : "border-gray-200 hover:border-violet-300 bg-white hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${suggestion.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <suggestion.icon className="w-6 h-6 text-white" />
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {suggestion.description}
                      </p>

                      {selectedSuggestion === suggestion.prompt && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4 text-white"
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

                {/* Or Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      OR SIGN IN TO CONTINUE
                    </span>
                  </div>
                </div>

                {/* Sign In Section */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Already have an account?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Sign in to access your documents and start creating immediately
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSignIn}
                      variant="outline"
                      size="lg"
                      className="flex-1 border-2 border-gray-300 hover:border-violet-600 hover:bg-violet-50"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleContinue}
                      disabled={!selectedSuggestion}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Continue with Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Info Text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  🎉 <span className="font-medium">Free forever</span> • No credit card
                  required • Start creating in seconds
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
