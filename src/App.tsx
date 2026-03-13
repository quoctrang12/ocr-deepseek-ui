/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import GradingResult from './components/GradingResult';
import { gradeMathImage, OcrResponse } from './services/apiService';
import { Calculator, Loader2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OcrResponse | null>(null);
  const [error, setError] = useState<string | React.ReactNode | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleGrade = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await gradeMathImage(selectedFile);
      if (res.success) {
        setResult(res);
      } else {
        setError('Có lỗi xảy ra từ máy chủ khi phân tích ảnh.');
      }
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError(
          <div>
            <strong>Lỗi kết nối (Network Error / CORS):</strong>
            <br />
            Trình duyệt đã chặn request đến API ngrok của bạn. Để khắc phục, bạn cần <strong>bật CORS</strong> trên server backend của bạn (FastAPI, Flask, Express, v.v.) để cho phép các domain khác gọi API.
            <br />
            <small className="mt-2 d-block text-white-50">Ví dụ với FastAPI: Thêm <code>CORSMiddleware</code> với <code>allow_origins=["*"]</code>.</small>
          </div>
        );
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 py-5 overflow-hidden">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3 shadow" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Calculator size={40} className="text-info" />
          </div>
          <h1 className="fw-bold text-gradient mb-3">AI Nhận Dạng Toán Học</h1>
          <p className="text-muted fs-5">Tải lên hình ảnh bài tập toán viết tay để AI nhận dạng và chuyển đổi sang Markdown</p>
        </div>

        <div className="row justify-content-center g-4 align-items-stretch">
          {/* Left Column: Uploader */}
          <div className={`${result ? 'col-lg-5 col-xl-5' : 'col-lg-6 col-md-8'} layout-transition`}>
            <div className="glass-card h-100 d-flex flex-column">
              <div className="p-4 p-md-5 flex-grow-1 d-flex flex-column justify-content-center">
                
                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-start shadow-sm rounded-3 mb-4" role="alert">
                    <AlertTriangle className="me-3 mt-1 flex-shrink-0" size={24} />
                    <div>{error}</div>
                  </div>
                )}

                {/* Uploader Component */}
                <ImageUploader 
                  onFileSelect={handleFileSelect} 
                  previewUrl={previewUrl} 
                  onClear={handleClear}
                />

                {/* Action Button */}
                <div className="text-center mt-4">
                  <button
                    className="btn btn-neon btn-lg px-4 py-3 w-100 d-inline-flex align-items-center justify-content-center"
                    onClick={handleGrade}
                    disabled={!selectedFile || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="me-2" size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        Bắt đầu nhận dạng
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Result Component */}
          {result && (
            <div className="col-lg-7 col-xl-7 layout-transition d-flex flex-column" style={{ animation: 'fadeInRight 0.5s ease-out forwards' }}>
              <GradingResult result={result} />
            </div>
          )}
          
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
