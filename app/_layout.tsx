import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AppState, LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { AlarmActionModal } from '@/components/alarm';
import { LottieSplashScreen } from '@/components/lottie-splash-screen';
import { useFirebaseMessaging } from '@/hooks/use-firebase-messaging';
import { useNotificationChannel } from '@/hooks/use-notification-channel';
import { useAuthStore } from '@/stores/auth-store';

import '@/global.css';

// Firebase deprecated warnings 숨기기
LogBox.ignoreLogs([
  'This method is deprecated',
  'React Native Firebase',
  'migrating-to-v22',
]);

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [alarmData, setAlarmData] = useState<any>(null);

  // 알림 클릭 리스너 추가
  const { notificationTapped } = useFirebaseMessaging(user?.uid, user?.email || undefined);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // 1. FCM 알림 클릭 (백그라운드/앱 종료)
  useEffect(() => {
    if (notificationTapped?.data && (notificationTapped.data.mealType || notificationTapped.data.alarmId)) {
      setAlarmData({
        alarmId: (notificationTapped.data.alarmId as string) || 'unknown',
        mealType: (notificationTapped.data.mealType as string) || 'breakfast',
        alarmLabel: (notificationTapped.data.alarmLabel as string) || 'Meal',
      });
      
      setShowAlarmModal(true);
    }
  }, [notificationTapped]);

  // 2. Expo Notifications 클릭 (포그라운드)
  useEffect(() => {
    // 알림 수신 리스너
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // 알림 수신됨
    });

    // 알림 클릭 리스너
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.mealType || data?.alarmId) {
        setAlarmData({
          alarmId: (data.alarmId as string) || 'unknown',
          mealType: (data.mealType as string) || 'breakfast',
          alarmLabel: (data.alarmLabel as string) || 'Meal',
        });
        
        setShowAlarmModal(true);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const handleYes = () => {
    setShowAlarmModal(false);
    
    // 혈당 입력 페이지로 이동
    setTimeout(() => {
      router.push('/add-record');
    }, 300);
  };

  const handleNo = () => {
    setShowAlarmModal(false);
    setAlarmData(null);
  };

  return (
    <>
      <ThemeProvider value={DefaultTheme}>
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: '#ffffff',
            },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="signup" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="add-alarm" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="alarm-list" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="edit-alarm" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="add-record" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="quiz" 
            options={{ 
              headerShown: false,
              presentation: 'card',
            }} 
          />
          <Stack.Screen 
            name="quiz-detail" 
            options={{ 
              headerShown: false,
              presentation: 'card',
            }} 
          />
        </Stack>
        <Toaster 
          theme="light"
          position="bottom-center"
          richColors
        />
        <StatusBar style="dark" />
      </ThemeProvider>

      {/* 알람 액션 모달 */}
      <AlarmActionModal
        visible={showAlarmModal}
        alarmLabel={alarmData?.alarmLabel || 'Meal'}
        mealType={alarmData?.mealType || 'breakfast'}
        onYes={handleYes}
        onNo={handleNo}
      />
    </>
  );
}

export default function RootLayout() {
  const { initializeAuth, initialized, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Android Notification Channel 생성
  useNotificationChannel();

  // Firebase Auth 초기화
  useEffect(() => {
    const initAuth = async () => {
      await initializeAuth();
      setAuthInitialized(true);
    };
    
    initAuth();
  }, []);

  // 네비게이션 바 제어 (Android만)
  useEffect(() => {
    if (Platform.OS === 'android') {
      const hideNavBar = async () => {
        try {
          // Edge-to-edge 환경에서도 지원되는 호출만 사용
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (error) {
          console.log('Navigation bar setup failed:', error);
        }
      };

      const handleAppStateChange = (nextAppState: string) => {
        // If app is being used, hide nav bar
        if (nextAppState === 'active') {
          hideNavBar();
        }
      };

      // 초기 설정
      hideNavBar();

      // Subscribe to app state changes
      const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

      // Clean up the event listener when the component unmounts
      return () => {
        appStateSubscription.remove();
      };
    }
  }, []);

  // 스플래시 스크린이 끝났는지 추적
  const [splashFinished, setSplashFinished] = useState(false);

  // 스플래시와 Auth 둘 다 완료되면 메인으로 이동
  useEffect(() => {
    if (splashFinished && authInitialized) {
      setIsLoading(false);
    }
  }, [splashFinished, authInitialized]);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LottieSplashScreen 
            onFinish={() => {
              setSplashFinished(true);
            }} 
          />
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}