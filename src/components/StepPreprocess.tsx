import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, FastForward, ZoomIn, Download } from 'lucide-react';
import ImageModal from './ImageModal';

interface StepPreprocessProps {
  originalImage: string;
  processedImage?: string | null;
  isSkipped?: boolean;
}

export default function StepPreprocess({ originalImage, processedImage, isSkipped }: StepPreprocessProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  
  const displayProcessedImage = processedImage || originalImage;

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isSkipped) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="glass-card p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-20 h-20 glass-panel rounded-full flex items-center justify-center mb-6 text-cyan-400/30">
            <FastForward size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Tiền xử lý hình ảnh</h2>
          <span className="px-4 py-1.5 glass-panel text-amber-400 border border-amber-500/30 rounded-full text-sm font-medium mb-6">
            Đã bỏ qua (Skipped)
          </span>
          <p className="text-white/60 max-w-md">
            Bước này đã được bỏ qua theo lựa chọn của bạn. Ảnh gốc sẽ được chuyển trực tiếp đến module nhận diện OCR.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-5xl mx-auto"
      >
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Sparkles className="text-cyan-400" size={28} />
              Tiền xử lý hình ảnh
            </h2>
            <span className="px-4 py-1.5 glass-panel text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Đã tối ưu tương phản & loại bỏ nhiễu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white/80 text-center">Ảnh gốc</h3>
              <div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-panel cursor-zoom-in group"
                onClick={() => setModalImage(originalImage)}
              >
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="w-full h-full object-contain filter grayscale-[20%] contrast-75 opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="glass-panel p-3 rounded-full text-white">
                    <ZoomIn size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex justify-center absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-cyan-400">
                <FastForward size={24} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-cyan-400 text-center">Ảnh đã làm sạch nền & Auto-Crop</h3>
              <div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-panel border border-cyan-500/30 cursor-zoom-in group"
                onClick={() => setModalImage(displayProcessedImage)}
              >
                <button
                  onClick={(e) => handleDownload(e, displayProcessedImage, 'preprocessed_image.png')}
                  className="absolute top-3 right-3 p-2 glass-panel rounded-full text-white/70 hover:text-cyan-400 hover:bg-white/20 transition-colors z-20 opacity-0 group-hover:opacity-100"
                  title="Tải ảnh xuống"
                >
                  <Download size={18} />
                </button>
                <img 
                  src={displayProcessedImage} 
                  alt="Processed" 
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="glass-panel p-3 rounded-full text-white">
                    <ZoomIn size={24} />
                  </div>
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
