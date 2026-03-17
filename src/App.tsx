/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Loader2, ChevronLeft, ChevronRight, Settings, Play } from 'lucide-react';
import Stepper from './components/Stepper';
import StepUpload from './components/StepUpload';
import StepPreprocess from './components/StepPreprocess';
import StepOCR from './components/StepOCR';
import StepNLP from './components/StepNLP';
import StepGrading from './components/StepGrading';
import ConfigModal from './components/ConfigModal';
import { mockData } from './mockData';

const DEFAULT_CONFIG = JSON.stringify({
  "exam_id": "MATH_101",
  "questions": [
    { "id": "1", "points": 2.0, "type": "multiple_choice" },
    { "id": "2", "points": 3.0, "type": "essay" },
    { "id": "3", "points": 5.0, "type": "essay" }
  ]
}, null, 2);

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Image states
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  const [isPreprocessSkipped, setIsPreprocessSkipped] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  
  // Progress bar state
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');

  // Config modal state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configJson, setConfigJson] = useState(DEFAULT_CONFIG);

  const simulateProgress = async (text: string, duration: number) => {
    setIsProcessing(true);
    setProcessingText(text);
    setProgress(0);
    const steps = 20;
    const stepTime = duration / steps;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, stepTime));
      setProgress(i * (100 / steps));
    }
    setIsProcessing(false);
  };

  const startProcessing = async (file: File | null, skipPreprocess: boolean, auto: boolean) => {
    let currentImageUrl = originalImage;
    if (file) {
      currentImageUrl = URL.createObjectURL(file);
      setOriginalImage(currentImageUrl);
    }
    
    setIsPreprocessSkipped(skipPreprocess);
    setAutoMode(auto);

    if (auto) {
      if (!skipPreprocess) {
        await simulateProgress('Đang gọi API tiền xử lý hình ảnh...', 2500);
        // Simulate API returning base64 (using original image for now)
        setProcessedImage(currentImageUrl);
      } else {
        setProcessedImage(currentImageUrl);
      }
      setCurrentStep(1);
      setMaxReachedStep(1);

      await simulateProgress('Đang gọi API nhận diện chữ viết (OCR)...', 3000);
      setCurrentStep(2);
      setMaxReachedStep(2);

      await simulateProgress('Đang gọi API phân tích cấu trúc (NLP)...', 2500);
      setCurrentStep(3);
      setMaxReachedStep(3);

      await simulateProgress('Đang gọi API chấm điểm...', 2000);
      setCurrentStep(4);
      setMaxReachedStep(4);
    } else {
      if (!skipPreprocess) {
        await simulateProgress('Đang gọi API tiền xử lý hình ảnh...', 2500);
        setProcessedImage(currentImageUrl);
      } else {
        setProcessedImage(currentImageUrl);
      }
      setCurrentStep(1);
      setMaxReachedStep(1);
    }
  };

  const processNextStep = async () => {
    const nextStep = maxReachedStep + 1;
    if (nextStep === 2) {
      await simulateProgress('Đang gọi API nhận diện chữ viết (OCR)...', 3000);
      setCurrentStep(2);
      setMaxReachedStep(2);
    } else if (nextStep === 3) {
      await simulateProgress('Đang gọi API phân tích cấu trúc (NLP)...', 2500);
      setCurrentStep(3);
      setMaxReachedStep(3);
    } else if (nextStep === 4) {
      await simulateProgress('Đang gọi API chấm điểm...', 2000);
      setCurrentStep(4);
      setMaxReachedStep(4);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= maxReachedStep && !isProcessing) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 border-b border-white/10 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,225,255,0.4)]">
              <Calculator size={24} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-gradient">
              MathAI Grader
              <span className="ml-3 text-xs font-medium px-2.5 py-1 glass-panel text-cyan-400 rounded-md border border-cyan-500/30 align-middle">
                Nhóm 10 Môn TTNTNC
              </span>
            </h1>
          </div>
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="p-2 glass-panel rounded-full text-white/70 hover:text-cyan-400 hover:bg-white/10 transition-colors"
            title="Cấu hình đề bài"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Stepper 
          currentStep={currentStep} 
          maxReachedStep={maxReachedStep} 
          onStepClick={handleStepClick} 
        />

        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8 glass-card p-4 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,225,255,0.2)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-cyan-400 font-medium flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {processingText}
              </span>
              <span className="text-white/80 text-sm font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(0,225,255,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <StepUpload key="step0" onStart={startProcessing} initialImage={originalImage} />
            )}
            
            {currentStep === 1 && originalImage && (
              <StepPreprocess key="step1" originalImage={originalImage} processedImage={processedImage} isSkipped={isPreprocessSkipped} />
            )}
            
            {currentStep === 2 && processedImage && (
              <StepOCR key="step2" processedImage={processedImage} rawMarkdown={mockData.rawMarkdown} />
            )}
            
            {currentStep === 3 && (
              <StepNLP key="step3" rawMarkdown={mockData.rawMarkdown} structuredJson={mockData.structuredJson} />
            )}
            
            {currentStep === 4 && (
              <StepGrading key="step4" gradingResult={mockData.gradingResult} />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls for Reviewing */}
        {!isProcessing && maxReachedStep > 0 && currentStep > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 flex flex-col items-center justify-center gap-6"
          >
            {currentStep === maxReachedStep && maxReachedStep < 4 && !autoMode && (
              <button
                onClick={processNextStep}
                className="btn-neon px-8 py-3 flex items-center gap-2 text-lg"
              >
                Tiếp tục: {maxReachedStep === 1 ? 'Chạy OCR' : maxReachedStep === 2 ? 'Phân tích NLP' : 'Chấm điểm'}
                <Play size={20} fill="currentColor" />
              </button>
            )}

            <div className="flex items-center gap-6">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2.5 glass-panel rounded-full text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Quay lại
              </button>
              <button
                onClick={() => setCurrentStep(prev => Math.min(maxReachedStep, prev + 1))}
                disabled={currentStep === maxReachedStep}
                className="px-6 py-2.5 glass-card rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,225,255,0.1)]"
              >
                Tiếp theo
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <ConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        configJson={configJson} 
        onSave={setConfigJson} 
      />
    </div>
  );
}
