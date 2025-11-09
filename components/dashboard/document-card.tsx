"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Edit2, Trash2, ExternalLink, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * Modern Document Card Component
 * 
 * Features:
 * - Glass morphism design with animated gradient overlays
 * - Smooth hover effects with scale and lift animations
 * - Responsive layout for mobile, tablet, and desktop
 * - Action buttons with icon indicators
 * - View count and creation date badges
 * - Truncated content preview with ellipsis
 * 
 * @param document - Document object with id, title, content, etc.
 * @param onDelete - Callback function to handle document deletion
 * @param index - Card index for staggered animations
 */

// Helper function to strip HTML tags and decode entities
function stripHtml(html: string): string {
  if (!html) return "";
  // Remove HTML tags
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  // Decode HTML entities
  const textarea = document.createElement("textarea");
  textarea.innerHTML = withoutTags;
  // Clean up extra whitespace
  return textarea.value.replace(/\s+/g, " ").trim();
}

interface DocumentCardProps {
  document: {
    _id: string;
    title: string;
    content: string;
    shareableLink: string;
    views: number;
    createdAt: string;
  };
  onDelete: (id: string) => void;
  index: number;
}

export function DocumentCard({ document, onDelete, index }: DocumentCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
    >
      <Card className="h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
        
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg shadow-sm">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <CardTitle className="line-clamp-2 text-lg sm:text-xl font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {document.title || "Untitled Document"}
                </CardTitle>
              </div>
            </div>
            
            {/* Status Badge */}
            <motion.div
              className="shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 shadow-sm">
                ● Active
              </span>
            </motion.div>
          </div>
          
          {/* Meta Information */}
          <CardDescription className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-gray-100 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-700">{formatDate(document.createdAt)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-gray-100 rounded-md">
              <Eye className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-700">{document.views} {document.views === 1 ? "view" : "views"}</span>
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 relative pt-0">
          {/* Content Preview */}
          <div className="relative">
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {stripHtml(document.content) || "No content available..."}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/editor/${document._id}`} className="flex-1">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="default"
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-700 hover:via-purple-700 hover:to-violet-700 shadow-md hover:shadow-lg transition-all duration-300"
                  size="sm"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  <span className="font-semibold">Edit</span>
                </Button>
              </motion.div>
            </Link>
            
            <Link href={`/shared/${document.shareableLink}`} target="_blank">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-violet-50 hover:text-violet-600 hover:border-violet-600 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(document._id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
