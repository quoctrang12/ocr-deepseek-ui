import axios from 'axios';

export interface OcrResponse {
  success: boolean;
  filename: string;
  raw_result: string;
  markdown_result: string;
}

/**
 * Gọi API để nhận dạng bài toán
 * @param file File hình ảnh bài tập
 * @returns Promise<OcrResponse>
 */
export const gradeMathImage = async (file: File): Promise<OcrResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', '<image>\n<|grounding|>Convert the document to markdown.');

  try {
    const response = await axios.post<OcrResponse>(
      'https://scarlatinoid-quarrelsomely-beulah.ngrok-free.dev/api/v1/ocr',
      formData,
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error calling OCR API:", error);
    throw error;
  }
};
