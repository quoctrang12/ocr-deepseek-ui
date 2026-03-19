import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, ZoomIn, Play, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageModal from './ImageModal';

interface StepUploadProps {
  onStart: (files: File[], skipPreprocess: boolean, autoMode: boolean) => void;
  initialImages?: string[];
}

export default function StepUpload({ onStart, initialImages = [] }: StepUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages);
  const [skipPreprocess, setSkipPreprocess] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalImage, setActiveModalImage] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      // Revoke old URLs created in this component
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:') && !initialImages.includes(url)) {
          URL.revokeObjectURL(url);
        }
      });

      setSelectedFiles(imageFiles);
      const urls = imageFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:') && !initialImages.includes(url)) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls, initialImages]);

  const openModal = (url: string) => {
    setActiveModalImage(url);
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div 
          className={`relative flex flex-col items-center justify-center w-full min-h-[24rem] py-8 upload-area
            ${dragActive ? 'dragging' : ''} ${previewUrls.length > 0 ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {previewUrls.length > 0 ? (
            <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full">
                {previewUrls.map((url, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-zoom-in group shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10"
                    onClick={() => openModal(url)}
                  >
                    <img 
                      src={url} 
                      alt={`Preview ${idx + 1}`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="glass-panel p-3 rounded-full text-white">
                        <ZoomIn size={24} />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 glass-panel rounded text-[10px] font-bold text-white/80">
                      #{idx + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-2xl">
                <label className="flex-1 flex items-center justify-between cursor-pointer glass-panel px-4 py-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
                  <span className="text-sm font-medium text-white/90">Bỏ qua tiền xử lý</span>
                  <div className="relative ml-3">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={skipPreprocess} 
                      onChange={(e) => setSkipPreprocess(e.target.checked)} 
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${skipPreprocess ? 'bg-cyan-500' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${skipPreprocess ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>

                <label className="flex-1 flex items-center justify-between cursor-pointer glass-panel px-4 py-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
                  <span className="text-sm font-medium text-white/90">Chạy tự động (Auto)</span>
                  <div className="relative ml-3">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={autoMode} 
                      onChange={(e) => setAutoMode(e.target.checked)} 
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${autoMode ? 'bg-emerald-500' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoMode ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>

              <button
                onClick={() => onStart(selectedFiles, skipPreprocess, autoMode)}
                className="btn-neon px-8 py-3 flex items-center gap-2 text-lg"
              >
                <Play size={20} fill="currentColor" />
                Bắt đầu chấm điểm ({previewUrls.length} ảnh)
              </button>
              <button 
                onClick={() => { setSelectedFiles([]); setPreviewUrls([]); }}
                className="absolute top-4 right-4 p-2 glass-panel hover:bg-white/10 rounded-full text-white/60 hover:text-pink-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-20 h-20 glass-panel rounded-full flex items-center justify-center mb-4 text-cyan-400 shadow-[0_0_15px_rgba(0,225,255,0.2)]">
                <UploadCloud size={40} strokeWidth={1.5} />
              </div>
              <p className="mb-2 text-lg font-semibold text-white">
                Kéo thả nhiều ảnh vào đây
              </p>
              <p className="text-sm text-white/60 mb-6">hoặc click để chọn file từ máy tính</p>
              <label className="cursor-pointer px-6 py-2.5 glass-panel hover:bg-white/10 hover:border-cyan-400 hover:text-cyan-400 text-white font-medium rounded-full transition-all flex items-center gap-2">
                <ImageIcon size={18} />
                Chọn Ảnh
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple
                  onChange={handleChange} 
                />
              </label>
            </div>
          )}
        </div>
      </motion.div>

      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={activeModalImage} 
      />
    </>
  );
}
