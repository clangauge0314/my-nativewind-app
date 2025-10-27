import { InsulinTimer } from '@/components/health/insulin-timer';
import { UserHeader } from '@/components/home/user-header';
import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useInsulinTimer } from '@/hooks/use-insulin-timer';
import { useResponsive } from '@/hooks/use-responsive';
import { useAuthStore } from '@/stores/auth-store';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Use the insulin timer hook
  const timer = useInsulinTimer(user?.id);
  
  // Extract values from latest record for the timer display
  const bloodGlucose = timer.latestRecord?.current_glucose ?? 150;
  const carbohydrates = timer.latestRecord?.carbohydrates ?? 60;
  const insulinRatio = timer.latestRecord?.insulin_ratio ?? 15;
  const correctionFactor = timer.latestRecord?.correction_factor ?? 50;
  const targetGlucose = timer.latestRecord?.target_glucose ?? 100;
  
  const insets = useSafeAreaInsets();
  const { responsiveSize, responsiveSpacing, responsiveFontSize, getComponentSpacing, screenSize, screenHeight } = useResponsive();

  useEffect(() => {
    const setupNotifications = async () => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      await Notifications.requestPermissionsAsync();
    };
    setupNotifications();
  }, []);

  // 타이머 완료 시 알림 전송 (hasActiveTimer로 초기 0:00 상태 제외)
  useEffect(() => {
    if (timer.remainingSeconds === 0 && timer.hasActiveTimer && !timer.notificationSent && timer.isCompleted) {
      const sendNotification = async () => {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Insulin Timer Complete",
              body: "Your insulin timer has finished. Please check your glucose levels and prepare for your next dose.",
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
          });
        } catch (error) {
          console.error('Notification error:', error);
        }
      };
      sendNotification();
      timer.setNotificationSent(true);
    }
  }, [timer.remainingSeconds, timer.hasActiveTimer, timer.isCompleted, timer.notificationSent, timer.setNotificationSent]);

  useFocusEffect(
    useCallback(() => {
      timer.setIsLoading(true);
      timer.fetchLatestRecord();
      const timerTimeout = setTimeout(() => {
        timer.setIsLoading(false);
      }, 100);

      return () => clearTimeout(timerTimeout);
    }, [timer.fetchLatestRecord, timer.setIsLoading])
  );

  // 메모이제이션된 스타일 계산
  const styles = useMemo(() => {
    const androidNavBarHeight = Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom : 48) : 0;
    const tabBarHeight = (Platform.OS === 'ios' ? 88 : 68) + androidNavBarHeight;
    
    return {
      androidNavBarHeight,
      tabBarHeight,
      componentSpacing: getComponentSpacing,
      horizontalPadding: responsiveSpacing(32), // px-8 = 32px
      timerWidth: responsiveSize(280),
      timerHeight: responsiveSize(8),
      bottomGap: screenHeight * -0.05, // 디바이스 높이의 -10% (탭바 위로 올라감)
    };
  }, [insets.bottom, getComponentSpacing, responsiveSpacing, responsiveSize, screenHeight]);

  const handleAddData = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      // Navigate to edit-record if there's a latest record, otherwise add-record
      if (timer.latestRecord) {
        router.push(`/edit-record?id=${timer.latestRecord.id}`);
      } else {
        router.push('/add-record');
      }
    }
  }, [user, router, timer.latestRecord]);

  return (
    <PageLoader isLoading={timer.isLoading} minDuration={500}>
      <ThemedView className="flex-1" style={{ paddingTop: insets.top + responsiveSpacing(20) }}>
        {/* Scrollable Content */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: styles.horizontalPadding,
            paddingBottom: styles.tabBarHeight + responsiveSpacing(40), // 탭바 높이 + 여백
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* User Header */}
          <View style={{ marginBottom: responsiveSpacing(8) }}>
            <UserHeader />
          </View>

          <View className="items-center" style={{ paddingVertical: responsiveSpacing(16) }}>
            <InsulinTimer 
              totalSeconds={timer.totalSeconds}
              remainingSeconds={timer.remainingSeconds}
              hasActiveTimer={timer.hasActiveTimer}
              width={styles.timerWidth}
              height={styles.timerHeight}
              onEdit={handleAddData}
              onInsulinInjected={timer.markInsulinInjected}
              bloodGlucose={bloodGlucose}
              carbohydrates={carbohydrates}
              insulinRatio={insulinRatio}
              correctionFactor={correctionFactor}
              targetGlucose={targetGlucose}
              createdAt={timer.latestRecord?.created_at}
              insulinInjected={timer.latestRecord?.insulin_injected || false}
            />
          </View>
        </ScrollView>

        {/* Login Required Modal */}
        <Modal
          visible={showLoginModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-8">
            <View className="bg-white rounded-2xl p-8 w-full max-w-sm">
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <ThemedText className="text-2xl">🔒</ThemedText>
                </View>
                <ThemedText className="text-xl font-bold text-gray-800 text-center">
                  Login Required
                </ThemedText>
                <ThemedText className="text-gray-500 text-center mt-2">
                  Please log in to access your user information and personalized features.
                </ThemedText>
              </View>
              
              <Pressable
                onPress={() => setShowLoginModal(false)}
                className="py-3 px-6 bg-gray-500 rounded-xl"
              >
                <ThemedText className="text-white font-semibold text-center">
                  Close
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </PageLoader>
  );
}

export default HomeScreen;
