import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { StatusData } from '@/types/insulin-timer';
import React from 'react';
import { Animated, Dimensions, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressBarProps {
  progressBarHeight: number;
  progressWidth: Animated.AnimatedInterpolation<string | number>;
  statusData: StatusData;
  percentage: number;
  totalSeconds: number;
  remainingSeconds: number;
}

export const ProgressBar = React.memo(function ProgressBar({
  progressBarHeight,
  progressWidth,
  statusData,
  percentage,
  totalSeconds,
  remainingSeconds,
}: ProgressBarProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();

  return (
    <View style={{ 
      width: screenWidth - responsiveSpacing(64), 
      marginBottom: responsiveSpacing(24),
      padding: responsiveSpacing(16),
    }}>
      <View className="flex-row justify-between" style={{ marginBottom: responsiveSpacing(8) }}>
        <ThemedText 
          className="font-medium"
          style={{ fontSize: responsiveFontSize(13), color: '#64748b' }}
        >
          Progress
        </ThemedText>
        <ThemedText 
          className="font-bold"
          style={{ fontSize: responsiveFontSize(13), color: statusData.color }}
        >
          {percentage}%
        </ThemedText>
      </View>
      <View
        style={{
          height: progressBarHeight,
          borderRadius: responsiveSize(6),
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            width: progressWidth,
            height: progressBarHeight,
            backgroundColor: statusData.color,
            borderRadius: responsiveSize(6),
          }}
        />
      </View>
      <View className="flex-row justify-between" style={{ marginTop: responsiveSpacing(8) }}>
        <ThemedText 
          className="text-gray-500"
          style={{ fontSize: responsiveFontSize(11) }}
        >
          {Math.floor((totalSeconds - remainingSeconds) / 60)}m elapsed
        </ThemedText>
        <ThemedText 
          className="text-gray-500"
          style={{ fontSize: responsiveFontSize(11) }}
        >
          {Math.floor(totalSeconds / 60)}m total
        </ThemedText>
      </View>
    </View>
  );
});

