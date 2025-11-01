import { Quiz } from '@/types/quiz';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export interface QuizData extends Omit<Quiz, 'id'> {
  quiz_number: number;
  created_at?: any;
  updated_at?: any;
}

export const useQuizData = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('quizzes')
      .orderBy('quiz_number', 'asc')
      .onSnapshot(
        (snapshot) => {
          const quizData: Quiz[] = snapshot.docs.map((doc) => {
            const data = doc.data() as QuizData;
            return {
              id: data.quiz_number,
              question: data.question,
              options: data.options,
              explanation: data.explanation,
              difficulty: data.difficulty,
              category: data.category,
            };
          });
          setQuizzes(quizData);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching quizzes:', err);
          setError(err.message);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  return { quizzes, loading, error };
};

export const useQuizById = (quizId: number) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('quizzes')
      .where('quiz_number', '==', quizId)
      .limit(1)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data() as QuizData;
            setQuiz({
              id: data.quiz_number,
              question: data.question,
              options: data.options,
              explanation: data.explanation,
              difficulty: data.difficulty,
              category: data.category,
            });
          } else {
            setQuiz(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching quiz:', err);
          setError(err.message);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [quizId]);

  return { quiz, loading, error };
};

