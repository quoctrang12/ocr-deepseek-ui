import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanText, Terminal, ZoomIn, Download, Eye, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ImageModal from './ImageModal';
import { OcrResponse } from '../services/apiService';

interface StepOCRProps {
  processedImage: string;
  ocrResult: OcrResponse;
}

export default function StepOCR({ processedImage, ocrResult }: StepOCRProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper to convert LaTeX delimiters if needed
  const formatMathString = (text: string) => {
    if (!text) return '';
    // Some OCR models might use \( \) or \[ \] which need to be handled
    // react-markdown with remark-math usually handles $ and $$ better
    let formatted = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    formatted = formatted.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
    return formatted;
  };

  const contentToRender = ocrResult.markdown_result || ocrResult.raw_result || '';
  const formattedContent = formatMathString(contentToRender);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <ScanText className="text-cyan-400" size={28} />
              Nhận diện chữ viết (Math OCR)
            </h2>
            <span className="px-4 py-1.5 glass-panel text-cyan-400 border border-cyan-500/30 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              Đã trích xuất Markdown & LaTeX
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white/80">Ảnh đã làm sạch</h3>
              <div 
                className="relative h-full min-h-[400px] rounded-2xl overflow-hidden glass-panel p-4 flex items-center justify-center cursor-zoom-in group"
                onClick={() => setModalImage(processedImage)}
              >
                <button
                  onClick={(e) => handleDownload(e, processedImage, 'ocr_processed_image.png')}
                  className="absolute top-3 right-3 p-2 glass-panel rounded-full text-white/70 hover:text-cyan-400 hover:bg-white/20 transition-colors z-20 opacity-0 group-hover:opacity-100"
                  title="Tải ảnh xuống"
                >
                  <Download size={18} />
                </button>
                <img 
                  src={processedImage} 
                  alt="Processed" 
                  className="max-w-full max-h-full object-contain filter contrast-125 brightness-110 saturate-0 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="glass-panel p-3 rounded-full text-white">
                    <ZoomIn size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Terminal size={20} className="text-cyan-400" />
                  Kết quả nhận diện
                </h3>
                <div className="flex glass-panel p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                      viewMode === 'preview' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Eye size={14} />
                    Xem trước
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                      viewMode === 'raw' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Code size={14} />
                    Mã nguồn
                  </button>
                </div>
              </div>
              
              <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden glass-panel bg-black/40 border border-white/10 shadow-inner flex flex-col p-0">
                <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-2 text-xs font-mono text-white/40">
                    {viewMode === 'preview' ? 'preview_output.md' : 'raw_output.md'}
                  </span>
                </div>
                
                <div className="p-6 overflow-auto flex-grow text-white">
                  <AnimatePresence mode="wait">
                    {viewMode === 'preview' ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="prose prose-invert prose-cyan max-w-none prose-p:leading-relaxed prose-headings:text-cyan-400"
                      >
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath]} 
                          rehypePlugins={[rehypeKatex]}
                        >
                          {formattedContent}
                        </ReactMarkdown>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="raw"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-sm leading-relaxed text-cyan-400"
                      >
                        <pre className="whitespace-pre-wrap break-words pb-8">
                          {contentToRender}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ImageModal 
        isOpen={!!modalImage} 
        onClose={() => setModalImage(null)} 
        imageUrl={modalImage || ''} 
      />
    </>
  );
}
