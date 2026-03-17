import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export default function MathRenderer({ content, className = '' }: MathRendererProps) {
  // Pre-process LaTeX delimiters if needed (e.g., \( \) to $, \[ \] to $$)
  const formatMathString = (text: string) => {
    if (!text) return '';
    let formatted = text.replace(/\\\(/g, () => '$').replace(/\\\)/g, () => '$');
    formatted = formatted.replace(/\\\[/g, () => '$$').replace(/\\\]/g, () => '$$');
    return formatted;
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {formatMathString(content)}
      </ReactMarkdown>
    </div>
  );
}
