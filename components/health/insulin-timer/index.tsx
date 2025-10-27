import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { InsulinTimerProps } from '@/types/insulin-timer';
import { calculateInsulinData, formatDate, formatTime, getStatusData } from '@/utils/insulin-timer';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Animated, Easing, View } from 'react-native';
import { ActionButtons } from './ActionButtons';
import { CircularTimer } from './CircularTimer';
import { InsulinDetails } from './InsulinDetails';
import { ProgressBar } from './ProgressBar';
import { RecordBadges } from './RecordBadges';
import { StatusBadge } from './StatusBadge';

export const InsulinTimer = React.memo(function InsulinTimer({
  totalSeconds,
  remainingSeconds,
  hasActiveTimer = false,
  width = 280,
  height = 8,
  trackColor = '#e5e7eb',
  progressColor = '#f59e0b',
  onEdit,
  onInsulinInjected,
  bloodGlucose = 120,
  carbohydrates = 0,
  insulinRatio = 15,
  correctionFactor = 50,
  targetGlucose = 100,
  createdAt,
  insulinInjected = false,
}: InsulinTimerProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();
  
  // 메모이제이션된 계산값들
  const progress = useMemo(() => 
    Math.max(0, Math.min(1, totalSeconds > 0 ? remainingSeconds / totalSeconds : 0)), 
    [totalSeconds, remainingSeconds]
  );
  
  const animated = useRef(new Animated.Value(progress)).current;
  const spinAnimation = useRef(new Animated.Value(0)).current;
  
  const isCompleted = remainingSeconds === 0;
  const isWarning = progress <= 0.2 && progress > 0;
  const isCritical = progress <= 0.1 && progress > 0;

  // 메모이제이션된 반응형 크기 계산
  const responsiveValues = useMemo(() => ({
    timerSize: responsiveSize(200),
    innerSize: responsiveSize(180),
    fontSize: responsiveFontSize(36),
    subFontSize: responsiveFontSize(14),
    statusFontSize: responsiveFontSize(18),
    progressBarHeight: responsiveSize(8),
    spacing: responsiveSpacing(24),
  }), [responsiveSize, responsiveFontSize, responsiveSpacing]);
  
  const { timerSize, innerSize, fontSize, subFontSize, statusFontSize, progressBarHeight, spacing } = responsiveValues;

  // 프로그레스 애니메이션 - 부드럽게 감소
  useEffect(() => {
    Animated.timing(animated, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, animated]);

  // 회전 애니메이션 (타이머 진행 중일 때만)
  useEffect(() => {
    if (!isCompleted) {
      const spin = Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      spinAnimation.setValue(0);
    }
  }, [isCompleted, spinAnimation]);

  const progressWidth = useMemo(() => 
    animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, width],
    }), [animated, width]
  );

  const percentage = useMemo(() => Math.round(progress * 100), [progress]);
  
  const timeDisplay = useMemo(() => {
    // Show "--:--" if no active timer
    if (!hasActiveTimer && totalSeconds === 0) {
      return { hours: null, minutes: '--', seconds: '--' };
    }
    return formatTime(remainingSeconds);
  }, [remainingSeconds, hasActiveTimer, totalSeconds]);
  
  // 메모이제이션된 인슐린 계산 로직
  const insulinData = useMemo(() => 
    calculateInsulinData(carbohydrates, insulinRatio, bloodGlucose, targetGlucose, correctionFactor),
    [carbohydrates, insulinRatio, bloodGlucose, targetGlucose, correctionFactor]
  );

  // 메모이제이션된 상태 관련 함수들
  const statusData = useMemo(() => 
    getStatusData(isCompleted, isCritical, isWarning),
    [isCompleted, isCritical, isWarning]
  );

  // useCallback으로 최적화된 핸들러들
  const handlePress = useCallback(() => {
    if (!isCompleted) {
      // 타이머 진행 중: 인슐린 주사 여부 확인
      Alert.alert(
        'Insulin Injection',
        'Have you already injected insulin?',
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => {
              // "아니오"를 선택하면 Edit 페이지로 이동
              if (onEdit) {
                onEdit();
              }
            },
          },
          {
            text: 'Yes',
            onPress: () => {
              // "예"를 선택하면 인슐린 주입 완료 처리
              if (onInsulinInjected) {
                onInsulinInjected();
              }
            },
          },
        ]
      );
    }
  }, [isCompleted, onEdit, onInsulinInjected]);

  const formattedDate = useMemo(() => formatDate(createdAt), [createdAt]);

  return (
    <ThemedView className="items-center justify-center mb-8">
      {/* 메인 타이머 컨테이너 */}
      <View 
        className="items-center rounded-2xl p-6"
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 0,
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <RecordBadges 
          formattedDate={formattedDate}
          insulinInjected={insulinInjected}
        />

        <CircularTimer 
          timerSize={timerSize}
          innerSize={innerSize}
          fontSize={fontSize}
          subFontSize={subFontSize}
          spacing={spacing}
          statusData={statusData}
          isCompleted={isCompleted}
          spinAnimation={spinAnimation}
          timeDisplay={timeDisplay}
          percentage={percentage}
          onPress={handlePress}
        />

        <StatusBadge 
          statusData={statusData}
          statusFontSize={statusFontSize}
        />

        <ProgressBar 
          progressBarHeight={progressBarHeight}
          progressWidth={progressWidth}
          statusData={statusData}
          percentage={percentage}
          totalSeconds={totalSeconds}
          remainingSeconds={remainingSeconds}
        />

        {isCompleted && (
          <ActionButtons 
            formattedDate={formattedDate}
            onEdit={onEdit}
          />
        )}

        <InsulinDetails 
          formattedDate={formattedDate}
          insulinData={insulinData}
          bloodGlucose={bloodGlucose}
          carbohydrates={carbohydrates}
          targetGlucose={targetGlucose}
          totalSeconds={totalSeconds}
          insulinRatio={insulinRatio}
          correctionFactor={correctionFactor}
        />
      </View>
    </ThemedView>
  );
});

// Re-export types for convenience
export type { InsulinTimerProps } from '@/types/insulin-timer';

