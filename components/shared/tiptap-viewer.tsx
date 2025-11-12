"use client";

import { useEditor, EditorContent } from "@tiptap/react";
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
import "./tiptap-styles.css";

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right" | "justify";
}

export function TiptapViewer({
  content,
  fontSize = 16,
  fontFamily = "Arial",
  textColor = "#000000",
  backgroundColor = "#ffffff",
  textAlign = "left",
}: TiptapViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6',
          },
        },
        codeBlock: false, // Disable default code block to use CodeBlockLowlight
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: textAlign,
        alignments: ["left", "center", "right", "justify"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'viewer-image',
          style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'viewer-table',
          style: 'border-collapse: collapse; width: 100%; margin: 1rem 0;',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          style: 'border: 1px solid #e5e7eb;',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          style: 'border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; padding: 12px;',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          style: 'border: 1px solid #e5e7eb; padding: 12px;',
        },
      }),
      TextStyle,
      Color,
      Underline,
      FontFamily,
      TaskList.configure({
        HTMLAttributes: {
          class: 'viewer-task-list',
          style: 'list-style: none; padding: 0;',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'viewer-task-item',
          style: 'display: flex; align-items: center; padding: 4px 0;',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'viewer-link',
          style: 'color: #2563eb; text-decoration: underline; cursor: pointer;',
        },
      }),
      Subscript,
      Superscript,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'viewer-code-block',
          style: 'background-color: #1f2937; color: #f9fafb; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 14px; overflow-x: auto; margin: 1rem 0;',
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
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none viewer-content",
        style: `font-size: ${fontSize}px; font-family: ${fontFamily}; color: ${textColor}; text-align: ${textAlign};`,
      },
    },
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
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
      editorElement.style.backgroundColor = backgroundColor;
      editorElement.style.textAlign = textAlign;
    }
  }, [fontSize, fontFamily, textColor, backgroundColor, textAlign, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="tiptap-viewer-wrapper w-full">
      <EditorContent editor={editor} />
      <style jsx>{`
        .viewer-content {
          line-height: 1.6;
        }
        
        .viewer-content h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em 0;
          line-height: 1.2;
        }
        
        .viewer-content h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          line-height: 1.3;
        }
        
        .viewer-content h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          line-height: 1.4;
        }
        
        .viewer-content p {
          margin: 0.75em 0;
        }
        
        .viewer-content ul,
        .viewer-content ol {
          margin: 0.75em 0;
          padding-left: 2em;
        }
        
        .viewer-content li {
          margin: 0.25em 0;
        }
        
        .viewer-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .viewer-content pre {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1em;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .viewer-content code {
          background-color: #f3f4f6;
          padding: 0.125em 0.25em;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.875em;
        }
        
        .viewer-task-item input[type="checkbox"] {
          margin-right: 0.5em;
          cursor: default;
        }
        
        .viewer-task-item input[type="checkbox"]:checked + span {
          text-decoration: line-through;
          opacity: 0.7;
        }
        
        @media (max-width: 640px) {
          .viewer-content {
            font-size: ${Math.max(fontSize - 2, 14)}px !important;
          }
          
          .viewer-content h1 {
            font-size: 1.5em !important;
          }
          
          .viewer-content h2 {
            font-size: 1.25em !important;
          }
          
          .viewer-content h3 {
            font-size: 1.125em !important;
          }
        }
      `}</style>
    </div>
  );
}
