import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface LottieSplashScreenProps {
  onFinish: () => void;
}

export function LottieSplashScreen({ onFinish }: LottieSplashScreenProps) {
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [progressPercent, setProgressPercent] = useState(0);
  
  const progress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const displayProgress = useSharedValue(0);
  const animationRef = useRef<LottieView>(null);
  
  // Update percentage display smoothly
  useAnimatedReaction(
    () => displayProgress.value,
    (currentValue) => {
      runOnJS(setProgressPercent)(Math.round(currentValue));
    }
  );
  
  useEffect(() => {
    setTimeout(() => {
      animationRef.current?.play();
    }, 100);

    // Random loading times for each step
    // Total time will be between 3000-5000ms
    const randomDuration = (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min;

    // Generate random durations for each step
    const step1Duration = randomDuration(400, 800);   // 400-800ms
    const step2Duration = randomDuration(500, 900);   // 500-900ms
    const step3Duration = randomDuration(400, 800);   // 400-800ms
    const step4Duration = randomDuration(500, 900);   // 500-900ms
    const step5Duration = randomDuration(400, 800);   // 400-800ms

    const totalLoadingTime = step1Duration + step2Duration + step3Duration + step4Duration + step5Duration;
    
    // Ensure minimum 3 seconds
    const finalLoadingTime = Math.max(totalLoadingTime, 3000);

    // Step 1: Initialize app - 0% to 20%
    const timer1 = setTimeout(() => {
      setLoadingMessage('Initializing app...');
      progress.value = withTiming(0.2, { duration: step1Duration, easing: Easing.ease });
      displayProgress.value = withTiming(20, { duration: step1Duration, easing: Easing.ease });
    }, 0);

    // Step 2: Load fonts - 20% to 40%
    const timer2 = setTimeout(() => {
      setLoadingMessage('Loading fonts...');
      progress.value = withTiming(0.4, { duration: step2Duration, easing: Easing.ease });
      displayProgress.value = withTiming(40, { duration: step2Duration, easing: Easing.ease });
    }, step1Duration);

    // Step 3: Load theme - 40% to 60%
    const timer3 = setTimeout(() => {
      setLoadingMessage('Applying theme...');
      progress.value = withTiming(0.6, { duration: step3Duration, easing: Easing.ease });
      displayProgress.value = withTiming(60, { duration: step3Duration, easing: Easing.ease });
    }, step1Duration + step2Duration);

    // Step 4: Load user preferences - 60% to 80%
    const timer4 = setTimeout(() => {
      setLoadingMessage('Loading preferences...');
      progress.value = withTiming(0.8, { duration: step4Duration, easing: Easing.ease });
      displayProgress.value = withTiming(80, { duration: step4Duration, easing: Easing.ease });
    }, step1Duration + step2Duration + step3Duration);

    // Step 5: Final setup - 80% to 100%
    const timer5 = setTimeout(() => {
      setLoadingMessage('Almost ready...');
      progress.value = withTiming(1, { duration: step5Duration, easing: Easing.ease });
      displayProgress.value = withTiming(100, { duration: step5Duration, easing: Easing.ease });
    }, step1Duration + step2Duration + step3Duration + step4Duration);

    // Fade out after loading completes
    const finishTimer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { 
        duration: 500,
        easing: Easing.ease 
      });
      
      setTimeout(() => {
        onFinish();
      }, 500);
    }, finalLoadingTime);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(finishTimer);
    };
  }, []);
  
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
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
       {/* Lottie 애니메이션 */}
       <View className="items-center mb-12">
         <LottieView
           ref={animationRef}
           source={require('../assets/animations/loading.json')}
           autoPlay
           loop
           style={{
             width: 200,
             height: 200,
           }}
         />
        
        <Text 
          className="text-4xl font-bold mb-2 mt-4"
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
      </View>
      
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
                backgroundColor: '#2563eb',
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
      
      {/* Progress percentage */}
      <Text 
        className="text-lg mt-2 font-bold"
        style={{ color: '#2563eb' }}
      >
        {progressPercent}%
      </Text>
    </Animated.View>
  );
}

