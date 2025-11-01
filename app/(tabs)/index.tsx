import { AddAlarmModal, AlarmData, AlarmListModal, NextAlarmDisplay } from '@/components/alarm';
import { UserHeader } from '@/components/home/user-header';
import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAlarms } from '@/hooks/use-alarms';
import { useResponsive } from '@/hooks/use-responsive';
import { useAuthStore } from '@/stores/auth-store';
import type { Alarm } from '@/types/alarm';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { List, Plus } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddAlarmModal, setShowAddAlarmModal] = useState(false);
  const [showAlarmListModal, setShowAlarmListModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  
  const insets = useSafeAreaInsets();
  const { responsiveSpacing } = useResponsive();
  
  // Use alarms hook
  const {
    alarms,
    loading: alarmsLoading,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    getNextAlarm,
  } = useAlarms(user?.id);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const timerTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timerTimeout);
    }, [])
  );

  // 메모이제이션된 스타일 계산
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
      setEditingAlarm(null);
      setShowAddAlarmModal(true);
    }
  }, [user]);

  const handleViewAlarmList = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowAlarmListModal(true);
    }
  }, [user]);

  const handleSaveAlarm = useCallback(
    async (alarmData: AlarmData) => {
      try {
        if (editingAlarm) {
          // Update existing alarm
          await updateAlarm({
            id: editingAlarm.id,
            alarmTime: alarmData.alarmTime,
            mealType: alarmData.mealType,
            alarmLabel: alarmData.alarmLabel,
            isEnabled: alarmData.isEnabled,
          });
          toast.success('Alarm updated successfully!');
        } else {
          // Create new alarm
          await createAlarm({
            alarmTime: alarmData.alarmTime,
            mealType: alarmData.mealType,
            alarmLabel: alarmData.alarmLabel,
            isEnabled: alarmData.isEnabled,
          });
          toast.success('Alarm created successfully!');
        }
      } catch (error) {
        toast.error('Failed to save alarm');
        console.error('Error saving alarm:', error);
      }
    },
    [editingAlarm, createAlarm, updateAlarm]
  );

  const handleEditAlarmFromList = useCallback(
    (alarm: Alarm) => {
      setEditingAlarm(alarm);
      setShowAlarmListModal(false);
      setShowAddAlarmModal(true);
    },
    []
  );

  const handleToggleAlarm = useCallback(
    async (alarmId: string, isEnabled: boolean) => {
      try {
        await toggleAlarm(alarmId, isEnabled);
        toast.success(isEnabled ? 'Alarm enabled' : 'Alarm disabled');
      } catch (error) {
        toast.error('Failed to toggle alarm');
        console.error('Error toggling alarm:', error);
      }
    },
    [toggleAlarm]
  );

  const handleDeleteAlarm = useCallback(
    async (alarmId: string) => {
      try {
        await deleteAlarm(alarmId);
        toast.success('Alarm deleted successfully');
      } catch (error) {
        toast.error('Failed to delete alarm');
        console.error('Error deleting alarm:', error);
      }
    },
    [deleteAlarm]
  );

  const nextAlarm = useMemo(() => getNextAlarm(), [getNextAlarm]);

  return (
    <PageLoader isLoading={isLoading} minDuration={500}>
      <ThemedView className="flex-1" style={{ paddingTop: insets.top + responsiveSpacing(20) }}>
        {/* Scrollable Content */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: styles.horizontalPadding,
            paddingBottom: styles.tabBarHeight + responsiveSpacing(40),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* User Header */}
          <View style={{ marginBottom: responsiveSpacing(8) }}>
            <UserHeader />
          </View>

          <View className="items-center" style={{ paddingVertical: responsiveSpacing(16) }}>
            <NextAlarmDisplay 
              alarmTime={nextAlarm?.alarmTime}
              mealType={nextAlarm?.mealType || 'breakfast'}
              alarmLabel={nextAlarm?.alarmLabel}
              isEnabled={nextAlarm?.isEnabled ?? false}
              onEdit={() => nextAlarm && handleEditAlarmFromList(nextAlarm)}
            />

            {/* Add Alarm Button */}
            <Pressable
              onPress={handleAddAlarm}
              className="mt-6 w-full"
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View
                className="flex-row items-center justify-center py-5 px-6 rounded-2xl"
                style={{
                  backgroundColor: user ? '#2563eb' : '#cbd5e1',
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
                  <Plus size={24} color="#ffffff" strokeWidth={2.5} />
                </View>
                <ThemedText
                  className="font-bold"
                  style={{
                    fontSize: 17,
                    color: '#ffffff',
                    letterSpacing: 0.3,
                  }}
                >
                  Add Your Alarm
                </ThemedText>
              </View>
            </Pressable>

            {/* View Alarm List Button */}
            <Pressable
              onPress={handleViewAlarmList}
              className="mt-4 w-full"
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View
                className="flex-row items-center justify-center py-5 px-6 rounded-2xl"
                style={{
                  backgroundColor: '#16a34a',
                  shadowColor: '#16a34a',
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
        </ScrollView>

        {/* Add Alarm Modal */}
        <AddAlarmModal
          visible={showAddAlarmModal}
          onClose={() => {
            setShowAddAlarmModal(false);
            setEditingAlarm(null);
          }}
          onSave={handleSaveAlarm}
        />

        {/* Alarm List Modal */}
        <AlarmListModal
          visible={showAlarmListModal}
          onClose={() => setShowAlarmListModal(false)}
          alarms={alarms}
          loading={alarmsLoading}
          onToggle={handleToggleAlarm}
          onEdit={handleEditAlarmFromList}
          onDelete={handleDeleteAlarm}
        />

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
