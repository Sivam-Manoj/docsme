"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import toast from "react-hot-toast";

interface EmailShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

export function EmailShareModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}: EmailShareModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<"app" | "gmail">("app");

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    try {
      if (sendMethod === "app") {
        // Send via Resend API
        await axios.post("/api/documents/send-email", {
          documentId,
          email: email.trim(),
          message: message.trim(),
        });
        toast.success("Email sent successfully!");
      } else {
        // Open Gmail compose
        const subject = `${documentTitle} - Shared Document`;
        const body = encodeURIComponent(
          `${message}\n\nDocument: ${documentTitle}\n\nView document: ${window.location.origin}/shared/${documentId}`
        );
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
            subject
          )}&body=${body}`,
          "_blank"
        );
        toast.success("Gmail composer opened!");
      }

      // Reset form
      setEmail("");
      setMessage("");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send email");
    } finally {
      setIsSending(false);
    }
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-6 py-5">
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Share via Email
                    </h2>
                    <p className="text-white/90 text-sm mt-0.5">
                      Send document to anyone
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Send Method Toggle */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Send Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSendMethod("app")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        sendMethod === "app"
                          ? "border-violet-600 bg-violet-50 text-violet-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <Send className="w-5 h-5" />
                        <span className="text-xs font-semibold">Via App</span>
                        <span className="text-[10px] text-gray-500">
                          No reply
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSendMethod("gmail")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        sendMethod === "gmail"
                          ? "border-violet-600 bg-violet-50 text-violet-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <Mail className="w-5 h-5" />
                        <span className="text-xs font-semibold">Gmail</span>
                        <span className="text-[10px] text-gray-500">
                          Can reply
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recipient Email */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Recipient Email
                  </label>
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Add a personal message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-24 resize-none"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    {sendMethod === "app" ? (
                      <>
                        <strong>Via App:</strong> Email will be sent from our
                        system. Recipients cannot reply directly.
                      </>
                    ) : (
                      <>
                        <strong>Gmail:</strong> Opens your Gmail with pre-filled
                        content. You can edit before sending.
                      </>
                    )}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                    disabled={isSending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={isSending || !email.trim()}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : sendMethod === "gmail" ? (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Open Gmail
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
