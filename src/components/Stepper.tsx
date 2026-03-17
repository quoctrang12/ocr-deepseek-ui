import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  maxReachedStep: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { id: 0, title: 'Upload' },
  { id: 1, title: 'Tiền xử lý' },
  { id: 2, title: 'OCR' },
  { id: 3, title: 'Phân tích NLP' },
  { id: 4, title: 'Chấm điểm' },
];

export default function Stepper({ currentStep, maxReachedStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-8 px-4 glass-card mb-10">
      <div className="flex items-center justify-between relative max-w-4xl mx-auto">
        {/* Background Track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-white/5 -z-10 rounded-full"></div>
        
        {/* Active Track */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-cyan-500 to-cyan-300 -z-10 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(0,225,255,0.6)]"
          style={{ width: `${(maxReachedStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isUnlocked = index <= maxReachedStep;
          const isCompleted = isUnlocked && !isCurrent;

          return (
            <div 
              key={step.id} 
              className={`flex flex-col items-center relative ${isUnlocked ? 'cursor-pointer group' : 'cursor-not-allowed'}`}
              onClick={() => isUnlocked && onStepClick(index)}
            >
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500
                  ${isCurrent ? 'bg-slate-900 text-cyan-400 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,225,255,0.6)] scale-110' : 
                    isCompleted ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,225,255,0.4)] border-2 border-cyan-400 group-hover:bg-cyan-400' : 
                    'bg-slate-800/80 text-white/30 border-2 border-white/10'}`}
              >
                {isCompleted ? <Check size={24} className="stroke-[3]" /> : step.id + 1}
              </div>
              <span 
                className={`absolute -bottom-8 text-sm whitespace-nowrap transition-all duration-300
                  ${isCurrent ? 'text-cyan-400 font-bold tracking-wide' : isUnlocked ? 'text-white/80 font-medium' : 'text-white/30'}`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
