"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eye,
  Edit3,
} from "lucide-react";

interface FormattingToolbarProps {
  viewMode: "edit" | "preview" | "split";
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  selectedText: string;
  onViewModeChange: (mode: "edit" | "preview" | "split") => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onTextColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onAlignText: (alignment: string) => void;
  onColorText: (color: string) => void;
}

// Normalize hex color strings to valid 6-digit format or fallback
const normalizeHex = (input: string, fallback: string) => {
  if (!input) return fallback;
  // Accept 3 or 6 digit hex starting with #
  const three = /^#([0-9a-fA-F]{3})$/;
  const six = /^#([0-9a-fA-F]{6})$/;
  if (six.test(input)) return input.toLowerCase();
  const m = input.match(three);
  if (m) {
    const g = m[1];
    return `#${g[0]}${g[0]}${g[1]}${g[1]}${g[2]}${g[2]}`.toLowerCase();
  }
  return fallback;
};

export function FormattingToolbar({
  viewMode,
  fontSize,
  fontFamily,
  textColor,
  backgroundColor,
  selectedText,
  onViewModeChange,
  onFontSizeChange,
  onFontFamilyChange,
  onTextColorChange,
  onBackgroundColorChange,
  onAlignText,
  onColorText,
}: FormattingToolbarProps) {
  // Ensure values are always defined using useMemo to prevent re-render issues
  const safeFontSize = useMemo(() => fontSize ?? 16, [fontSize]);
  const safeFontFamily = useMemo(() => fontFamily ?? "Arial", [fontFamily]);
  const safeTextColor = useMemo(() => textColor ?? "#000000", [textColor]);
  const safeBackgroundColor = useMemo(() => backgroundColor ?? "#ffffff", [backgroundColor]);
  const validTextColor = useMemo(() => normalizeHex(safeTextColor, "#000000"), [safeTextColor]);
  const validBackgroundColor = useMemo(() => normalizeHex(safeBackgroundColor, "#ffffff"), [safeBackgroundColor]);
  return (
    <div className="border-b border-gray-200 p-3 flex flex-wrap gap-2 items-center bg-gray-50 sticky top-0 z-10">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 border-r pr-3 mr-2">
        <Button
          size="sm"
          variant={viewMode === "split" ? "default" : "outline"}
          onClick={() => onViewModeChange("split")}
          className="h-8"
          title="Split view - Edit and preview side by side"
        >
          <div className="flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            <Eye className="w-3 h-3" />
          </div>
          <span className="hidden sm:inline ml-1">Split</span>
        </Button>
        <Button
          size="sm"
          variant={viewMode === "edit" ? "default" : "outline"}
          onClick={() => onViewModeChange("edit")}
          className="h-8"
          title="Edit only"
        >
          <Edit3 className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <Button
          size="sm"
          variant={viewMode === "preview" ? "default" : "outline"}
          onClick={() => onViewModeChange("preview")}
          className="h-8"
          title="Preview only"
        >
          <Eye className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Preview</span>
        </Button>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-2 border-r pr-2">
        <Type className="w-4 h-4 text-gray-500" />
        <select
          value={safeFontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="text-sm border rounded px-2 py-1"
        >
          {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Font Family */}
      <div className="flex items-center gap-2 border-r pr-2">
        <select
          value={safeFontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>

      {/* Colors */}
      <div className="flex items-center gap-2 border-r pr-2">
        <Palette className="w-4 h-4 text-gray-500" />
        {selectedText ? (
          <div key="selected" className="flex items-center gap-2">
            <input
              type="color"
              onChange={(e) => onColorText(e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Color selected text"
            />
            <span className="text-xs text-gray-500 hidden sm:inline">Selected</span>
          </div>
        ) : (
          <div key="global" className="flex items-center gap-2">
            <input
              type="color"
              value={validTextColor}
              onChange={(e) => onTextColorChange(e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Text color"
            />
            <input
              type="color"
              value={validBackgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Background color"
            />
          </div>
        )}
      </div>

      {/* Alignment - Only when editor is visible with selected text */}
      {(viewMode === "edit" || viewMode === "split") && selectedText && (
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAlignText("left")}
            title="Align selected text left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAlignText("center")}
            title="Align selected text center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAlignText("right")}
            title="Align selected text right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAlignText("justify")}
            title="Align selected text justify"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
