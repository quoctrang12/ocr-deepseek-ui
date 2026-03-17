import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanText, Terminal, ZoomIn, Download } from 'lucide-react';
import ImageModal from './ImageModal';

interface StepOCRProps {
  processedImage: string;
  rawMarkdown: string;
}

export default function StepOCR({ processedImage, rawMarkdown }: StepOCRProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Terminal size={20} className="text-cyan-400" />
                Raw Markdown / LaTeX
              </h3>
              <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden glass-panel bg-black/40 border border-white/10 shadow-inner flex flex-col p-0">
                <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-2 text-xs font-mono text-white/40">ocr_output.md</span>
                </div>
                <div className="p-4 overflow-auto flex-grow font-mono text-sm leading-relaxed text-cyan-400">
                  <pre className="whitespace-pre-wrap break-words pb-8">
                    {rawMarkdown}
                  </pre>
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
