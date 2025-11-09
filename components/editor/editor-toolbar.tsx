"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Share2, Loader2, Download, FileText, Image, LogOut, X, Home, Check, Edit2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditorToolbarProps {
  title: string;
  isSaving: boolean;
  isSaved: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onToggleShare: () => void;
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
}

export function EditorToolbar({
  title,
  isSaving,
  isSaved,
  onTitleChange,
  onSave,
  onToggleShare,
  onDownloadPDF,
  onDownloadImage,
}: EditorToolbarProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const router = useRouter();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 shrink-0 shadow-sm">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Close/Home Button */}
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          className="shrink-0 text-gray-600 hover:text-gray-900"
          title="Back to Dashboard"
        >
          <X className="w-4 h-4 sm:hidden" />
          <Home className="w-4 h-4 hidden sm:block sm:mr-2" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>

        {/* Document Title with Edit Icon */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Edit2 className="w-4 h-4 text-gray-400 shrink-0" />
          <Input
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            className="flex-1 min-w-0 font-semibold border-0 focus:ring-0 text-sm sm:text-base lg:text-lg px-0 sm:px-3"
            placeholder="Document Title"
          />
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2 items-center shrink-0">
        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
            </>
          )}
        </Button>
        
        <Button onClick={onToggleShare} variant="outline" size="sm" className="hidden sm:flex">
          <Share2 className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {/* Download with Dropdown */}
        <div className="relative hidden sm:block">
          <Button
            onMouseEnter={() => setShowDownloadMenu(true)}
            onMouseLeave={() => setShowDownloadMenu(false)}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden lg:inline">Download</span>
          </Button>
          
          {showDownloadMenu && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              onMouseEnter={() => setShowDownloadMenu(true)}
              onMouseLeave={() => setShowDownloadMenu(false)}
            >
              <button
                onClick={() => {
                  onDownloadPDF();
                  setShowDownloadMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download as PDF
              </button>
              <button
                onClick={() => {
                  onDownloadImage();
                  setShowDownloadMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Download as Image
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="ghost"
          size="sm"
          className="hidden lg:flex text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden lg:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
