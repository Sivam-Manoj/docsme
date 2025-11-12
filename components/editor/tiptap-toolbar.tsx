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
  Highlighter,
  Link as LinkIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Code2,
  MoreHorizontal,
  X,
  BarChart3,
  Image as ImageIcon,
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
  onInsertChart?: () => void;
  onInsertImage?: () => void;
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
  onInsertChart,
  onInsertImage,
}: TiptapToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showMoreTools, setShowMoreTools] = useState(false);

  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
      {/* Mobile: Scrollable Toolbar */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 sm:gap-2 items-center p-2 sm:p-3 min-w-max">
          {/* History */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-r pr-1 sm:pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
              className="h-8 w-8 p-0"
            >
              <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
              className="h-8 w-8 p-0"
            >
              <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-r pr-1 sm:pr-2">
            <Button
              size="sm"
              variant={editor.isActive("bold") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
              className="h-8 w-8 p-0"
            >
              <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("italic") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
              className="h-8 w-8 p-0"
            >
              <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("underline") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
              className="h-8 w-8 p-0"
            >
              <UnderlineIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("strike") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
              className="h-8 w-8 p-0 hidden sm:flex"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("code") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Inline Code"
              className="h-8 w-8 p-0 hidden md:flex"
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>

          {/* More Formatting */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-r pr-1 sm:pr-2">
            <Button
              size="sm"
              variant={editor.isActive("highlight") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title="Highlight"
              className="h-8 w-8 p-0"
            >
              <Highlighter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("subscript") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              title="Subscript"
              className="h-8 w-8 p-0 hidden md:flex"
            >
              <SubscriptIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("superscript") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              title="Superscript"
              className="h-8 w-8 p-0 hidden md:flex"
            >
              <SuperscriptIcon className="w-4 h-4" />
            </Button>
            <div className="relative hidden md:block">
              <Button
                size="sm"
                variant={editor.isActive("link") ? "default" : "ghost"}
                onClick={() => setShowLinkInput(!showLinkInput)}
                title="Add Link"
                className="h-8 w-8 p-0"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
              {showLinkInput && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowLinkInput(false)}
                  />
                  <div className="absolute top-10 left-0 z-50 bg-white p-3 rounded-lg shadow-xl border min-w-[250px]">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addLink();
                        }
                      }}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={addLink}
                        className="flex-1 h-7 text-xs"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={removeLink}
                        className="flex-1 h-7 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-r pr-1 sm:pr-2">
            <Button
              size="sm"
              variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
              className="h-8 w-8 p-0"
            >
              <Heading1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
              className="h-8 w-8 p-0"
            >
              <Heading2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
              className="h-8 w-8 p-0 hidden sm:flex"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-r pr-1 sm:pr-2">
            <Button
              size="sm"
              variant={editor.isActive("bulletList") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
              className="h-8 w-8 p-0"
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("orderedList") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
              className="h-8 w-8 p-0"
            >
              <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("blockquote") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Quote"
              className="h-8 w-8 p-0 hidden md:flex"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("codeBlock") ? "default" : "ghost"}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
              className="h-8 w-8 p-0 hidden lg:flex"
            >
              <Code2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-r pr-1 sm:pr-2">
            <Button
              size="sm"
              variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="Align Left"
              className="h-8 w-8 p-0"
            >
              <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              title="Align Center"
              className="h-8 w-8 p-0"
            >
              <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="Align Right"
              className="h-8 w-8 p-0 hidden sm:flex"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Table - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 border-r pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={addTable}
              title="Insert Table"
              className="h-8 w-8 p-0"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Chart & Image - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 border-r pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onInsertChart}
              title="Insert Chart/Graph"
              className="h-8 w-8 p-0"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onInsertImage}
              title="Insert Image"
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 sm:gap-2 border-r pr-1 sm:pr-2">
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 hidden sm:block" />
            <select
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="text-xs sm:text-sm border rounded px-1 sm:px-2 py-1 h-8 bg-white"
            >
              {[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>

          {/* Font Family - Hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-2 border-r pr-2">
            <select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="text-xs sm:text-sm border rounded px-1 sm:px-2 py-1 h-8 bg-white"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier</option>
            </select>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 hidden sm:block" />
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-8 h-8 p-0"
                title="Text Color"
              >
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded border"
                  style={{ backgroundColor: textColor }}
                />
              </Button>
              {showColorPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="absolute top-10 left-0 z-50 bg-white p-3 rounded-lg shadow-xl border">
                    <div className="grid grid-cols-5 gap-2 mb-3">
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
                          className="w-7 h-7 rounded-md border-2 hover:scale-110 transition shadow-sm"
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
                      className="w-full h-10 rounded border cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer hidden sm:block"
              title="Background color"
            />
          </div>

          {/* More Tools Button - Mobile Only */}
          <div className="md:hidden relative ml-auto">
            <Button
              size="sm"
              variant={showMoreTools ? "default" : "outline"}
              onClick={() => setShowMoreTools(!showMoreTools)}
              className="h-8 px-2"
              title="More Tools"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>

            {/* More Tools Modal */}
            {showMoreTools && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/20" 
                  onClick={() => setShowMoreTools(false)}
                />
                <div className="fixed inset-x-4 top-20 z-50 bg-white rounded-2xl shadow-2xl border-2 border-violet-200 max-h-[70vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between rounded-t-2xl">
                    <h3 className="font-bold text-sm">More Formatting Tools</h3>
                    <button
                      onClick={() => setShowMoreTools(false)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tools Grid */}
                  <div className="p-4 space-y-4">
                    {/* Text Formatting */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">TEXT FORMATTING</p>
                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          size="sm"
                          variant={editor.isActive("strike") ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().toggleStrike().run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <Strikethrough className="w-5 h-5" />
                          <span className="text-[10px]">Strike</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={editor.isActive("code") ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().toggleCode().run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <Code className="w-5 h-5" />
                          <span className="text-[10px]">Code</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={editor.isActive("subscript") ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().toggleSubscript().run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <SubscriptIcon className="w-5 h-5" />
                          <span className="text-[10px]">Subscript</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={editor.isActive("superscript") ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().toggleSuperscript().run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <SuperscriptIcon className="w-5 h-5" />
                          <span className="text-[10px]">Superscript</span>
                        </Button>
                      </div>
                    </div>

                    {/* Block Elements */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">BLOCKS</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().toggleHeading({ level: 3 }).run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <Heading3 className="w-5 h-5" />
                          <span className="text-[10px]">Heading 3</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={editor.isActive("blockquote") ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().toggleBlockquote().run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <Quote className="w-5 h-5" />
                          <span className="text-[10px]">Quote</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={editor.isActive("codeBlock") ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().toggleCodeBlock().run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <Code2 className="w-5 h-5" />
                          <span className="text-[10px]">Code Block</span>
                        </Button>
                      </div>
                    </div>

                    {/* Alignment */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">ALIGNMENT</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          variant={editor.isActive({ textAlign: "right" }) ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().setTextAlign("right").run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <AlignRight className="w-5 h-5" />
                          <span className="text-[10px]">Right</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={editor.isActive({ textAlign: "justify" }) ? "default" : "outline"}
                          onClick={() => {
                            editor.chain().focus().setTextAlign("justify").run();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <AlignJustify className="w-5 h-5" />
                          <span className="text-[10px]">Justify</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addTable();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <TableIcon className="w-5 h-5" />
                          <span className="text-[10px]">Table</span>
                        </Button>
                      </div>
                    </div>

                    {/* Chart & Image */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">MEDIA</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onInsertChart?.();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <BarChart3 className="w-5 h-5" />
                          <span className="text-[10px]">Chart</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onInsertImage?.();
                            setShowMoreTools(false);
                          }}
                          className="flex flex-col h-auto py-3 gap-1"
                        >
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-[10px]">Image</span>
                        </Button>
                      </div>
                    </div>

                    {/* Link */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">INSERT</p>
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 text-sm border rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              addLink();
                              setShowMoreTools(false);
                            }}
                            className="w-full"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Add Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              removeLink();
                              setShowMoreTools(false);
                            }}
                            className="w-full"
                          >
                            Remove Link
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Font Family */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">FONT FAMILY</p>
                      <select
                        value={fontFamily}
                        onChange={(e) => {
                          onFontFamilyChange(e.target.value);
                          setShowMoreTools(false);
                        }}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-white"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>

                    {/* Background Color */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">BACKGROUND COLOR</p>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => onBackgroundColorChange(e.target.value)}
                        className="w-full h-12 border-2 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scrollbar Hide CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
