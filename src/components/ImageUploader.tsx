import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
}

export default function ImageUploader({ onFileSelect, previewUrl, onClear }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSelectFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Lỗi: Chỉ chấp nhận định dạng .jpg, .png, .jpeg');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!previewUrl) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="mb-3 flex-grow-1 d-flex flex-column">
      <div
        className={`p-4 text-center position-relative upload-area flex-grow-1 d-flex flex-column align-items-center justify-content-center ${
          isDragging ? 'dragging' : ''
        } ${previewUrl ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ cursor: previewUrl ? 'default' : 'pointer', minHeight: '300px' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="d-none"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileInput}
        />
        
        {previewUrl ? (
          <div className="position-relative d-inline-block w-100 h-100 d-flex align-items-center justify-content-center">
            <button 
              className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle shadow"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              title="Xóa ảnh"
              style={{ zIndex: 10, width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', right: 0, transform: 'translate(25%, -25%)' }}
            >
              <X size={18} />
            </button>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="img-fluid rounded shadow-lg" 
              style={{ maxHeight: '65vh', maxWidth: '100%', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.2)' }} 
            />
          </div>
        ) : (
          <div className="py-5 text-muted">
            <UploadCloud size={64} className="mb-3 text-info opacity-75" />
            <h5 className="fw-bold text-white mb-2">Kéo thả hình ảnh bài tập vào đây</h5>
            <p className="mb-0">Hoặc click để chọn file từ máy tính</p>
            <small className="text-white-50 d-block mt-3">
              <ImageIcon size={14} className="me-1" />
              Hỗ trợ: .jpg, .jpeg, .png
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
