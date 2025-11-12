"use client";

import { useEffect, useState } from "react";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Highlighter,
  Link as LinkIcon,
  Trash2,
  Copy,
  Scissors
} from "lucide-react";
import { Editor } from "@tiptap/react";

interface ContextMenuProps {
  editor: Editor | null;
}

export function ContextMenu({ editor }: ContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!editor) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      // Get selected text
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, [editor]);

  if (!isVisible || !editor) return null;

  const { from, to } = editor.state.selection;
  const hasSelection = from !== to;

  const menuItems = [
    {
      icon: <Bold className="w-4 h-4" />,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
    },
    {
      icon: <UnderlineIcon className="w-4 h-4" />,
      label: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive('underline'),
    },
    {
      icon: <Highlighter className="w-4 h-4" />,
      label: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      active: editor.isActive('highlight'),
    },
    { divider: true },
    {
      icon: <Copy className="w-4 h-4" />,
      label: "Copy",
      action: () => {
        if (hasSelection) {
          const text = editor.state.doc.textBetween(from, to);
          navigator.clipboard.writeText(text);
        }
      },
      disabled: !hasSelection,
    },
    {
      icon: <Scissors className="w-4 h-4" />,
      label: "Cut",
      action: () => {
        if (hasSelection) {
          const text = editor.state.doc.textBetween(from, to);
          navigator.clipboard.writeText(text);
          editor.chain().focus().deleteSelection().run();
        }
      },
      disabled: !hasSelection,
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: "Delete",
      action: () => editor.chain().focus().deleteSelection().run(),
      disabled: !hasSelection,
    },
  ];

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[180px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => {
        if ('divider' in item) {
          return <div key={index} className="h-px bg-gray-200 my-1" />;
        }

        return (
          <button
            key={index}
            onClick={() => {
              item.action();
              setIsVisible(false);
            }}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              item.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : item.active
                ? 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
