export const mockData = {
  rawMarkdown: `Bài 1: Tính định thức của ma trận $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$

Giải:
$\\det(A) = 1 \\times 4 + 2 \\times 3$
$\\det(A) = 4 + 6$
$\\det(A) = 10$`,
  structuredJson: {
    question: "Tính định thức của ma trận $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$",
    steps: [
      {
        id: 1,
        content: "$\\det(A) = 1 \\times 4 + 2 \\times 3$"
      },
      {
        id: 2,
        content: "$\\det(A) = 4 + 6$"
      },
      {
        id: 3,
        content: "$\\det(A) = 10$"
      }
    ]
  },
  gradingResult: {
    score: 2.5,
    maxScore: 10,
    steps: [
      {
        id: 1,
        content: "$\\det(A) = 1 \\times 4 + 2 \\times 3$",
        isCorrect: false,
        feedback: "Công thức tính định thức ma trận $2 \\times 2$ là $ad - bc$. Bạn đã nhầm dấu trừ thành dấu cộng. Cách sửa: $\\det(A) = 1 \\times 4 - 2 \\times 3$."
      },
      {
        id: 2,
        content: "$\\det(A) = 4 + 6$",
        isCorrect: false,
        feedback: "Sai do lỗi ở bước trên. Đúng ra phải là $4 - 6$."
      },
      {
        id: 3,
        content: "$\\det(A) = 10$",
        isCorrect: false,
        feedback: "Kết quả cuối cùng sai. Đáp án đúng là $-2$."
      }
    ]
  }
};
