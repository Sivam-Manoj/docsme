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
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
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
      setDocuments(response.data.documents);
      
      // Calculate stats
      const totalViews = response.data.documents.reduce(
        (sum: number, doc: Document) => sum + doc.views,
        0
      );
      setUserStats({
        plan: "free", // This should come from user data
        documentsCount: response.data.documents.length,
      });
    } catch (error) {
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await axios.post("/api/documents/generate", {
        prompt,
        documentType: "general",
      });

      toast.success("Document generated!");
      await fetchDocuments();
      router.push(`/editor/${response.data.document.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to generate document");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await axios.delete(`/api/documents/${id}`);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to delete document");
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
        isCreating ? "fixed inset-0 top-16 p-0 max-w-none w-full h-[calc(100vh-4rem)] overflow-hidden" : "max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12"
      }`}>
        {/* Header - Hide when creating */}
        {!isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
                  Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                  Create and manage your AI-powered documents
                </p>
              </div>
              {documents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-violet-200 shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
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
          className={isCreating ? "h-full w-full flex items-center justify-center p-2 sm:p-4" : ""}
        >
          <CreateDocumentCard
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onExpandChange={setIsCreating}
          />
        </motion.div>

        {/* Documents Section - Hide when creating */}
        <AnimatePresence>
          {!isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 sm:mt-12"
            >
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Your Documents
                  {documents.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-violet-100 text-violet-700 rounded-full">
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {documents.map((doc, index) => (
                    <DocumentCard
                      key={doc._id}
                      document={doc}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
