import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { StatusData, TimeDisplay } from '@/types/insulin-timer';
import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

interface CircularTimerProps {
  timerSize: number;
  innerSize: number;
  fontSize: number;
  subFontSize: number;
  spacing: number;
  statusData: StatusData;
  isCompleted: boolean;
  spinAnimation: Animated.Value;
  timeDisplay: TimeDisplay;
  percentage: number;
  onPress: () => void;
}

export const CircularTimer = React.memo(function CircularTimer({
  timerSize,
  innerSize,
  fontSize,
  subFontSize,
  spacing,
  statusData,
  isCompleted,
  spinAnimation,
  timeDisplay,
  percentage,
  onPress,
}: CircularTimerProps) {
  const { responsiveFontSize } = useResponsive();

  return (
    <View style={{ position: 'relative', marginBottom: spacing }}>
      {/* 외부 프로그레스 링 - 로딩 스피너 스타일 */}
      <View
        style={{
          width: timerSize + 8,
          height: timerSize + 8,
          borderRadius: (timerSize + 8) / 2,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* 배경 링 */}
        <View
          style={{
            width: timerSize + 8,
            height: timerSize + 8,
            borderRadius: (timerSize + 8) / 2,
            borderWidth: 4,
            borderColor: statusData.color + '20',
            position: 'absolute',
          }}
        />
        {/* 회전하는 프로그레스 링 */}
        {!isCompleted && (
          <Animated.View
            style={{
              width: timerSize + 8,
              height: timerSize + 8,
              borderRadius: (timerSize + 8) / 2,
              borderWidth: 4,
              borderColor: 'transparent',
              borderTopColor: statusData.color,
              borderRightColor: statusData.color,
              position: 'absolute',
              transform: [{
                rotate: spinAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              }],
            }}
          />
        )}
        {/* 완료 시 전체 링 */}
        {isCompleted && (
          <View
            style={{
              width: timerSize + 8,
              height: timerSize + 8,
              borderRadius: (timerSize + 8) / 2,
              borderWidth: 4,
              borderColor: statusData.color,
              position: 'absolute',
            }}
          />
        )}
      </View>
      
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: timerSize,
          height: timerSize,
          borderRadius: timerSize / 2,
          backgroundColor: 'transparent',
          borderWidth: 0,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 4,
          left: 4,
        }}
        activeOpacity={0.8}
      >
        {/* 내부 원형 프로그레스 */}
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* 시간 표시 - 잘림 방지 */}
          <View 
            className="items-center justify-center"
            style={{ 
              minHeight: innerSize * 0.6,
              paddingVertical: 8,
              paddingHorizontal: 4,
            }}
          >
            <ThemedText 
              className="font-bold mb-1"
              style={{ 
                fontSize, 
                color: '#1e293b',
                lineHeight: fontSize * 1.2,
                textAlign: 'center',
              }}
            >
              {timeDisplay.hours ? `${timeDisplay.hours}:` : ''}{timeDisplay.minutes}:{timeDisplay.seconds}
            </ThemedText>
            <ThemedText 
              className="text-gray-500"
              style={{ 
                fontSize: subFontSize,
                lineHeight: subFontSize * 1.3,
                textAlign: 'center',
              }}
            >
              {isCompleted ? 'Completed' : `${percentage}% remaining`}
            </ThemedText>
            {!isCompleted && (
              <ThemedText 
                className="text-gray-400 mt-1"
                style={{ 
                  fontSize: responsiveFontSize(12),
                  lineHeight: responsiveFontSize(12) * 1.3,
                  textAlign: 'center',
                }}
              >
                Tap to stop
              </ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

