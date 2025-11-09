"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
}

export function MarkdownRenderer({
  content,
  fontSize = 16,
  fontFamily = "Arial",
  textColor = "#000000",
}: MarkdownRendererProps) {
  return (
    <div
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        color: textColor,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg overflow-hidden"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              className="bg-gradient-to-r from-violet-50 to-purple-50"
              {...props}
            />
          ),
          tbody: ({ node, ...props }) => (
            <tbody
              className="divide-y divide-gray-200 bg-white"
              {...props}
            />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="hover:bg-gray-50 transition-colors"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-300"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-6 py-4 text-sm text-gray-700 border-b border-gray-200"
              {...props}
            />
          ),
          h1: ({ node, ...props }) => (
            <h1
              className="text-4xl font-bold mt-8 mb-4 text-gray-900"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-3xl font-bold mt-6 mb-3 text-gray-900"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-2xl font-semibold mt-5 mb-2 text-gray-900"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-xl font-semibold mt-4 mb-2 text-gray-900"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside mb-4 space-y-2"
              {...props}
            />
          ),
          ol: ({ node, ...props}) => (
            <ol
              className="list-decimal list-inside mb-4 space-y-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-violet-500 pl-4 py-2 my-4 italic bg-gray-50 rounded-r"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code
                className="bg-gray-100 px-2 py-1 rounded text-sm font-mono"
                {...props}
              />
            ) : (
              <code
                className="block bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"
                {...props}
              />
            ),
          pre: ({ node, ...props }) => (
            <pre
              className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-violet-600 hover:text-violet-800 underline"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-gray-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
