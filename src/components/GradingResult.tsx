import React from 'react';
import { OcrResponse } from '../services/apiService';
import { FileText, CheckCircle, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Props {
  result: OcrResponse;
}

export default function GradingResult({ result }: Props) {
  // Hàm chuyển đổi các delimiter toán học của LaTeX \( \) và \[ \] sang $ và $$ để remark-math có thể hiểu được
  const formatMathString = (text: string) => {
    if (!text) return '';
    let formatted = text.replace(/\\\(/g, () => '$').replace(/\\\)/g, () => '$');
    formatted = formatted.replace(/\\\[/g, () => '$$').replace(/\\\]/g, () => '$$');
    return formatted;
  };

  const contentToRender = result.markdown_result || result.raw_result || '';
  const formattedContent = formatMathString(contentToRender);

  return (
    <div className="glass-card h-100 d-flex flex-column animate__animated animate__fadeIn">
      <div className="border-bottom border-light border-opacity-10 p-4">
        <h4 className="mb-0 fw-bold d-flex align-items-center text-white">
          <CheckCircle className="me-3 text-info" size={28} /> Kết quả nhận dạng Toán học
        </h4>
      </div>
      <div className="p-4 p-md-5 flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="row g-4 h-100">
          <div className="col-12 d-flex flex-column">
            
            {/* Markdown Rendered Result */}
            <div className="mb-4">
              <h5 className="text-white-50 mb-3 d-flex align-items-center">
                <FileText size={20} className="me-2 text-info" /> Kết quả hiển thị (Markdown & Math)
              </h5>
              <div className="glass-panel text-white fs-5" style={{ lineHeight: '1.8' }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {formattedContent}
                </ReactMarkdown>
              </div>
            </div>

            {/* Raw Text Result */}
            <div className="mb-4 flex-grow-1">
              <h5 className="text-white-50 mb-3 d-flex align-items-center">
                <Code size={20} className="me-2 text-warning" /> Văn bản thô (Raw Result)
              </h5>
              <div className="glass-panel font-monospace text-white-50 p-3 overflow-auto" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', maxHeight: '300px' }}>
                {result.raw_result}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
