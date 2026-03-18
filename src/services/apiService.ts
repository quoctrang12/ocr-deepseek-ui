/**
 * API Service for MathAI Grader
 * Handles communication with the backend endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GradingResult {
  success: boolean;
  total_score: number;
  total_max_score: number;
  parts: Array<{
    question: string;
    part: string;
    score: number;
    final_score: number;
    expected_max_score: number;
    deduction: number;
    criteria: Array<{
      criterion_id: string;
      awarded_score: number;
      max_score: number;
      reason: string;
    }>;
    explanation_en: string;
    explanation_vi: string;
    confidence: number;
  }>;
}

export interface OcrResponse {
  success: boolean;
  filename: string;
  raw_result: string;
  markdown_result: string;
}

export const apiService = {
  /**
   * Step 1: Clean/Preprocess Image
   * Returns base64 string of the cleaned image
   */
  async cleanImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/api/v1/clean_image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.[0]?.msg || 'Failed to clean image');
    }

    const data = await response.json();
    // Assuming the response is { "image": "base64_string" } or just the string
    return data.image || (typeof data === 'string' ? data : JSON.stringify(data));
  },

  /**
   * Step 2: OCR Image to Markdown
   */
  async ocrImage(file: File | Blob): Promise<OcrResponse> {
    const formData = new FormData();
    // If it's a blob from cleanImage, we might need to give it a name
    const fileToUpload = file instanceof File ? file : new File([file], 'processed_image.png', { type: 'image/png' });
    formData.append('file', fileToUpload);
    
    const response = await fetch(`${API_URL}/api/v1/ocr`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.[0]?.msg || 'Failed to perform OCR');
    }

    return await response.json();
  },

  /**
   * Step 3: Fix Vietnamese and Structure Text
   */
  async fixAndStruct(text: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('text', text);
    
    const response = await fetch(`${API_URL}/api/v1/fix_vn_and_struct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.[0]?.msg || 'Failed to structure text');
    }

    return await response.json();
  },

  /**
   * Step 4: Grade the structured input
   */
  async grade(blueprint: string, studentInput: any): Promise<GradingResult> {
    const params = new URLSearchParams();
    params.append('exam_blueprint', blueprint);
    params.append('student_input', typeof studentInput === 'string' ? studentInput : JSON.stringify(studentInput));
    params.append('debug', 'false');
    
    const response = await fetch(`${API_URL}/api/v1/grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.[0]?.msg || 'Failed to grade');
    }

    return await response.json();
  },

  /**
   * Full Pipeline (Optional usage)
   */
  async ocrAndGrade(file: File, blueprint: string, clean: boolean = true): Promise<GradingResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('exam_blueprint', blueprint);
    formData.append('clean_image', String(clean));
    
    const response = await fetch(`${API_URL}/api/v1/ocr_and_grade`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.[0]?.msg || 'Failed full pipeline');
    }

    return await response.json();
  }
};

/**
 * Helper to convert base64 to File
 */
export const base64ToFile = (base64String: string, fileName: string): File => {
  // Remove data URL prefix if present
  const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
  const byteString = atob(base64Data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: 'image/png' });
  return new File([blob], fileName, { type: 'image/png' });
};
