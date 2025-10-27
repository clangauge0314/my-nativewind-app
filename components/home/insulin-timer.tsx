import { ThemedText } from '@/components/themed-text';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

interface InsulinTimerProps {
  requiredInsulin?: number;
  maxInsulin?: number;
}

export function InsulinTimer({ 
  requiredInsulin = 2.5, 
  maxInsulin = 10 
}: InsulinTimerProps) {
  const [animatedValue] = useState(new Animated.Value(0));
  const [currentInsulin, setCurrentInsulin] = useState(requiredInsulin);

  useEffect(() => {
    // 애니메이션으로 원을 그리기
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  // 원의 크기 설정
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 필요한 인슐린 비율 (0-1)
  const insulinRatio = currentInsulin / maxInsulin;
  
  // 진행률에 따른 strokeDasharray 계산
  const progress = insulinRatio * circumference;
  const remaining = circumference - progress;

  return (
    <View className="items-center justify-center mb-8">
      {/* 타이머 원 컨테이너 */}
      <View className="relative items-center justify-center">
        {/* 배경 원 (회색) */}
        <View
          className="absolute"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#e5e7eb',
          }}
        />
        
        {/* 진행 원 (노란색) - 회전 애니메이션 */}
        <Animated.View
          className="absolute"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: '#fbbf24',
            borderRightColor: insulinRatio > 0.5 ? '#fbbf24' : 'transparent',
            transform: [
              { rotate: '-90deg' },
              {
                rotate: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${insulinRatio * 360}deg`],
                }),
              },
            ],
          }}
        />
        
        {/* 추가 진행 원 (반바퀴 이상일 때) */}
        {insulinRatio > 0.5 && (
          <Animated.View
            className="absolute"
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderBottomColor: '#fbbf24',
              borderLeftColor: '#fbbf24',
              transform: [
                { rotate: '-90deg' },
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${(insulinRatio - 0.5) * 360}deg`],
                  }),
                },
              ],
            }}
          />
        )}

        {/* 중앙 텍스트 */}
        <View 
          className="items-center justify-center" 
          style={{ 
            width: size - strokeWidth * 2, 
            height: size - strokeWidth * 2 
          }}
        >
          <ThemedText className="text-5xl font-bold text-yellow-500">
            {currentInsulin.toFixed(1)}
          </ThemedText>
          <ThemedText className="text-base text-gray-500 mt-2 font-medium">
            units needed
          </ThemedText>
        </View>
      </View>

      {/* 하단 정보 */}
      <View className="mt-6 items-center">
        <ThemedText className="text-xl font-bold text-gray-800">
          Required Insulin
        </ThemedText>
        <ThemedText className="text-sm text-gray-500 mt-2 text-center">
          Based on your current glucose level
        </ThemedText>
        
        {/* 진행률 표시 */}
        <View className="mt-4 flex-row items-center">
          <View className="w-16 h-2 bg-gray-200 rounded-full mr-3">
            <View 
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${insulinRatio * 100}%` }}
            />
          </View>
          <ThemedText className="text-sm font-medium text-gray-600">
            {Math.round(insulinRatio * 100)}%
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
