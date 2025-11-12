"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import "./tiptap-styles.css";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange?: (text: string) => void;
  onEditorReady?: (editor: any) => void;
  onRewriteClick?: (selectedText: string) => void;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  editable?: boolean;
  variant?: "page" | "viewer";
}

export function TiptapEditor({
  content,
  onChange,
  onSelectionChange,
  onEditorReady,
  onRewriteClick,
  fontSize = 16,
  fontFamily = "Arial",
  textColor = "#000000",
  backgroundColor = "#ffffff",
  editable = true,
  variant = "page",
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6",
          },
        },
        codeBlock: false, // Disable default code block to use CodeBlockLowlight
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "editor-image",
        },
      }).extend({
        addNodeView() {
          return ({ node, editor, getPos }) => {
            const container = document.createElement("div");
            container.className = "image-wrapper";
            container.style.position = "relative";
            container.style.display = "inline-block";
            container.style.margin = "1rem auto";

            const img = document.createElement("img");
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || "";
            img.className = "editor-image";

            // Add delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "×";
            deleteBtn.className = "image-delete-btn";
            deleteBtn.style.cssText =
              "position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); color: white; border: none; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;";

            container.addEventListener("mouseenter", () => {
              deleteBtn.style.opacity = "1";
            });

            container.addEventListener("mouseleave", () => {
              deleteBtn.style.opacity = "0";
            });

            deleteBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              if (typeof getPos === "function") {
                const pos = getPos();
                if (pos !== undefined) {
                  editor.commands.deleteRange({
                    from: pos,
                    to: pos + node.nodeSize,
                  });
                }
              }
            });

            container.appendChild(img);
            container.appendChild(deleteBtn);

            return {
              dom: container,
            };
          };
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Underline,
      FontFamily,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
        },
      }),
      Subscript,
      Superscript,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto",
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        breaks: false,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none",
        style: `font-size: ${fontSize}px; font-family: ${fontFamily}; color: ${textColor};`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      if (onSelectionChange) {
        onSelectionChange(text);
      }
    },
  });

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // With Markdown extension, setContent handles both HTML and Markdown
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update styling when props change
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom;
      editorElement.style.fontSize = `${fontSize}px`;
      editorElement.style.fontFamily = fontFamily;
      editorElement.style.color = textColor;
    }
  }, [fontSize, fontFamily, textColor, editor]);

  if (!editor) {
    return <div className="p-4 text-gray-400">Loading editor...</div>;
  }

  // Handle rewrite click
  const handleRewriteClick = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    if (selectedText.trim() && onRewriteClick) {
      onRewriteClick(selectedText);
    }
  };

  if (variant === "viewer") {
    return (
      <div className="tiptap-editor-wrapper bg-white p-2 sm:p-4 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <>
      {/* Bubble Menu for text selection */}
      {editable && editor && (
        <BubbleMenu
          editor={editor}
          className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1 flex items-center gap-1 z-50"
        >
          <button
            onClick={handleRewriteClick}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
            title="Rewrite with AI"
          >
            <Sparkles className="w-4 h-4" />
            <span>Rewrite with AI</span>
          </button>
        </BubbleMenu>
      )}
      <div className="tiptap-editor-wrapper h-full overflow-y-auto bg-gray-100 p-1 sm:p-4">
        <div
          className="mx-auto shadow-lg w-full sm:max-w-[210mm]"
          style={{
            minHeight: "297mm",
            padding: "1rem",
            boxSizing: "border-box",
            backgroundColor: backgroundColor,
          }}
        >
          <style jsx>{`
            @media (min-width: 640px) {
              div {
                padding: 25mm 20mm !important;
              }
            }
          `}</style>
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
