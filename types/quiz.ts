export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  id: number;
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface QuizResult {
  quizId: number;
  selectedOptionId: number;
  isCorrect: boolean;
  timestamp: Date;
}

