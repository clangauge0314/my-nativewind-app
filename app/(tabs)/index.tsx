import { NextAlarmDisplay } from '@/components/alarm';
import { UserHeader } from '@/components/home/user-header';
import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DigitalClock } from '@/components/ui/digital-clock';
import { useAlarms } from '@/hooks/use-alarms';
import { useResponsive } from '@/hooks/use-responsive';
import { useAuthStore } from '@/stores/auth-store';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { List } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const insets = useSafeAreaInsets();
  const { responsiveSpacing } = useResponsive();
  
  const { alarms, getNextAlarm, getSecondNextAlarm, fetchAlarms } = useAlarms(user?.uid, user?.email || undefined);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      
      // 화면이 focus될 때마다 알람 새로고침
      if (user?.uid && user?.email) {
        fetchAlarms();
      }
      
      const timerTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timerTimeout);
    }, [user?.uid, user?.email, fetchAlarms])
  );

  const styles = useMemo(() => {
    const tabBarHeight = insets.bottom + 68;
    
    return {
      tabBarHeight,
      horizontalPadding: responsiveSpacing(32),
    };
  }, [insets.bottom, responsiveSpacing]);

  const handleAddAlarm = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      router.push('/add-alarm');
    }
  }, [user, router]);

  const handleViewAlarmList = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      router.push('/alarm-list');
    }
  }, [user, router]);

  const nextAlarm = useMemo(() => getNextAlarm(), [getNextAlarm, alarms]);
  const secondNextAlarm = useMemo(() => getSecondNextAlarm(), [getSecondNextAlarm, alarms]);

  return (
    <PageLoader isLoading={isLoading} minDuration={500}>
      <ThemedView className="flex-1" style={{ paddingTop: insets.top + responsiveSpacing(20) }}>
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: styles.horizontalPadding,
            paddingBottom: styles.tabBarHeight + responsiveSpacing(40),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginBottom: responsiveSpacing(8) }}>
            <UserHeader />
          </View>

          {/* 디지털 시계 */}
          <View 
            className="mt-4 mb-3 px-6 py-5 rounded-3xl"
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
            <View className="flex-row items-center justify-between">
              <View>
                <ThemedText 
                  style={{ 
                    fontSize: 13, 
                    color: '#6b7280', 
                    fontWeight: '600',
                    marginBottom: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  CURRENT TIME
                </ThemedText>
                <DigitalClock showSeconds={true} showDate={false} size="large" />
              </View>
            </View>
          </View>
          
          <View style={{ paddingVertical: responsiveSpacing(8) }}>
            <NextAlarmDisplay 
              alarmTime={nextAlarm?.alarmTime}
              mealType={nextAlarm?.mealType || 'breakfast'}
              alarmLabel={nextAlarm?.alarmLabel}
              isEnabled={true}
              onEdit={() => router.push('/alarm-list')}
            />

            <View 
              className="mt-6 px-4 py-3 rounded-xl flex-row items-center justify-between"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <ThemedText style={{ fontSize: 14, color: '#6b7280', fontWeight: '500' }}>
                Following Alarm
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#1f2937', fontWeight: '600' }}>
                {secondNextAlarm?.alarmTime 
                  ? `${secondNextAlarm.alarmTime.substring(0, 5)} • ${secondNextAlarm.alarmLabel || 'Alarm'}`
                  : 'No more alarms'}
              </ThemedText>
            </View>

            <View className="items-center">
            <Pressable
              onPress={handleViewAlarmList}
              className="mt-6 w-full"
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View
                className="flex-row items-center justify-center py-5 px-6 rounded-2xl"
                style={{
                  backgroundColor: '#2563eb',
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <List size={24} color="#ffffff" strokeWidth={2.5} />
                </View>
                <ThemedText
                  className="font-bold"
                  style={{
                    fontSize: 17,
                    color: '#ffffff',
                    letterSpacing: 0.3,
                  }}
                >
                  View Alarm List
                </ThemedText>
              </View>
            </Pressable>
            </View>
          </View>
        </ScrollView>

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
