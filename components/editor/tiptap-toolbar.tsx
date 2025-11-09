"use client";

import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Type,
  Palette,
} from "lucide-react";
import { useState } from "react";

interface TiptapToolbarProps {
  editor: Editor | null;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onTextColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
}

export function TiptapToolbar({
  editor,
  fontSize,
  fontFamily,
  textColor,
  backgroundColor,
  onFontSizeChange,
  onFontFamilyChange,
  onTextColorChange,
  onBackgroundColorChange,
}: TiptapToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  return (
    <div className="border-b border-gray-200 p-3 bg-gray-50 sticky top-0 z-10">
      <div className="flex flex-wrap gap-2 items-center">
        {/* History */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive("bold") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("italic") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("underline") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("strike") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("code") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={addTable}
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2 border-r pr-2">
          <Type className="w-4 h-4 text-gray-500" />
          <select
            value={fontSize}
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
            value={fontFamily}
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
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-500" />
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-8 h-8 p-0"
              title="Text Color"
            >
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: textColor }}
              />
            </Button>
            {showColorPicker && (
              <div className="absolute top-10 left-0 z-50 bg-white p-2 rounded-lg shadow-lg border">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {[
                    "#000000",
                    "#ef4444",
                    "#f97316",
                    "#eab308",
                    "#22c55e",
                    "#3b82f6",
                    "#8b5cf6",
                    "#ec4899",
                    "#64748b",
                    "#ffffff",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border hover:scale-110 transition"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setColor(color);
                        onTextColorChange(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setColor(e.target.value);
                    onTextColorChange(e.target.value);
                  }}
                  className="w-full"
                />
              </div>
            )}
          </div>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-8 h-8 border rounded cursor-pointer"
            title="Background color"
          />
        </div>
      </div>
    </div>
  );
}
