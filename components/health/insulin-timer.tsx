import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { Calendar, Edit } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Animated, Dimensions, Easing, TouchableOpacity, View } from 'react-native';

interface InsulinTimerProps {
  totalSeconds: number; 
  remainingSeconds: number;
  hasActiveTimer?: boolean; // Track if timer was ever started
  width?: number; 
  height?: number; 
  trackColor?: string;
  progressColor?: string;
  onEdit?: () => void;
  onInsulinInjected?: () => void;
  // 당뇨 환자 정보
  bloodGlucose?: number; // 현재 혈당 (mg/dL)
  carbohydrates?: number; // 섭취할 탄수화물 (g)
  insulinRatio?: number; // 인슐린 비율 (단위/g)
  correctionFactor?: number; // 보정 인수 (단위/50mg/dL)
  targetGlucose?: number; // 목표 혈당 (mg/dL)
  createdAt?: string; // 레코드 생성일시
  insulinInjected?: boolean; // 인슐린 접종 여부
}

const { width: screenWidth } = Dimensions.get('window');

const formatHMS = (sec: number) => {
  const clamped = Math.max(0, Math.floor(sec));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatTime = (sec: number) => {
  const clamped = Math.max(0, Math.floor(sec));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  
  if (h > 0) {
    return {
      hours: h.toString(),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0')
    };
  }
  return {
    hours: null,
    minutes: m.toString(),
    seconds: String(s).padStart(2, '0')
  };
};

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    // Format: YYYY-MM-DD HH:MM:SS
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return null;
  }
};

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
  const { responsiveSize, responsiveFontSize, responsiveSpacing, screenSize } = useResponsive();
  
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
  const insulinData = useMemo(() => {
    // 탄수화물에 대한 인슐린 (Carbohydrate Ratio)
    const carbInsulin = carbohydrates / insulinRatio;
    
    // 혈당 보정을 위한 인슐린 (Correction Factor)
    const correctionInsulin = Math.max(0, (bloodGlucose - targetGlucose) / correctionFactor);
    
    // 총 인슐린 양
    const totalInsulin = carbInsulin + correctionInsulin;
    
    return {
      carbInsulin: Math.round(carbInsulin * 10) / 10,
      correctionInsulin: Math.round(correctionInsulin * 10) / 10,
      totalInsulin: Math.round(totalInsulin * 10) / 10
    };
  }, [carbohydrates, insulinRatio, bloodGlucose, targetGlucose, correctionFactor]);

  // 메모이제이션된 상태 관련 함수들
  const statusData = useMemo(() => {
    const getStatusColor = () => {
      if (isCompleted) return '#2563eb';
      if (isCritical) return '#dc2626';
      if (isWarning) return '#f59e0b';
      return '#2563eb';
    };

    const getStatusText = () => {
      if (isCompleted) return 'Completed';
      if (isCritical) return 'Critical';
      if (isWarning) return 'Warning';
      return 'Active';
    };

    const getStatusGradient = () => {
      if (isCompleted) return ['#3b82f6', '#2563eb'];
      if (isCritical) return ['#ef4444', '#dc2626'];
      if (isWarning) return ['#fbbf24', '#f59e0b'];
      return ['#60a5fa', '#3b82f6'];
    };

    return {
      color: getStatusColor(),
      text: getStatusText(),
      gradient: getStatusGradient()
    };
  }, [isCompleted, isCritical, isWarning]);

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
        {/* 레코드 생성일시 및 인슐린 접종 여부 배지 */}
        <View 
          style={{
            width: screenWidth - responsiveSpacing(64),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: responsiveSpacing(50),
          }}
        >
          {/* 레코드 생성일시 배지 또는 "레코드 없음" 메시지 */}
          {formattedDate ? (
            <View 
              style={{
                paddingHorizontal: responsiveSpacing(12),
                paddingVertical: responsiveSpacing(6),
                backgroundColor: '#f0f9ff',
                borderRadius: responsiveSize(20),
                borderWidth: 1,
                borderColor: '#e0f2fe',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Calendar size={responsiveFontSize(16)} color="#0369a1" style={{ marginRight: 6 }} />
              <ThemedText 
                style={{ 
                  fontSize: responsiveFontSize(12),
                  color: '#0369a1',
                  fontWeight: '600',
                }}
              >
                {formattedDate}
              </ThemedText>
            </View>
          ) : (
            <View 
              style={{
                paddingHorizontal: responsiveSpacing(12),
                paddingVertical: responsiveSpacing(6),
                backgroundColor: '#fef2f2',
                borderRadius: responsiveSize(20),
                borderWidth: 1,
                borderColor: '#fee2e2',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Calendar size={responsiveFontSize(16)} color="#dc2626" style={{ marginRight: 6 }} />
              <ThemedText 
                style={{ 
                  fontSize: responsiveFontSize(12),
                  color: '#dc2626',
                  fontWeight: '600',
                }}
              >
                No scheduled insulin record
              </ThemedText>
            </View>
          )}

          {/* 인슐린 접종 여부 배지 */}
          <View 
            style={{
              paddingHorizontal: responsiveSpacing(12),
              paddingVertical: responsiveSpacing(6),
              backgroundColor: insulinInjected ? '#f0fdf4' : '#fef2f2',
              borderRadius: responsiveSize(20),
              borderWidth: 1,
              borderColor: insulinInjected ? '#dcfce7' : '#fee2e2',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: responsiveSize(8),
                height: responsiveSize(8),
                borderRadius: responsiveSize(4),
                backgroundColor: insulinInjected ? '#22c55e' : '#ef4444',
                marginRight: responsiveSpacing(6),
              }}
            />
            <ThemedText 
              style={{ 
                fontSize: responsiveFontSize(12),
                color: insulinInjected ? '#16a34a' : '#dc2626',
                fontWeight: '600',
              }}
            >
              {insulinInjected ? 'Injected' : 'Not Injected'}
            </ThemedText>
          </View>
        </View>

        {/* 원형 프로그레스 타이머 - 클릭 가능 */}
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
            onPress={handlePress}
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
                minHeight: innerSize * 0.6, // 충분한 높이 확보
                paddingVertical: 8,
                paddingHorizontal: 4,
              }}
            >
              <ThemedText 
                className="font-bold mb-1"
                style={{ 
                  fontSize, 
                  color: '#1e293b',
                  lineHeight: fontSize * 1.2, // 줄 높이 설정으로 잘림 방지
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

        {/* 상태 표시 - 개선된 배지 스타일 */}
        <View 
          style={{ 
            marginBottom: responsiveSpacing(24),
            paddingHorizontal: responsiveSpacing(16),
            paddingVertical: responsiveSpacing(8),
          }}
        >
          <View className="flex-row items-center">
            <View
              style={{
                width: responsiveSize(8),
                height: responsiveSize(8),
                borderRadius: responsiveSize(4),
                backgroundColor: statusData.color,
                marginRight: responsiveSpacing(8),
              }}
            />
            <ThemedText 
              className="font-semibold" 
              style={{ 
                color: statusData.color,
                fontSize: statusFontSize
              }}
            >
              {statusData.text}
            </ThemedText>
          </View>
        </View>

        {/* 프로그레스 바 - 복구 */}
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

        {/* Completed 상태일 때 액션 버튼들 */}
        {isCompleted && (
          <View
            style={{
              width: screenWidth - responsiveSpacing(64),
              flexDirection: 'row',
              gap: responsiveSpacing(12),
              marginBottom: responsiveSpacing(24),
            }}
          >
            {/* Edit Record 버튼 - 레코드가 없으면 비활성화 */}
            <TouchableOpacity
              onPress={formattedDate ? onEdit : undefined}
              disabled={!formattedDate}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: responsiveSpacing(16),
                paddingHorizontal: responsiveSpacing(20),
                backgroundColor: formattedDate ? '#2563eb' : '#cbd5e1',
                borderRadius: responsiveSize(12),
                shadowColor: formattedDate ? '#2563eb' : '#94a3b8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: formattedDate ? 0.2 : 0.1,
                shadowRadius: 8,
                elevation: formattedDate ? 4 : 2,
              }}
              activeOpacity={formattedDate ? 0.8 : 1}
            >
              <Edit size={responsiveFontSize(20)} color={formattedDate ? '#ffffff' : '#94a3b8'} style={{ marginRight: 8 }} />
              <ThemedText 
                style={{ 
                  fontSize: responsiveFontSize(14),
                  color: formattedDate ? '#ffffff' : '#94a3b8',
                  fontWeight: '700',
                }}
              >
                Edit Record
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* 완전히 새로운 모던 인슐린 상세 정보 */}
        <View style={{ 
          width: screenWidth - responsiveSpacing(64), 
          marginBottom: responsiveSpacing(24),
        }}>
          {/* 메인 결과 카드 - 모던 디자인 */}
          <View 
            style={{
              padding: responsiveSpacing(32),
              marginBottom: responsiveSpacing(20),
              backgroundColor: '#ffffff',
              borderRadius: responsiveSize(20),
              borderWidth: 1,
              borderColor: '#e2e8f0',
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View 
              className="items-center justify-center"
              style={{ 
                minHeight: responsiveSize(120), // 충분한 높이 확보
                paddingVertical: responsiveSpacing(16),
                paddingHorizontal: responsiveSpacing(8),
              }}
            >
              <ThemedText 
                style={{ 
                  fontSize: responsiveFontSize(12), 
                  color: '#64748b', 
                  letterSpacing: 1.5, 
                  fontWeight: '600',
                  marginBottom: responsiveSpacing(8),
                }}
              >
                RECOMMENDED DOSE
              </ThemedText>
              <ThemedText 
                className="font-bold"
                style={{ 
                  fontSize: responsiveFontSize(52), 
                  color: formattedDate ? '#1e293b' : '#94a3b8', 
                  letterSpacing: -2,
                  lineHeight: responsiveFontSize(52) * 1.2, // 줄 높이 설정으로 잘림 방지
                  textAlign: 'center',
                  marginVertical: responsiveSpacing(8),
                }}
              >
                {formattedDate ? insulinData.totalInsulin : 'N/A'}
              </ThemedText>
              <ThemedText 
                className="font-semibold"
                style={{ 
                  fontSize: responsiveFontSize(16), 
                  color: '#64748b', 
                  letterSpacing: 0.5,
                  lineHeight: responsiveFontSize(16) * 1.3,
                  textAlign: 'center',
                  marginTop: responsiveSpacing(4),
                }}
              >
                units of insulin
              </ThemedText>
            </View>
          </View>

          {/* 데이터 그리드 - 2x2 모던 카드 */}
          <View style={{ gap: responsiveSpacing(12) }}>
            {/* 첫 번째 행 */}
            <View className="flex-row" style={{ gap: responsiveSpacing(12) }}>
              {/* Blood Glucose 카드 */}
              <View 
                className="flex-1"
                style={{
                  padding: responsiveSpacing(20),
                  backgroundColor: '#ffffff',
                  borderRadius: responsiveSize(16),
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View 
                  style={{
                    width: responsiveSize(40),
                    height: responsiveSize(40),
                    borderRadius: responsiveSize(12),
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: responsiveSpacing(12),
                  }}
                >
                  <ThemedText style={{ fontSize: responsiveFontSize(20) }}>💉</ThemedText>
                </View>
                <ThemedText 
                  className="font-bold mb-1"
                  style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
                >
                  {formattedDate ? bloodGlucose : 'N/A'}
                </ThemedText>
                <ThemedText 
                  style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
                >
                  Blood Glucose
                </ThemedText>
                <ThemedText 
                  className="font-semibold"
                  style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
                >
                  mg/dL
                </ThemedText>
              </View>

              {/* Carbohydrates 카드 */}
              <View 
                className="flex-1"
                style={{
                  padding: responsiveSpacing(20),
                  backgroundColor: '#ffffff',
                  borderRadius: responsiveSize(16),
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View 
                  style={{
                    width: responsiveSize(40),
                    height: responsiveSize(40),
                    borderRadius: responsiveSize(12),
                    backgroundColor: '#fef3c7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: responsiveSpacing(12),
                  }}
                >
                  <ThemedText style={{ fontSize: responsiveFontSize(20) }}>🍞</ThemedText>
                </View>
                <ThemedText 
                  className="font-bold mb-1"
                  style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
                >
                  {formattedDate ? carbohydrates : 'N/A'}
                </ThemedText>
                <ThemedText 
                  style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
                >
                  Carbohydrates
                </ThemedText>
                <ThemedText 
                  className="font-semibold"
                  style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
                >
                  grams
                </ThemedText>
              </View>
            </View>

            {/* 두 번째 행 */}
            <View className="flex-row" style={{ gap: responsiveSpacing(12) }}>
              {/* Target Level 카드 */}
              <View 
                className="flex-1"
                style={{
                  padding: responsiveSpacing(20),
                  backgroundColor: '#ffffff',
                  borderRadius: responsiveSize(16),
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View 
                  style={{
                    width: responsiveSize(40),
                    height: responsiveSize(40),
                    borderRadius: responsiveSize(12),
                    backgroundColor: '#dcfce7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: responsiveSpacing(12),
                  }}
                >
                  <ThemedText style={{ fontSize: responsiveFontSize(20) }}>🎯</ThemedText>
                </View>
                <ThemedText 
                  className="font-bold mb-1"
                  style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
                >
                  {formattedDate ? targetGlucose : 'N/A'}
                </ThemedText>
                <ThemedText 
                  style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
                >
                  Target Level
                </ThemedText>
                <ThemedText 
                  className="font-semibold"
                  style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
                >
                  mg/dL
                </ThemedText>
              </View>

              {/* Timer Duration 카드 */}
              <View 
                className="flex-1"
                style={{
                  padding: responsiveSpacing(20),
                  backgroundColor: '#ffffff',
                  borderRadius: responsiveSize(16),
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View 
                  style={{
                    width: responsiveSize(40),
                    height: responsiveSize(40),
                    borderRadius: responsiveSize(12),
                    backgroundColor: '#f3e8ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: responsiveSpacing(20),
                  }}
                >
                  <ThemedText style={{ fontSize: responsiveFontSize(20) }}>⏱️</ThemedText>
                </View>
                <ThemedText 
                  className="font-bold mb-1"
                  style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
                >
                  {formattedDate ? Math.floor(totalSeconds / 60) : 'N/A'}
                </ThemedText>
                <ThemedText 
                  style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
                >
                  Timer Duration
                </ThemedText>
                <ThemedText 
                  className="font-semibold"
                  style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
                >
                  minutes
                </ThemedText>
              </View>
            </View>
          </View>

          {/* 계산 상세 - 모던 카드 디자인 */}
          <View 
            style={{
              marginTop: responsiveSpacing(32),
              padding: responsiveSpacing(24),
              backgroundColor: '#f8fafc',
              borderRadius: responsiveSize(16),
              borderWidth: 1,
              borderColor: '#e2e8f0',
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <ThemedText 
              className="font-bold mb-4"
              style={{ fontSize: responsiveFontSize(14), color: '#1e293b', fontWeight: '600' }}
            >
              Calculation Details
            </ThemedText>
            
            {/* 계산 항목들 - 개별 카드 스타일 */}
            <View style={{ gap: responsiveSpacing(8) }}>
              <View 
                className="flex-row items-center justify-between"
                style={{
                  padding: responsiveSpacing(16),
                  backgroundColor: '#ffffff',
                  borderRadius: responsiveSize(12),
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    style={{
                      width: responsiveSize(8),
                      height: responsiveSize(8),
                      borderRadius: responsiveSize(4),
                      backgroundColor: '#3b82f6',
                      marginRight: responsiveSpacing(12),
                    }}
                  />
                  <View className="flex-1">
                    <ThemedText 
                      className="font-semibold"
                      style={{ fontSize: responsiveFontSize(12), color: '#475569', fontWeight: '600' }}
                    >
                      Carb Insulin
                    </ThemedText>
                    <ThemedText 
                      style={{ fontSize: responsiveFontSize(10), color: '#94a3b8', marginTop: 2 }}
                    >
                      {formattedDate ? `${carbohydrates}g ÷ ${insulinRatio}` : 'N/A'}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText 
                  className="font-bold"
                  style={{ fontSize: responsiveFontSize(16), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
                >
                  {formattedDate ? `${insulinData.carbInsulin}u` : 'N/A'}
                </ThemedText>
              </View>

              <View 
                className="flex-row items-center justify-between"
                style={{
                  padding: responsiveSpacing(16),
                  backgroundColor: '#ffffff',
                  borderRadius: responsiveSize(12),
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    style={{
                      width: responsiveSize(8),
                      height: responsiveSize(8),
                      borderRadius: responsiveSize(4),
                      backgroundColor: '#f59e0b',
                      marginRight: responsiveSpacing(12),
                    }}
                  />
                  <View className="flex-1">
                    <ThemedText 
                      className="font-semibold"
                      style={{ fontSize: responsiveFontSize(12), color: '#475569', fontWeight: '600' }}
                    >
                      Correction
                    </ThemedText>
                    <ThemedText 
                      style={{ fontSize: responsiveFontSize(10), color: '#94a3b8', marginTop: 2 }}
                    >
                      ({formattedDate ? bloodGlucose : 'N/A'} - {formattedDate ? targetGlucose : 'N/A'}) ÷ {formattedDate ? correctionFactor : 'N/A'}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText 
                  className="font-bold"
                  style={{ fontSize: responsiveFontSize(16), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
                >
                  {formattedDate ? `${insulinData.correctionInsulin}u` : 'N/A'}
                </ThemedText>
              </View>

              <View 
                style={{
                  height: 1,
                  marginVertical: responsiveSpacing(4),
                }}
              />

              <View 
                className="flex-row items-center justify-between"
                style={{
                  padding: responsiveSpacing(20),
                  backgroundColor: '#eff6ff',
                  borderRadius: responsiveSize(12),
                  borderWidth: 2,
                  borderColor: '#3b82f6',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <ThemedText 
                  className="font-bold"
                  style={{ fontSize: responsiveFontSize(14), color: '#1e40af', fontWeight: '700' }}
                >
                  Total Dose
                </ThemedText>
                <ThemedText 
                  className="font-bold"
                  style={{ fontSize: responsiveFontSize(18), color: '#1e40af', fontWeight: '800' }}
                >
                  {formattedDate ? `${insulinData.totalInsulin} units` : 'N/A'}
                </ThemedText>
              </View>
            </View>

            {/* 설정 정보 - 하단 카드 */}
            <View 
              style={{
                marginTop: responsiveSpacing(20),
                padding: responsiveSpacing(16),
                backgroundColor: '#ffffff',
                borderRadius: responsiveSize(12),
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="flex-row justify-between">
                <View>
                  <ThemedText 
                    style={{ fontSize: responsiveFontSize(9), color: '#94a3b8', fontWeight: '500' }}
                  >
                    Insulin Ratio
                  </ThemedText>
                  <ThemedText 
                    className="font-semibold"
                    style={{ fontSize: responsiveFontSize(10), color: '#475569' }}
                  >
                    1:{insulinRatio}g
                  </ThemedText>
                </View>
                <View>
                  <ThemedText 
                    style={{ fontSize: responsiveFontSize(9), color: '#94a3b8', fontWeight: '500' }}
                  >
                    Correction Factor
                  </ThemedText>
                  <ThemedText 
                    className="font-semibold"
                    style={{ fontSize: responsiveFontSize(10), color: '#475569' }}
                  >
                    1:{correctionFactor}mg/dL
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

    </ThemedView>
  );
});