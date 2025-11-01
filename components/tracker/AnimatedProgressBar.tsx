import { ThemedText } from '@/components/themed-text';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedProgressBarProps {
  value: number;
  maxValue: number;
  label: string;
  color: string;
  backgroundColor?: string;
  height?: number;
  showValue?: boolean;
  unit?: string;
}

export const AnimatedProgressBar = React.memo(function AnimatedProgressBar({
  value,
  maxValue,
  label,
  color,
  backgroundColor = '#f3f4f6',
  height = 8,
  showValue = true,
  unit = '',
}: AnimatedProgressBarProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    progress.value = withSpring((value / maxValue) * 100, {
      damping: 15,
      stiffness: 100,
    });
    scale.value = withTiming(1, { duration: 300 });
  }, [value, maxValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value, 100)}%`,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="text-xs text-gray-600">{label}</ThemedText>
        {showValue && (
          <ThemedText className="text-xs font-semibold" style={{ color }}>
            {value}{unit}
          </ThemedText>
        )}
      </View>
      <View
        style={{
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              height: '100%',
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
});

