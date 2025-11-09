"use client";

import { useRouter } from "next/navigation";
import {
  Home,
  FileText,
  Save,
  Download,
  Loader2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface EditorSidebarProps {
  sidebarOpen: boolean;
  sidebarExpanded: boolean;
  document: {
    title: string;
    isPublic: boolean;
  } | null;
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  } | null;
  isSaving: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  onSave: () => void;
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
}

export function EditorSidebar({
  sidebarOpen,
  sidebarExpanded,
  document,
  session,
  isSaving,
  setSidebarOpen,
  setSidebarExpanded,
  onSave,
  onDownloadPDF,
  onDownloadImage,
}: EditorSidebarProps) {
  const router = useRouter();

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 text-white transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 ${sidebarExpanded ? "w-64" : "w-16"}`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 shrink-0" />
          {sidebarExpanded && <span className="font-bold text-xl">DocAI</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden lg:flex hover:bg-white/10 p-2 rounded transition-colors"
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarExpanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden hover:bg-white/10 p-2 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
          title="Dashboard"
        >
          <Home className="w-5 h-5 shrink-0" />
          {sidebarExpanded && <span className="font-medium">Dashboard</span>}
        </button>

        {sidebarExpanded && (
          <>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
              Document Info
            </div>

            <div className="px-4 py-2 space-y-2 text-sm">
              <div className="text-white/80">
                <span className="text-white/60">Title:</span>
                <p className="font-medium mt-1 truncate">
                  {document?.title || "Untitled"}
                </p>
              </div>
              <div className="text-white/80">
                <span className="text-white/60">Status:</span>
                <p className="font-medium mt-1">
                  {document?.isPublic ? (
                    <span className="inline-flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
              Actions
            </div>
          </>
        )}

        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left disabled:opacity-50"
          title={isSaving ? "Saving..." : "Save Document"}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          ) : (
            <Save className="w-5 h-5 shrink-0" />
          )}
          {sidebarExpanded && (
            <span className="font-medium">
              {isSaving ? "Saving..." : "Save Document"}
            </span>
          )}
        </button>

        <button
          onClick={onDownloadPDF}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
          title="Download PDF"
        >
          <Download className="w-5 h-5 shrink-0" />
          {sidebarExpanded && <span className="font-medium">Download PDF</span>}
        </button>

        <button
          onClick={onDownloadImage}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
          title="Download PNG"
        >
          <Download className="w-5 h-5 shrink-0" />
          {sidebarExpanded && <span className="font-medium">Download PNG</span>}
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-sm font-bold">
              {session?.user?.name?.charAt(0) || "U"}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-white/60 truncate">
                {session?.user?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
