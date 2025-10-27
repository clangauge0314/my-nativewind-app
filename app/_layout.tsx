import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { LottieSplashScreen } from '@/components/lottie-splash-screen';
import { useAuthStore } from '@/stores/auth-store';

import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { initializeAuth, initialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Supabase Auth 초기화
  useEffect(() => {
    const initAuth = async () => {
      await initializeAuth();
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LottieSplashScreen onFinish={() => setIsLoading(false)} />
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
          </Stack>
          <Toaster 
            theme="light"
            position="bottom-center"
            richColors
          />
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}