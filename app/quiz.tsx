import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQuizData } from '@/hooks/use-quiz-data';
import { useQuizResults } from '@/hooks/use-quiz-results';
import { Quiz } from '@/types/quiz';
import { router } from 'expo-router';
import { AlertCircle, Brain, ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '#10b981';
    case 'medium':
      return '#f59e0b';
    case 'hard':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
    default:
      return '';
  }
};

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + 68;
  const { quizzes, loading, error } = useQuizData();
  const { stats } = useQuizResults();

  const handleQuizPress = (quiz: Quiz) => {
    router.push({
      pathname: '/quiz-detail',
      params: { quizId: quiz.id.toString() },
    });
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <ThemedText className="mt-4" style={{ color: '#6b7280' }}>
          Loading quizzes...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView className="flex-1 items-center justify-center px-6">
        <AlertCircle size={48} color="#ef4444" />
        <ThemedText className="mt-4 text-center" style={{ color: '#ef4444' }}>
          Error loading quizzes
        </ThemedText>
        <ThemedText className="mt-2 text-center" style={{ color: '#6b7280' }}>
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  if (quizzes.length === 0 && !loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center px-6">
        <Brain size={64} color="#9ca3af" />
        <ThemedText className="mt-4 text-xl font-bold text-center">
          No Quizzes Available
        </ThemedText>
        <ThemedText className="mt-2 text-center" style={{ color: '#6b7280' }}>
          Please contact administrator to add quizzes
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView className="flex-1 px-6" style={{ paddingTop: insets.top + 20 }}>
          {/* Header */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="mr-3"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={24} color="#000" />
              </TouchableOpacity>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Brain size={28} color="#8b5cf6" />
                  <ThemedText className="text-3xl font-bold ml-2">Diabetes Quiz</ThemedText>
                </View>
              </View>
            </View>
            <ThemedText className="text-base" style={{ color: '#6b7280' }}>
              Test your knowledge about diabetes management
            </ThemedText>
          </View>

          {/* Stats Card */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: '#f0f9ff',
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <View className="flex-row justify-around">
              <View className="items-center">
                <ThemedText className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                  {quizzes.length}
                </ThemedText>
                <ThemedText className="text-xs" style={{ color: '#6b7280' }}>
                  Total
                </ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="text-2xl font-bold" style={{ color: '#10b981' }}>
                  {stats.totalAttempted}
                </ThemedText>
                <ThemedText className="text-xs" style={{ color: '#6b7280' }}>
                  Attempted
                </ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                  {stats.accuracy}%
                </ThemedText>
                <ThemedText className="text-xs" style={{ color: '#6b7280' }}>
                  Accuracy
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Quiz List */}
          <ThemedView className="mb-6">
            <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 18 }}>
              Quiz List
            </ThemedText>

            {quizzes.map((quiz, index) => (
              <TouchableOpacity
                key={quiz.id}
                onPress={() => handleQuizPress(quiz)}
                activeOpacity={0.7}
              >
                <View
                  className="rounded-2xl p-4 mb-3"
                  style={{
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View
                          className="rounded-full px-3 py-1"
                          style={{
                            backgroundColor: '#f3f4f6',
                          }}
                        >
                          <ThemedText
                            className="font-semibold"
                            style={{ fontSize: 12, color: '#6b7280' }}
                          >
                            Question {quiz.id}
                          </ThemedText>
                        </View>
                        <View
                          className="rounded-full px-2 py-1 ml-2"
                          style={{
                            backgroundColor: getDifficultyColor(quiz.difficulty) + '20',
                          }}
                        >
                          <ThemedText
                            className="font-semibold"
                            style={{
                              fontSize: 11,
                              color: getDifficultyColor(quiz.difficulty),
                            }}
                          >
                            {getDifficultyText(quiz.difficulty)}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText className="font-semibold mb-1" style={{ fontSize: 16 }}>
                        {quiz.question}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 13, color: '#9ca3af' }}>
                        {quiz.category}
                      </ThemedText>
                    </View>
                    <ChevronRight size={20} color="#9ca3af" style={{ marginLeft: 8 }} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ThemedView>

          {/* Tips Card */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: '#fef3c7',
              borderWidth: 1,
              borderColor: '#fde68a',
            }}
          >
            <View className="flex-row items-start">
              <Star size={20} color="#f59e0b" style={{ marginTop: 2 }} />
              <View className="flex-1 ml-3">
                <ThemedText className="font-bold mb-1" style={{ color: '#92400e' }}>
                  Learning Tip
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: '#92400e' }}>
                  Try all the questions and read the explanations carefully. You'll learn essential knowledge needed for diabetes management.
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

