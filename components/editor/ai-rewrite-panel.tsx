"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, WholeWord, X } from "lucide-react";

interface AIRewritePanelProps {
  selectedText: string;
  isRewriting: boolean;
  onRewrite: (instruction: string) => Promise<void>;
  onSelectAll?: () => void;
  onCancel?: () => void;
}

export function AIRewritePanel({
  selectedText,
  isRewriting,
  onRewrite,
  onSelectAll,
  onCancel,
}: AIRewritePanelProps) {
  const [aiPrompt, setAiPrompt] = useState("");

  const handleRewrite = async () => {
    if (!aiPrompt.trim()) return;
    await onRewrite(aiPrompt);
    setAiPrompt("");
  };

  return (
    <Card className="p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          AI Rewrite
        </h3>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex gap-2 mb-2">
        {onSelectAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex-1"
            disabled={isRewriting}
          >
            <WholeWord className="w-4 h-4 mr-2" />
            Select All
          </Button>
        )}
      </div>
      
      {selectedText && (
        <div className="mb-2 p-2 bg-violet-50 rounded text-xs">
          <strong>Selected:</strong> {selectedText.slice(0, 100)}...
        </div>
      )}
      <Input
        placeholder="e.g., Make it more professional..."
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        className="mb-2"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleRewrite}
          disabled={isRewriting || !aiPrompt.trim()}
          size="sm"
          className="flex-1"
        >
          {isRewriting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Rewrite
            </>
          )}
        </Button>
        {isRewriting && onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="px-3"
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
