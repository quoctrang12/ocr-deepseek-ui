import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';
import MathRenderer from './MathRenderer';

interface StepGradingProps {
  gradingResult: any;
}

export default function StepGrading({ gradingResult }: StepGradingProps) {
  const { score, maxScore, steps } = gradingResult;
  const percentage = (score / maxScore) * 100;
  
  let scoreColor = 'text-pink-500';
  let ringColor = 'ring-pink-500/30';
  let bgColor = 'bg-pink-500/10';
  
  if (percentage >= 80) {
    scoreColor = 'text-emerald-400';
    ringColor = 'ring-emerald-500/30';
    bgColor = 'bg-emerald-500/10';
  } else if (percentage >= 50) {
    scoreColor = 'text-amber-400';
    ringColor = 'ring-amber-500/30';
    bgColor = 'bg-amber-500/10';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass-card overflow-hidden">
        {/* Header - Score */}
        <div className="bg-black/20 p-8 border-b border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="text-cyan-400" size={24} />
            Kết quả Chấm điểm
          </h2>
          
          <div className={`w-40 h-40 rounded-full ${bgColor} ring-8 ${ringColor} flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,225,255,0.2)] relative z-10 glass-panel`}>
            <span className={`text-5xl font-black ${scoreColor} text-gradient-score`}>{score}</span>
            <div className="w-12 h-0.5 bg-white/20 my-2"></div>
            <span className="text-xl font-bold text-white/50">{maxScore}</span>
          </div>
          
          <p className="mt-6 text-white/60 font-medium text-center max-w-md">
            Hệ thống đã phân tích từng bước giải và đưa ra nhận xét chi tiết bên dưới.
          </p>
        </div>

        {/* Body - Step-by-step Feedback */}
        <div className="p-6 md:p-8 bg-transparent pb-12">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
            Chi tiết bài làm
          </h3>
          
          <div className="space-y-6">
            {steps.map((step: any, index: number) => (
              <div key={step.id} className="relative">
                {/* Step Content */}
                <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors glass-panel
                  ${step.isCorrect 
                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                    : 'bg-pink-500/5 border-pink-500/30'}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {step.isCorrect ? (
                      <CheckCircle2 className="text-emerald-400" size={24} />
                    ) : (
                      <XCircle className="text-pink-500" size={24} />
                    )}
                  </div>
                  
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/60 bg-white/10 px-2 py-1 rounded-md">
                        Bước {index + 1}
                      </span>
                    </div>
                    
                    <div className="text-white text-lg">
                      <MathRenderer content={step.content} />
                    </div>
                  </div>
                </div>

                {/* AI Feedback Block (if incorrect) */}
                {!step.isCorrect && step.feedback && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 ml-12 p-4 glass-panel bg-amber-500/10 border border-amber-500/30 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-sm font-bold text-amber-400 mb-1">AI Nhận xét</h4>
                        <div className="text-white/80 text-sm leading-relaxed">
                          <MathRenderer content={step.feedback} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
