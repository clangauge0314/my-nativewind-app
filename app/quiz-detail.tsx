import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQuizById } from '@/hooks/use-quiz-data';
import { useQuizResults } from '@/hooks/use-quiz-results';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle, ChevronLeft, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function QuizDetailScreen() {
  const { quizId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { quiz, loading } = useQuizById(Number(quizId));
  const { saveQuizResult } = useQuizResults();

  const handleOptionPress = (optionId: number) => {
    if (showResult) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmit = async () => {
    if (selectedOptionId === null || !quiz) {
      Alert.alert('Notice', 'Please select an answer.');
      return;
    }

    const selectedOption = quiz.options.find((opt) => opt.id === selectedOptionId);
    if (selectedOption) {
      try {
        await saveQuizResult(quiz.id, selectedOptionId, selectedOption.isCorrect);
        setShowResult(true);
      } catch (error) {
        toast.error('Failed to save quiz result');
        console.error('Error saving quiz result:', error);
      }
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    
    const nextQuizId = quiz.id + 1;
    if (nextQuizId <= 10) {
      router.replace({
        pathname: '/quiz-detail',
        params: { quizId: nextQuizId.toString() },
      });
      setSelectedOptionId(null);
      setShowResult(false);
    } else {
      Alert.alert('Complete', 'You have completed all questions!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <ThemedText className="mt-4" style={{ color: '#6b7280' }}>
          Loading quiz...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!quiz) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <AlertCircle size={48} color="#ef4444" />
        <ThemedText className="mt-4" style={{ color: '#ef4444' }}>
          Quiz not found
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: '#3b82f6',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <ThemedText className="font-semibold" style={{ color: '#ffffff' }}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // quiz is guaranteed to be non-null here
  const selectedOption = quiz.options.find((opt) => opt.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect || false;

  const getOptionStyle = (option: { id: number; text: string; isCorrect: boolean }) => {
    if (!showResult) {
      return {
        backgroundColor: selectedOptionId === option.id ? '#dbeafe' : '#ffffff',
        borderColor: selectedOptionId === option.id ? '#3b82f6' : '#e5e7eb',
        borderWidth: selectedOptionId === option.id ? 2 : 1,
      };
    }

    if (option.isCorrect) {
      return {
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
        borderWidth: 2,
      };
    }

    if (selectedOptionId === option.id && !option.isCorrect) {
      return {
        backgroundColor: '#fee2e2',
        borderColor: '#ef4444',
        borderWidth: 2,
      };
    }

    return {
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    };
  };

  return (
    <ThemedView className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView className="flex-1 px-6" style={{ paddingTop: insets.top + 20 }}>
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
            <View className="flex-1">
              <ThemedText className="font-bold" style={{ fontSize: 24 }}>
                Question {quiz.id}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, color: '#6b7280' }}>
                {quiz.category}
              </ThemedText>
            </View>
          </View>

          {/* Progress */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <ThemedText style={{ fontSize: 13, color: '#6b7280' }}>Progress</ThemedText>
              <ThemedText style={{ fontSize: 13, color: '#6b7280' }}>
                {quiz.id}/10
              </ThemedText>
            </View>
            <View
              className="h-2 rounded-full"
              style={{ backgroundColor: '#e5e7eb' }}
            >
              <View
                className="h-2 rounded-full"
                style={{
                  backgroundColor: '#3b82f6',
                  width: `${(quiz.id / 10) * 100}%`,
                }}
              />
            </View>
          </View>

          {/* Question */}
          <View
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: '#f0f9ff',
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <ThemedText className="font-bold" style={{ fontSize: 20, lineHeight: 28 }}>
              {quiz.question}
            </ThemedText>
          </View>

          {/* Options */}
          <ThemedView className="mb-6">
            {quiz.options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleOptionPress(option.id)}
                activeOpacity={0.7}
                disabled={showResult}
              >
                <View
                  className="rounded-2xl p-4 mb-3"
                  style={{
                    ...getOptionStyle(option),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="rounded-full items-center justify-center mr-3"
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: showResult && option.isCorrect 
                            ? '#10b981' 
                            : showResult && selectedOptionId === option.id && !option.isCorrect
                            ? '#ef4444'
                            : selectedOptionId === option.id
                            ? '#3b82f6'
                            : '#e5e7eb',
                        }}
                      >
                        <ThemedText
                          className="font-bold"
                          style={{
                            fontSize: 16,
                            color: selectedOptionId === option.id || (showResult && option.isCorrect)
                              ? '#ffffff'
                              : '#6b7280',
                          }}
                        >
                          {index + 1}
                        </ThemedText>
                      </View>
                      <ThemedText
                        className="flex-1"
                        style={{
                          fontSize: 16,
                          fontWeight: selectedOptionId === option.id ? '600' : '400',
                        }}
                      >
                        {option.text}
                      </ThemedText>
                    </View>
                    {showResult && option.isCorrect && (
                      <CheckCircle size={24} color="#10b981" />
                    )}
                    {showResult && selectedOptionId === option.id && !option.isCorrect && (
                      <XCircle size={24} color="#ef4444" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ThemedView>

          {/* Result */}
          {showResult && (
            <View
              className="rounded-2xl p-5 mb-6"
              style={{
                backgroundColor: isCorrect ? '#d1fae5' : '#fee2e2',
                borderWidth: 1,
                borderColor: isCorrect ? '#10b981' : '#ef4444',
              }}
            >
              <View className="flex-row items-start mb-3">
                {isCorrect ? (
                  <CheckCircle size={24} color="#10b981" style={{ marginTop: 2 }} />
                ) : (
                  <AlertCircle size={24} color="#ef4444" style={{ marginTop: 2 }} />
                )}
                <ThemedText
                  className="font-bold ml-2"
                  style={{
                    fontSize: 18,
                    color: isCorrect ? '#065f46' : '#991b1b',
                  }}
                >
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: 15,
                  lineHeight: 22,
                  color: isCorrect ? '#065f46' : '#991b1b',
                }}
              >
                {quiz.explanation}
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Bottom Button */}
      <View
        className="px-6"
        style={{
          paddingBottom: insets.bottom + 20,
          paddingTop: 16,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        }}
      >
        {!showResult ? (
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.8}
            style={{
              backgroundColor: selectedOptionId ? '#3b82f6' : '#d1d5db',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            disabled={!selectedOptionId}
          >
            <ThemedText
              className="font-bold"
              style={{
                fontSize: 16,
                color: '#ffffff',
              }}
            >
              Submit
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#3b82f6',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <ThemedText
              className="font-bold"
              style={{
                fontSize: 16,
                color: '#ffffff',
              }}
            >
              {quiz.id < 10 ? 'Next Question' : 'Complete'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}
