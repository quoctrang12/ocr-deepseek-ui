/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Loader2, ChevronLeft, ChevronRight, Settings, Play, AlertCircle } from 'lucide-react';
import Stepper from './components/Stepper';
import StepUpload from './components/StepUpload';
import StepPreprocess from './components/StepPreprocess';
import StepOCR from './components/StepOCR';
import StepNLP from './components/StepNLP';
import StepGrading from './components/StepGrading';
import ConfigModal from './components/ConfigModal';
import { apiService, GradingResult, base64ToFile, OcrResponse } from './services/apiService';

const DEFAULT_CONFIG = JSON.stringify({
  "questions": [
    {
      "question_number": "Bài 1",
      "question_max_score": 1.5,
      "problem": "Giải các phương trình sau: a) (1-2x)(x+5)=0; b) (x+2)/(x-2) - (x-2)/(2+x) = (x^2+16)/(x^2-4).",
      "sub_parts": [
        {
          "part": "a",
          "part_max_score": 0.75,
          "score_rules": {
            "use_rubric_sum_as_part_max": true
          },
          "problem": "Giải phương trình (1-2x)(x+5)=0.",
          "teacher_solution_steps": [
            "Vì (1-2x)(x+5)=0 nên 1-2x=0 hoặc x+5=0.",
            "Từ 1-2x=0 suy ra x=1/2.",
            "Từ x+5=0 suy ra x=-5.",
            "Vậy nghiệm là x=1/2 hoặc x=-5."
          ],
          "rubric": [
            {
              "criterion_id": "R1",
              "description": "Tách đúng hai phương trình thành phần 1-2x=0 và x+5=0",
              "max_score": 0.25
            },
            {
              "criterion_id": "R2",
              "description": "Tìm đúng hai nghiệm x=1/2 và x=-5",
              "max_score": 0.25
            },
            {
              "criterion_id": "R3",
              "description": "Kết luận đúng tập nghiệm",
              "max_score": 0.25
            }
          ]
        },
        {
          "part": "b",
          "part_max_score": 0.75,
          "score_rules": {
            "use_rubric_sum_as_part_max": true
          },
          "problem": "Giải phương trình (x+2)/(x-2) - (x-2)/(2+x) = (x^2+16)/(x^2-4).",
          "teacher_solution_steps": [
            "Điều kiện xác định: x ≠ 2, x ≠ -2.",
            "Quy đồng và rút gọn được (x+2)^2 - (x-2)^2 = x^2 + 16.",
            "Khai triển và rút gọn được 8x = x^2 + 16.",
            "Chuyển vế được x^2 - 8x + 16 = 0.",
            "Suy ra (x-4)^2 = 0 nên x = 4.",
            "Giá trị này thỏa điều kiện, vậy nghiệm là x = 4."
          ],
          "rubric": [
            {
              "criterion_id": "R1",
              "description": "Nêu đúng điều kiện xác định và quy đồng/rút gọn đúng về (x+2)^2 - (x-2)^2 = x^2+16",
              "max_score": 0.25
            },
            {
              "criterion_id": "R2",
              "description": "Biến đổi đúng đến phương trình x^2 - 8x + 16 = 0",
              "max_score": 0.25
            },
            {
              "criterion_id": "R3",
              "description": "Tìm đúng nghiệm x = 4 và kết luận đúng",
              "max_score": 0.25
            }
          ]
        }
      ]
    }
  ]
}, null, 2);

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]);
  const [processedBlobs, setProcessedBlobs] = useState<Blob[]>([]);
  const [processedImageUrls, setProcessedImageUrls] = useState<string[]>([]);
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null);
  const [structuredJson, setStructuredJson] = useState<any>(null);
  const [gradingResult, setGradingResult] = useState<any>(null);
  
  const [isPreprocessSkipped, setIsPreprocessSkipped] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  
  // Progress bar state
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');

  // Config modal state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configJson, setConfigJson] = useState(DEFAULT_CONFIG);

  // Cleanup original image URLs
  useEffect(() => {
    return () => {
      originalImageUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [originalImageUrls]);

  // Cleanup processed image URLs
  useEffect(() => {
    return () => {
      processedImageUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [processedImageUrls]);

  const updateProgress = (text: string, value: number) => {
    setProcessingText(text);
    setProgress(value);
  };

  const startProcessing = async (files: File[], skipPreprocess: boolean, auto: boolean) => {
    setError(null);
    if (files.length === 0 && originalFiles.length === 0) {
      setError('Vui lòng chọn ít nhất một tệp hình ảnh.');
      return;
    }

    const currentFiles = files.length > 0 ? files : originalFiles;
    if (files.length > 0) {
      setOriginalFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setOriginalImageUrls(urls);
    }
    
    setIsPreprocessSkipped(skipPreprocess);
    setAutoMode(auto);

    try {
      setIsProcessing(true);
      
      // Step 1: Preprocess
      let filesToUse: File[];
      if (!skipPreprocess) {
        updateProgress('Đang gọi API tiền xử lý hình ảnh...', 20);
        const base64s = await apiService.cleanImage(currentFiles);
        
        // Convert base64s to Files
        const cleanedFiles = base64s.map((base64, idx) => 
          base64ToFile(base64, `cleaned_image_${idx + 1}.png`)
        );
        setProcessedBlobs(cleanedFiles);
        
        const urls = cleanedFiles.map(file => URL.createObjectURL(file));
        setProcessedImageUrls(urls);
        filesToUse = cleanedFiles;
      } else {
        setProcessedBlobs(currentFiles);
        const urls = currentFiles.map(file => URL.createObjectURL(file));
        setProcessedImageUrls(urls);
        filesToUse = currentFiles;
      }
      
      setCurrentStep(1);
      setMaxReachedStep(1);

      if (auto) {
        const markdown = await runOCRStep(filesToUse);
        const json = await runNLPStep(markdown);
        await runGradingStep(json);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình xử lý.');
      setIsProcessing(false);
    } finally {
      if (!auto) setIsProcessing(false);
    }
  };

  const runOCRStep = async (files: Array<File | Blob>) => {
    updateProgress('Đang gọi API nhận diện chữ viết (OCR)...', 40);
    const result = await apiService.ocrImage(files);
    setOcrResult(result);
    setCurrentStep(2);
    setMaxReachedStep(2);
    return result.markdown_result || result.raw_result;
  };

  const runNLPStep = async (text: string) => {
    updateProgress('Đang gọi API phân tích cấu trúc (NLP)...', 70);
    const json = await apiService.fixAndStruct(text);
    setStructuredJson(json);
    setCurrentStep(3);
    setMaxReachedStep(3);
    return json;
  };

  const runGradingStep = async (json: any) => {
    updateProgress('Đang gọi API chấm điểm...', 90);
    const result = await apiService.grade(configJson, json);
    
    // Map Swagger result to UI expectations
    const mappedResult = {
      score: result.total_score,
      maxScore: result.total_max_score,
      steps: result.parts.map((part: any, idx: number) => {
        const partDeduction = part.deduction || 0;
        return {
          id: idx + 1,
          content: `**${part.question} ${part.part}**: ${part.explanation_vi || part.explanation_en}`,
          isCorrect: partDeduction === 0,
          feedback: part.criteria
            .map((c: any) => {
              const criterionDeduction = (c.max_score || 0) - (c.awarded_score || 0);
              if (criterionDeduction > 0) {
                return `• ${c.reason} (Trừ ${criterionDeduction}đ)`;
              }
              return `• ${c.reason}`;
            })
            .join('\n\n')
        };
      })
    };
    
    setGradingResult(mappedResult);
    setCurrentStep(4);
    setMaxReachedStep(4);
    updateProgress('Hoàn tất!', 100);
    setIsProcessing(false);
    return mappedResult;
  };

  const processNextStep = async () => {
    setError(null);
    const nextStep = maxReachedStep + 1;
    try {
      setIsProcessing(true);
      if (nextStep === 2) {
        await runOCRStep(processedBlobs.length > 0 ? processedBlobs : originalFiles);
      } else if (nextStep === 3) {
        await runNLPStep(ocrResult?.markdown_result || ocrResult?.raw_result || '');
      } else if (nextStep === 4) {
        await runGradingStep(structuredJson);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsProcessing(false);
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

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-white/40 hover:text-white">✕</button>
          </motion.div>
        )}

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
              <StepUpload key="step0" onStart={startProcessing} initialImages={originalImageUrls} />
            )}
            
            {currentStep === 1 && originalImageUrls.length > 0 && (
              <StepPreprocess key="step1" originalImages={originalImageUrls} processedImages={processedImageUrls} isSkipped={isPreprocessSkipped} />
            )}
            
            {currentStep === 2 && processedImageUrls.length > 0 && ocrResult && (
              <StepOCR 
                key="step2" 
                processedImages={processedImageUrls} 
                ocrResult={ocrResult} 
                isSkipped={isPreprocessSkipped}
              />
            )}
            
            {currentStep === 3 && (
              <StepNLP key="step3" rawMarkdown={ocrResult?.markdown_result || ocrResult?.raw_result || ''} structuredJson={structuredJson} />
            )}
            
            {currentStep === 4 && gradingResult && (
              <StepGrading key="step4" gradingResult={gradingResult} />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls for Reviewing */}
        {!isProcessing && maxReachedStep > 0 && (
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
