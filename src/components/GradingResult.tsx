import React from 'react';
import { GradeResponse } from '../services/apiService';
import { CheckCircle, XCircle, AlertCircle, FileText, ListChecks, MessageSquare } from 'lucide-react';

interface Props {
  result: GradeResponse;
}

export default function GradingResult({ result }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#00ff87'; // Neon Green
    if (score >= 5) return '#ffea00'; // Neon Yellow
    return '#ff007a'; // Neon Pink
  };

  const scoreColor = getScoreColor(result.final_score);

  return (
    <div className="glass-card h-100 d-flex flex-column">
      <div className="border-bottom border-light border-opacity-10 p-4">
        <h4 className="mb-0 fw-bold d-flex align-items-center text-white">
          <ListChecks className="me-3 text-info" size={28} /> Kết quả phân tích & Chấm điểm
        </h4>
      </div>
      <div className="p-4 p-md-4 flex-grow-1">
        <div className="row g-4 h-100">
          <div className="col-xl-8 d-flex flex-column">
            {/* OCR Text */}
            <div className="mb-4">
              <h5 className="text-white-50 mb-3 d-flex align-items-center">
                <FileText size={20} className="me-2 text-info" /> Văn bản nhận dạng (OCR)
              </h5>
              <div className="glass-panel font-monospace text-white">
                {result.recognized_text}
              </div>
            </div>

            {/* Step by step */}
            <div className="mb-4 flex-grow-1">
              <h5 className="text-white-50 mb-3 d-flex align-items-center">
                <ListChecks size={20} className="me-2 text-info" /> Phân tích từng bước
              </h5>
              <div className="glass-panel p-0 overflow-hidden h-100">
                <ul className="list-group list-group-flush">
                  {result.step_by_step_analysis.map((step, index) => {
                    const isCorrect = step.toLowerCase().includes('(đúng)');
                    const isWrong = step.toLowerCase().includes('(sai');
                    
                    let icon = <AlertCircle color="#ffea00" size={20} />;
                    let bgStyle = {};
                    
                    if (isCorrect) {
                      icon = <CheckCircle color="#00ff87" size={20} />;
                      bgStyle = { background: 'rgba(0, 255, 135, 0.05)' };
                    } else if (isWrong) {
                      icon = <XCircle color="#ff007a" size={20} />;
                      bgStyle = { background: 'rgba(255, 0, 122, 0.05)' };
                    }

                    return (
                      <li key={index} className="list-group-item d-flex align-items-start p-3 border-bottom border-light border-opacity-10" style={bgStyle}>
                        <span className="me-3 mt-1">{icon}</span>
                        <span className="fw-medium text-white">{step}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <h5 className="text-white-50 mb-3 d-flex align-items-center">
                <MessageSquare size={20} className="me-2 text-info" /> Nhận xét của giáo viên AI
              </h5>
              <div className="alert alert-info border-0 d-flex align-items-start mb-0">
                <MessageSquare className="me-3 mt-1 flex-shrink-0" size={24} />
                <p className="mb-0 fs-6">{result.feedback}</p>
              </div>
            </div>
          </div>
          
          {/* Score */}
          <div className="col-xl-4 d-flex flex-column align-items-center justify-content-center border-start-xl p-3">
            <h5 className="text-white-50 mb-4 text-uppercase fw-bold" style={{ letterSpacing: '2px' }}>Điểm số</h5>
            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '160px', height: '160px' }}>
              {/* Glowing background for the circle */}
              <div 
                className="position-absolute w-100 h-100 rounded-circle" 
                style={{ 
                  background: scoreColor, 
                  filter: 'blur(30px)', 
                  opacity: 0.2 
                }} 
              />
              <svg className="position-absolute w-100 h-100" viewBox="0 0 36 36">
                <path
                  className="text-white text-opacity-10"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  strokeDasharray={`${(result.final_score / 10) * 100}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ 
                    filter: `drop-shadow(0 0 8px ${scoreColor})`,
                    transition: 'stroke-dasharray 1s ease-out'
                  }}
                />
              </svg>
              <div className="position-absolute text-center">
                <span className="display-4 fw-bold text-gradient-score" style={{ backgroundImage: `linear-gradient(135deg, ${scoreColor} 0%, #ffffff 100%)` }}>
                  {result.final_score}
                </span>
                <span className="text-white-50 fs-5">/10</span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              {result.final_score >= 8 ? (
                <span className="badge fs-6 px-4 py-2 rounded-pill" style={{ background: 'rgba(0, 255, 135, 0.2)', color: '#00ff87', border: '1px solid rgba(0, 255, 135, 0.3)' }}>Xuất sắc!</span>
              ) : result.final_score >= 5 ? (
                <span className="badge fs-6 px-4 py-2 rounded-pill" style={{ background: 'rgba(255, 234, 0, 0.2)', color: '#ffea00', border: '1px solid rgba(255, 234, 0, 0.3)' }}>Cần cố gắng thêm</span>
              ) : (
                <span className="badge fs-6 px-4 py-2 rounded-pill" style={{ background: 'rgba(255, 0, 122, 0.2)', color: '#ff007a', border: '1px solid rgba(255, 0, 122, 0.3)' }}>Cần ôn tập lại</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
