"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";

interface AIRewritePanelProps {
  selectedText: string;
  isRewriting: boolean;
  onRewrite: (instruction: string) => Promise<void>;
}

export function AIRewritePanel({
  selectedText,
  isRewriting,
  onRewrite,
}: AIRewritePanelProps) {
  const [aiPrompt, setAiPrompt] = useState("");

  const handleRewrite = async () => {
    if (!aiPrompt.trim()) return;
    await onRewrite(aiPrompt);
    setAiPrompt("");
  };

  return (
    <Card className="p-4 shadow-md">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-600" />
        AI Rewrite
      </h3>
      {selectedText && (
        <div className="mb-2 p-2 bg-violet-50 rounded text-xs">
          <strong>Selected:</strong> {selectedText.slice(0, 50)}...
        </div>
      )}
      <Input
        placeholder="e.g., Make it more professional..."
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        className="mb-2"
      />
      <Button
        onClick={handleRewrite}
        disabled={isRewriting || !aiPrompt.trim()}
        size="sm"
        className="w-full"
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
    </Card>
  );
}
