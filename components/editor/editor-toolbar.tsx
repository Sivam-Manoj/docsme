"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Share2, Loader2, Download, FileText, FileType, LogOut, X, Home, Check, Edit2, Menu, MoreVertical, Mail } from "lucide-react";
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
  onDownloadDocx: () => void;
  onEmailShare?: () => void;
}

export function EditorToolbar({
  title,
  isSaving,
  isSaved,
  onTitleChange,
  onSave,
  onToggleShare,
  onDownloadPDF,
  onDownloadDocx,
  onEmailShare,
}: EditorToolbarProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 shrink-0 shadow-sm relative">
      {/* Left Section */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
        {/* Back Button */}
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          className="shrink-0 text-gray-600 hover:text-gray-900 h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
          title="Back to Dashboard"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline sm:ml-2">Dashboard</span>
        </Button>

        {/* Document Title */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 max-w-[300px] sm:max-w-[400px]">
          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0 hidden sm:block" />
          <Input
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full min-w-0 font-semibold border-0 focus:ring-0 text-xs sm:text-base px-1 sm:px-3 h-8 sm:h-9"
            placeholder="Document Title"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex gap-1 sm:gap-2 items-center shrink-0">
        {/* Save Button - Always Visible */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-8 sm:h-9 px-2 sm:px-4"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Save</span>
            </>
          )}
        </Button>
        
        {/* Share Button - Hidden on Mobile */}
        <Button 
          onClick={onToggleShare} 
          variant="outline" 
          size="sm" 
          className="hidden md:flex h-9"
        >
          <Share2 className="w-4 h-4 mr-2" />
          <span className="text-sm">Share</span>
        </Button>

        {/* Email Share - Desktop Only */}
        {onEmailShare && (
          <Button 
            onClick={onEmailShare} 
            variant="outline" 
            size="sm" 
            className="hidden md:flex h-9"
          >
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">Email</span>
          </Button>
        )}

        {/* Download - Desktop Only */}
        <div className="relative hidden lg:block">
          <Button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            onMouseEnter={() => setShowDownloadMenu(true)}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="text-sm">Download</span>
          </Button>
          
          {showDownloadMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowDownloadMenu(false)}
              />
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                onMouseLeave={() => setShowDownloadMenu(false)}
              >
              <button
                onClick={() => {
                  onDownloadPDF();
                  setShowDownloadMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Download as PDF
              </button>
              <button
                onClick={() => {
                  onDownloadDocx();
                  setShowDownloadMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
              >
                <FileType className="w-4 h-4" />
                Download as DOCX
              </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="relative md:hidden">
          <Button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showMobileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMobileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    onToggleShare();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </button>
                {onEmailShare && (
                  <button
                    onClick={() => {
                      onEmailShare();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Email Document
                  </button>
                )}
                <div className="border-t my-1" />
                <button
                  onClick={() => {
                    onDownloadPDF();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
                >
                  <FileText className="w-4 h-4" />
                  Download as PDF
                </button>
                <button
                  onClick={() => {
                    onDownloadDocx();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
                >
                  <FileType className="w-4 h-4" />
                  Download as DOCX
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Desktop Logout */}
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="ghost"
          size="sm"
          className="hidden lg:flex text-gray-600 hover:text-gray-900 h-9"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </header>
  );
}
