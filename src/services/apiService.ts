export interface GradeResponse {
  recognized_text: string;
  step_by_step_analysis: string[];
  final_score: number;
  feedback: string;
}

export interface ApiResponse {
  success: boolean;
  data: GradeResponse;
}

/**
 * Gọi API để chấm điểm bài toán
 * @param file File hình ảnh bài tập
 * @returns Promise<ApiResponse>
 */
export const gradeMathImage = async (file: File): Promise<ApiResponse> => {
  // --- CODE THỰC TẾ (Đã comment lại để chạy demo) ---
  /*
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/v1/grade-math', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling grade API:", error);
    throw error;
  }
  */

  // --- CODE MOCK (Dùng để demo UI) ---
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          recognized_text: "Giải phương trình: 2x + 5 = 15",
          step_by_step_analysis: [
            "Bước 1: Chuyển 5 sang vế phải: 2x = 15 - 5 (Đúng)",
            "Bước 2: Tính toán vế phải: 2x = 10 (Đúng)",
            "Bước 3: Chia cả hai vế cho 2: x = 10 / 2 = 4 (Sai bước tính toán cuối)"
          ],
          final_score: 7.5,
          feedback: "Em đã làm đúng các bước biến đổi phương trình nhưng tính toán bước cuối cùng chưa chính xác. 10 chia 2 bằng 5 nhé."
        }
      });
    }, 2500); // Giả lập delay 2.5s của model AI
  });
};
