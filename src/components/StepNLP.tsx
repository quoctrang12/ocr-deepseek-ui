import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Terminal, ChevronRight, ChevronDown } from 'lucide-react';

interface StepNLPProps {
  rawMarkdown: string;
  structuredJson: any;
}

export default function StepNLP({ rawMarkdown, structuredJson }: StepNLPProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Network className="text-cyan-400" size={28} />
            Cấu trúc hóa & Sửa lỗi (NLP Structuring)
          </h2>
          <span className="px-4 py-1.5 glass-panel text-cyan-400 border border-cyan-500/30 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            Đã chuyển đổi sang JSON
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Terminal size={20} className="text-cyan-400" />
              Raw Markdown
            </h3>
            <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden glass-panel bg-black/40 border border-white/10 shadow-inner flex flex-col p-0">
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

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <Network size={20} className="text-cyan-400" />
              Structured JSON
            </h3>
            <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden glass-panel bg-black/40 border border-white/10 shadow-inner flex flex-col p-0">
              <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10">
                <span className="text-xs font-mono font-semibold text-white/60">parsed_data.json</span>
              </div>
              <div className="p-4 overflow-auto flex-grow font-mono text-sm leading-relaxed text-white pb-8">
                <JsonViewer data={structuredJson} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function JsonViewer({ data, name = "root", isLast = true }: { data: any, name?: string, isLast?: boolean }) {
  const [expanded, setExpanded] = useState(true);
  
  if (typeof data !== 'object' || data === null) {
    const valueColor = typeof data === 'string' ? 'text-emerald-400' : typeof data === 'number' ? 'text-amber-400' : 'text-cyan-400';
    const displayValue = typeof data === 'string' ? `"${data}"` : String(data);
    return (
      <div className="pl-4">
        <span className="text-pink-400">"{name}"</span><span className="text-white/50">:</span> <span className={valueColor}>{displayValue}</span>{!isLast && <span className="text-white/50">,</span>}
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  return (
    <div className="pl-4">
      <div 
        className="flex items-center cursor-pointer hover:bg-white/5 rounded px-1 -ml-1 w-fit transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={14} className="text-white/40 mr-1" /> : <ChevronRight size={14} className="text-white/40 mr-1" />}
        {name !== "root" && <><span className="text-pink-400">"{name}"</span><span className="text-white/50">: </span></>}
        <span className="text-white/50">{bracketOpen}</span>
        {!expanded && <span className="text-white/40 italic px-1">...{keys.length} items...</span>}
        {!expanded && <span className="text-white/50">{bracketClose}{!isLast && ','}</span>}
      </div>
      
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {keys.map((key, index) => (
              <JsonViewer 
                key={key} 
                name={isArray ? undefined : key} 
                data={data[key as keyof typeof data]} 
                isLast={index === keys.length - 1} 
              />
            ))}
            <div className="pl-4">
              <span className="text-white/50">{bracketClose}{!isLast && ','}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
