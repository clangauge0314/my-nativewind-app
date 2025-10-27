import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from 'react-native-reanimated';


interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [isFinishing, setIsFinishing] = useState(false);
  const totalSteps = 5;
  
  const progress = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  

  
  useEffect(() => {
    // Logo animation
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });

    // Step 1: Initialize app (600ms)
    const timer1 = setTimeout(() => {
      setCurrentStep(1);
      setLoadingMessage('Initializing app...');
      progress.value = withTiming(0.2, { duration: 600, easing: Easing.ease });
    }, 0);

    // Step 2: Load fonts (700ms)
    const timer2 = setTimeout(() => {
      setCurrentStep(2);
      setLoadingMessage('Loading fonts...');
      progress.value = withTiming(0.4, { duration: 700, easing: Easing.ease });
    }, 600);

    // Step 3: Load theme (600ms)
    const timer3 = setTimeout(() => {
      setCurrentStep(3);
      setLoadingMessage('Applying theme...');
      progress.value = withTiming(0.6, { duration: 600, easing: Easing.ease });
    }, 1300);

    // Step 4: Load user preferences (600ms)
    const timer4 = setTimeout(() => {
      setCurrentStep(4);
      setLoadingMessage('Loading preferences...');
      progress.value = withTiming(0.8, { duration: 600, easing: Easing.ease });
    }, 1900);

    // Step 5: Final setup (500ms)
    const timer5 = setTimeout(() => {
      setCurrentStep(5);
      setLoadingMessage('Almost ready...');
      progress.value = withTiming(1, { duration: 500, easing: Easing.ease });
    }, 2500);

    // 최소 3초 후 푸시 알림 및 페이드 아웃 시작
    const finishTimer = setTimeout(() => {
      setIsFinishing(true);
      
      
      // 페이드 아웃 애니메이션
      screenOpacity.value = withTiming(0, { 
        duration: 500,
        easing: Easing.ease 
      });
      
      // 페이드 아웃 완료 후 onFinish 호출
      setTimeout(() => {
        onFinish();
      }, 500);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(finishTimer);
    };
  }, []);
  
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  
  const pulseAnimation = useSharedValue(1);
  
  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));
  
  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View 
      style={[
        containerStyle,
        { 
          flex: 1,
          backgroundColor: '#f8f9fa',
        }
      ]}
      className="justify-center items-center px-8"
    >
      {/* 로고 영역 */}
      <Animated.View style={logoAnimatedStyle} className="items-center mb-16">
        <Animated.View 
          style={[
            pulseStyle,
            {
              backgroundColor: '#10b981',
            }
          ]}
          className="w-24 h-24 rounded-3xl justify-center items-center mb-6"
        >
          <Text className="text-5xl">💉</Text>
        </Animated.View>
        
        <Text 
          className="text-4xl font-bold mb-2"
          style={{ color: '#1f2937' }}
        >
          Health Tracker
        </Text>
        <Text 
          className="text-sm opacity-60"
          style={{ color: '#6b7280' }}
        >
          Your health companion
        </Text>
      </Animated.View>
      
      {/* 프로그레스 바 */}
      <View className="w-full max-w-xs mb-6">
        <View 
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          <Animated.View 
            style={[
              progressBarStyle,
              { 
                backgroundColor: '#10b981',
                height: '100%',
              }
            ]} 
          />
        </View>
      </View>
      
      {/* 로딩 메시지 */}
      <Text 
        className="text-sm font-medium text-center"
        style={{ color: '#4b5563' }}
      >
        {loadingMessage}
      </Text>
      
      {/* 단계 표시 */}
      <Text 
        className="text-xs mt-2 opacity-50"
        style={{ color: '#6b7280' }}
      >
        Step {currentStep} / {totalSteps}
      </Text>
    </Animated.View>
  );
}

