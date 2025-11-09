"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Share2, Lock, Unlock, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface SharePanelProps {
  isPublic: boolean;
  shareableLink: string;
  onMakePublic: (password?: string) => Promise<void>;
}

export function SharePanel({
  isPublic,
  shareableLink,
  onMakePublic,
}: SharePanelProps) {
  const [sharePassword, setSharePassword] = useState("");
  const [copied, setCopied] = useState(false);

  const copyShareLink = () => {
    const link = `${window.location.origin}/shared/${shareableLink}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMakePublic = async () => {
    await onMakePublic(sharePassword || undefined);
    setSharePassword("");
  };

  return (
    <Card className="p-4 shadow-md">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Share2 className="w-4 h-4 text-violet-600" />
        Share Document
      </h3>

      {isPublic ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
            <Unlock className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Public</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}/shared/${shareableLink}`}
              readOnly
              className="text-xs"
            />
            <Button size="sm" onClick={copyShareLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
            <Lock className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Private</span>
          </div>
          <Input
            type="password"
            placeholder="Optional password"
            value={sharePassword}
            onChange={(e) => setSharePassword(e.target.value)}
          />
          <Button onClick={handleMakePublic} size="sm" className="w-full">
            Make Public
          </Button>
        </div>
      )}
    </Card>
  );
}
