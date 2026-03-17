import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileJson } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configJson: string;
  onSave: (json: string) => void;
}

export default function ConfigModal({ isOpen, onClose, configJson, onSave }: ConfigModalProps) {
  const [localJson, setLocalJson] = useState(configJson);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalJson(configJson);
    setError(null);
  }, [configJson, isOpen]);

  const handleSave = () => {
    try {
      // Validate JSON
      JSON.parse(localJson);
      setError(null);
      onSave(localJson);
      onClose();
    } catch (err) {
      setError("JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-2xl glass-card border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileJson className="text-cyan-400" />
                Cấu hình Đề bài & Thang điểm
              </h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-grow flex flex-col gap-4">
              <p className="text-sm text-white/70">
                Nhập JSON cấu hình đề bài, bao gồm ID câu hỏi, loại câu hỏi và điểm số tương ứng. Hệ thống sẽ dùng cấu hình này để chấm điểm.
              </p>
              
              <div className="relative flex-grow">
                <textarea
                  value={localJson}
                  onChange={(e) => setLocalJson(e.target.value)}
                  className="w-full h-64 bg-black/50 text-cyan-400 font-mono text-sm p-4 rounded-xl border border-white/10 focus:border-cyan-500/50 outline-none resize-none shadow-inner"
                  spellCheck={false}
                />
              </div>
              
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-full glass-panel text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-[0_0_15px_rgba(0,225,255,0.4)] transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Lưu cấu hình
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
