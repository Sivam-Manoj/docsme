"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CreateDocumentCard } from "@/components/dashboard/create-document-card";
import { DocumentCard } from "@/components/dashboard/document-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DeleteModal } from "@/components/dashboard/delete-modal";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Document {
  _id: string;
  title: string;
  content: string;
  shareableLink: string;
  views: number;
  createdAt: string;
  isPublic?: boolean;
}

interface UserStats {
  plan: string;
  documentsCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    plan: "free",
    documentsCount: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/api/documents/list");
      const docs = response.data.documents || [];
      setDocuments(docs);
      
      // Calculate stats
      const totalViews = docs.reduce(
        (sum: number, doc: Document) => sum + doc.views,
        0
      );
      setUserStats({
        plan: "free", // This should come from user data
        documentsCount: docs.length,
      });
    } catch (error: any) {
      // Only show error if it's not a 404 or empty result
      if (error.response?.status !== 404) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents. Please refresh the page.");
      }
      // For new users or empty results, just set empty array
      setDocuments([]);
      setUserStats({
        plan: "free",
        documentsCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (prompt: string, effort?: string, verbosity?: string) => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating document...");

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          documentType: "general",
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
      let documentId = "";

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
                toast.loading(`Generating... ${fullContent.length} characters`, { id: toastId });
              }

              if (data.done) {
                if (data.document?.id) {
                  documentId = data.document.id;
                }
                if (data.error) {
                  throw new Error(data.error);
                }
              }
            }
          }
        }
      }

      toast.success("Document generated successfully!", { id: toastId });
      await fetchDocuments();
      
      if (documentId) {
        router.push(`/editor/${documentId}`);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate document", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDocumentToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await axios.delete(`/api/documents/${documentToDelete.id}`);
      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setDocumentToDelete(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
          <p className="text-sm text-gray-600 font-medium">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  const totalViews = documents.reduce((sum, doc) => sum + doc.views, 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 relative overflow-x-hidden ${
      isCreating ? "overflow-hidden h-screen" : ""
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Navbar />

      <main className={`relative z-10 mx-auto transition-all duration-300 ${
        isCreating ? "fixed inset-0 top-16 p-0 max-w-none w-full h-[calc(100vh-4rem)] overflow-hidden" : "max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 pt-20 sm:pt-24 pb-8 sm:pb-12"
      }`}>
        {/* Header - Hide when creating */}
        {!isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-0.5 sm:mb-1 leading-tight truncate">
                  Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-violet-500" />
                  Create and manage documents
                </p>
              </div>
              {documents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-violet-200 shadow-sm"
                >
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {documents.length} {documents.length === 1 ? 'Doc' : 'Docs'}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats Cards - Hide when creating */}
        <AnimatePresence>
          {!isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StatsCards
                documentsCount={userStats.documentsCount}
                totalViews={totalViews}
                plan={userStats.plan}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Document Card - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className=""
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 sm:mb-4"
          >
            <div className="border-2 border-dashed border-violet-300 hover:border-violet-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-2.5 sm:p-3">
              <Button
                onClick={() => router.push("/generate")}
                size="sm"
                className="w-full h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Create New Document
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Documents Section - Hide when creating */}
        <AnimatePresence>
          {!isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-3 sm:mt-4 md:mt-6"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                  Your Documents
                  {documents.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded-full">
                      {documents.length}
                    </span>
                  )}
                </h2>
              </div>

              {documents.length === 0 ? (
                <EmptyState onCreateClick={() => setIsCreating(true)} />
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                >
                  {documents.map((doc, index) => (
                    <DocumentCard
                      key={doc._id}
                      document={doc}
                      onDelete={(id) => handleDeleteClick(id, doc.title)}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        documentTitle={documentToDelete?.title || ""}
      />
    </div>
  );
}
