import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Target, TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface HealthGoalsCardProps {
  targetGlucose: number;
  currentAvg: number;
  timeInRange: number;
}

export const HealthGoalsCard = React.memo(function HealthGoalsCard({
  targetGlucose,
  currentAvg,
  timeInRange,
}: HealthGoalsCardProps) {
  const isOnTrack = currentAvg >= 70 && currentAvg <= 180;
  const trend = currentAvg < targetGlucose ? 'down' : currentAvg > targetGlucose ? 'up' : 'stable';
  
  return (
    <ThemedView className="mb-6">
      <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 18 }}>
        Health Goals
      </ThemedText>

      <View
        className="rounded-2xl p-5"
        style={{
          backgroundColor: isOnTrack ? '#dcfce7' : '#fef3c7',
          borderWidth: 2,
          borderColor: isOnTrack ? '#22c55e' : '#f59e0b',
        }}
      >
        {/* Status Badge */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Target size={20} color={isOnTrack ? '#16a34a' : '#d97706'} />
            <ThemedText
              className="ml-2 font-bold"
              style={{
                fontSize: 16,
                color: isOnTrack ? '#16a34a' : '#d97706',
              }}
            >
              {isOnTrack ? 'On Track!' : 'Needs Attention'}
            </ThemedText>
          </View>
          
          {trend !== 'stable' && (
            <View className="flex-row items-center">
              {trend === 'down' ? (
                <TrendingDown size={18} color="#16a34a" />
              ) : (
                <TrendingUp size={18} color="#dc2626" />
              )}
            </View>
          )}
        </View>

        {/* Target vs Current */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1">
            <ThemedText
              style={{
                fontSize: 12,
                color: isOnTrack ? '#15803d' : '#b45309',
                opacity: 0.8,
              }}
            >
              Target Glucose
            </ThemedText>
            <ThemedText
              className="font-bold"
              style={{
                fontSize: 32,
                color: isOnTrack ? '#15803d' : '#b45309',
                lineHeight: 36,
              }}
            >
              {targetGlucose}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                color: isOnTrack ? '#15803d' : '#b45309',
                opacity: 0.7,
              }}
            >
              mg/dL
            </ThemedText>
          </View>

          <View
            style={{
              width: 1,
              backgroundColor: isOnTrack ? '#22c55e' : '#f59e0b',
              opacity: 0.3,
              marginHorizontal: 16,
            }}
          />

          <View className="flex-1">
            <ThemedText
              style={{
                fontSize: 12,
                color: isOnTrack ? '#15803d' : '#b45309',
                opacity: 0.8,
              }}
            >
              Current Avg
            </ThemedText>
            <ThemedText
              className="font-bold"
              style={{
                fontSize: 32,
                color: isOnTrack ? '#15803d' : '#b45309',
                lineHeight: 36,
              }}
            >
              {currentAvg}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                color: isOnTrack ? '#15803d' : '#b45309',
                opacity: 0.7,
              }}
            >
              mg/dL
            </ThemedText>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-2">
            <ThemedText
              style={{
                fontSize: 12,
                color: isOnTrack ? '#15803d' : '#b45309',
                fontWeight: '600',
              }}
            >
              Time in Range
            </ThemedText>
            <ThemedText
              className="font-bold"
              style={{
                fontSize: 12,
                color: isOnTrack ? '#15803d' : '#b45309',
              }}
            >
              {timeInRange}%
            </ThemedText>
          </View>
          
          <View
            className="h-3 rounded-full overflow-hidden"
            style={{
              backgroundColor: isOnTrack ? '#22c55e40' : '#f59e0b40',
            }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${timeInRange}%`,
                backgroundColor: isOnTrack ? '#22c55e' : '#f59e0b',
              }}
            />
          </View>
        </View>

        {/* Message */}
        <ThemedText
          style={{
            fontSize: 13,
            color: isOnTrack ? '#15803d' : '#b45309',
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          {isOnTrack
            ? '🎉 Great job! Keep maintaining your glucose levels.'
            : '💪 Stay focused on your glucose management plan.'}
        </ThemedText>
      </View>
    </ThemedView>
  );
});

