import { useAuthStore } from '@/stores/auth-store';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export interface QuizResultData {
  quiz_id: number;
  user_id: string;
  selected_option_id: number;
  is_correct: boolean;
  created_at: any;
}

export const useQuizResults = () => {
  const user = useAuthStore((state) => state.user);
  const [results, setResults] = useState<QuizResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempted: 0,
    totalCorrect: 0,
    accuracy: 0,
  });

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('quiz_results')
      .where('user_id', '==', user.uid)
      .orderBy('created_at', 'desc')
      .onSnapshot(
        (snapshot) => {
          const resultsData: QuizResultData[] = snapshot.docs.map((doc) => ({
            ...doc.data(),
          } as QuizResultData));

          setResults(resultsData);

          // Calculate stats
          const uniqueQuizzes = new Set(resultsData.map((r) => r.quiz_id));
          const totalAttempted = uniqueQuizzes.size;
          const totalCorrect = resultsData.filter((r) => r.is_correct).length;
          const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / resultsData.length) * 100) : 0;

          setStats({ totalAttempted, totalCorrect, accuracy });
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching quiz results:', err);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user?.uid]);

  const saveQuizResult = async (quizId: number, selectedOptionId: number, isCorrect: boolean) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      await firestore().collection('quiz_results').add({
        quiz_id: quizId,
        user_id: user.uid,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        created_at: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  };

  const getQuizResult = (quizId: number): QuizResultData | null => {
    return results.find((r) => r.quiz_id === quizId) || null;
  };

  return {
    results,
    stats,
    loading,
    saveQuizResult,
    getQuizResult,
  };
};

