import { ThemedText } from '@/components/themed-text';
import { TrackerStats } from '@/types/tracker';
import { Activity, AlertCircle, CheckCircle, Droplet, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface StatsCardProps {
  stats: TrackerStats | null;
  loading: boolean;
}

export const StatsCard = React.memo(function StatsCard({ stats, loading }: StatsCardProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, [stats]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (loading || !stats) {
    return (
      <View className="mx-4 mb-6 p-6 bg-white rounded-2xl border border-gray-200">
        <ThemedText className="text-center text-gray-500">Loading statistics...</ThemedText>
      </View>
    );
  }

  const getTimeInRangeColor = (percentage: number) => {
    if (percentage >= 70) return { bg: '#dcfce7', text: '#16a34a', icon: '#22c55e' };
    if (percentage >= 50) return { bg: '#fef3c7', text: '#ca8a04', icon: '#eab308' };
    return { bg: '#fee2e2', text: '#dc2626', icon: '#ef4444' };
  };

  const timeInRangeColor = getTimeInRangeColor(stats.timeInRange);

  return (
    <Animated.View className="mx-4 mb-6" style={animatedStyle}>
      {/* Time in Range - Highlighted */}
      <View 
        className="p-6 mb-4 rounded-2xl border"
        style={{
          backgroundColor: timeInRangeColor.bg,
          borderColor: timeInRangeColor.icon + '40',
          shadowColor: timeInRangeColor.icon,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Activity size={20} color={timeInRangeColor.icon} />
            <ThemedText className="ml-2 font-semibold" style={{ color: timeInRangeColor.text, fontSize: 14 }}>
              Time in Range (70-180 mg/dL)
            </ThemedText>
          </View>
        </View>
        <View className="flex-row items-end">
          <ThemedText className="font-bold" style={{ fontSize: 48, color: timeInRangeColor.text, lineHeight: 48 }}>
            {stats.timeInRange}
          </ThemedText>
          <ThemedText className="ml-2 mb-2 font-semibold" style={{ fontSize: 24, color: timeInRangeColor.text }}>
            %
          </ThemedText>
        </View>
        <ThemedText className="mt-2" style={{ fontSize: 12, color: timeInRangeColor.text, opacity: 0.8 }}>
          {stats.normalGlucoseCount} of {stats.totalInjections} readings in target range
        </ThemedText>
      </View>

      {/* Stats Grid */}
      <View className="bg-white rounded-2xl border border-gray-200 p-4" style={{
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {/* Average Glucose */}
          <View className="flex-1 bg-blue-50 rounded-xl p-4 min-w-[45%]">
            <View className="flex-row items-center mb-2">
              <Droplet size={16} color="#3b82f6" />
              <ThemedText className="ml-2 text-xs text-blue-600 font-semibold">AVG GLUCOSE</ThemedText>
            </View>
            <ThemedText className="text-2xl font-bold text-blue-900">
              {stats.avgGlucose}
            </ThemedText>
            <ThemedText className="text-xs text-blue-600 mt-1">mg/dL</ThemedText>
          </View>

          {/* Average Insulin */}
          <View className="flex-1 bg-purple-50 rounded-xl p-4 min-w-[45%]">
            <View className="flex-row items-center mb-2">
              <Activity size={16} color="#9333ea" />
              <ThemedText className="ml-2 text-xs text-purple-600 font-semibold">AVG INSULIN</ThemedText>
            </View>
            <ThemedText className="text-2xl font-bold text-purple-900">
              {stats.avgInsulin}
            </ThemedText>
            <ThemedText className="text-xs text-purple-600 mt-1">units</ThemedText>
          </View>

          {/* High Glucose */}
          <View className="flex-1 bg-red-50 rounded-xl p-4 min-w-[45%]">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#dc2626" />
              <ThemedText className="ml-2 text-xs text-red-600 font-semibold">HIGH</ThemedText>
            </View>
            <ThemedText className="text-2xl font-bold text-red-900">
              {stats.highGlucoseCount}
            </ThemedText>
            <ThemedText className="text-xs text-red-600 mt-1">&gt;180 mg/dL</ThemedText>
          </View>

          {/* Low Glucose */}
          <View className="flex-1 bg-orange-50 rounded-xl p-4 min-w-[45%]">
            <View className="flex-row items-center mb-2">
              <TrendingDown size={16} color="#ea580c" />
              <ThemedText className="ml-2 text-xs text-orange-600 font-semibold">LOW</ThemedText>
            </View>
            <ThemedText className="text-2xl font-bold text-orange-900">
              {stats.lowGlucoseCount}
            </ThemedText>
            <ThemedText className="text-xs text-orange-600 mt-1">&lt;70 mg/dL</ThemedText>
          </View>

          {/* Injected */}
          <View className="flex-1 bg-green-50 rounded-xl p-4 min-w-[45%]">
            <View className="flex-row items-center mb-2">
              <CheckCircle size={16} color="#16a34a" />
              <ThemedText className="ml-2 text-xs text-green-600 font-semibold">INJECTED</ThemedText>
            </View>
            <ThemedText className="text-2xl font-bold text-green-900">
              {stats.injectedCount}
            </ThemedText>
            <ThemedText className="text-xs text-green-600 mt-1">completed</ThemedText>
          </View>

          {/* Not Injected */}
          <View className="flex-1 bg-gray-50 rounded-xl p-4 min-w-[45%]">
            <View className="flex-row items-center mb-2">
              <AlertCircle size={16} color="#6b7280" />
              <ThemedText className="ml-2 text-xs text-gray-600 font-semibold">PENDING</ThemedText>
            </View>
            <ThemedText className="text-2xl font-bold text-gray-900">
              {stats.notInjectedCount}
            </ThemedText>
            <ThemedText className="text-xs text-gray-600 mt-1">not injected</ThemedText>
          </View>
        </View>

        {/* Additional Info */}
        <View className="mt-4 pt-4 border-t border-gray-200">
          <View className="flex-row justify-between mb-2">
            <ThemedText className="text-xs text-gray-500">Avg Carb Insulin</ThemedText>
            <ThemedText className="text-xs font-semibold text-gray-900">{stats.avgCarbInsulin}u</ThemedText>
          </View>
          <View className="flex-row justify-between mb-2">
            <ThemedText className="text-xs text-gray-500">Avg Correction Insulin</ThemedText>
            <ThemedText className="text-xs font-semibold text-gray-900">{stats.avgCorrectionInsulin}u</ThemedText>
          </View>
          <View className="flex-row justify-between">
            <ThemedText className="text-xs text-gray-500">Most Common Meal</ThemedText>
            <ThemedText className="text-xs font-semibold text-gray-900">{stats.mostCommonMealType}</ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

