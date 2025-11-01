import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAlarms } from '@/hooks/use-alarms';
import { useAuthStore } from '@/stores/auth-store';
import type { Alarm } from '@/types/alarm';
import { DAY_LABELS, MEAL_TYPE_INFO } from '@/types/alarm';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { AlarmClock, ChevronLeft, Edit2, Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function AlarmListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  
  const { alarms, loading, toggleAlarm, deleteAlarm, fetchAlarms } = useAlarms(user?.uid, user?.email || undefined);

  // 화면이 focus될 때마다 최신 알람 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      if (user?.uid && user?.email) {
        fetchAlarms();
      }
    }, [user?.uid, user?.email, fetchAlarms])
  );

  const handleToggle = async (alarmId: string, isEnabled: boolean) => {
    try {
      await toggleAlarm(alarmId, isEnabled);
      toast.success(isEnabled ? 'Alarm enabled' : 'Alarm disabled');
    } catch (error) {
      toast.error('Failed to toggle alarm');
    }
  };

  const handleDelete = (alarm: Alarm) => {
    Alert.alert(
      'Delete Alarm',
      `Are you sure you want to delete the ${alarm.alarm_label} alarm?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlarm(alarm.id);
              toast.success('Alarm deleted successfully');
            } catch (error) {
              toast.error('Failed to delete alarm');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (alarm: Alarm) => {
    router.push(`/edit-alarm?id=${alarm.id}`);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':');
    return `${hours}:${minutes}:${seconds || '00'}`;
  };

  return (
    <ThemedView className="flex-1">
      {/* Header */}
      <View
        className="px-6 pb-4 border-b border-gray-200"
        style={{
          paddingTop: insets.top + 16,
          backgroundColor: '#ffffff',
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#f3f4f6' : 'transparent',
            })}
          >
            <ChevronLeft size={28} color="#1f2937" strokeWidth={2} />
          </Pressable>

          <View className="flex-row items-center">
            <AlarmClock size={24} color="#2563eb" strokeWidth={2} />
            <ThemedText className="ml-3 font-bold" style={{ fontSize: 22 }}>
              My Alarms
            </ThemedText>
            {alarms.length > 0 && (
              <View
                className="ml-3 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#dbeafe' }}
              >
                <ThemedText
                  className="font-bold"
                  style={{ fontSize: 13, color: '#2563eb' }}
                >
                  {alarms.length}
                </ThemedText>
              </View>
            )}
          </View>

          <Pressable
            onPress={() => router.push('/add-alarm')}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#dbeafe' : '#eff6ff',
            })}
          >
            <Plus size={24} color="#2563eb" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <PageLoader isLoading={loading} minDuration={300}>
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {alarms.length === 0 ? (
            <View className="items-center justify-center py-16">
              <AlarmClock size={80} color="#cbd5e1" strokeWidth={1.5} />
              <ThemedText
                className="text-center mt-6 font-bold"
                style={{ fontSize: 24, color: '#1f2937' }}
              >
                No Alarms Yet
              </ThemedText>
              <ThemedText
                className="text-center mt-3 px-12"
                style={{ fontSize: 15, color: '#6b7280', lineHeight: 24 }}
              >
                Add your first alarm to get started with meal reminders
              </ThemedText>
              
              <Pressable
                onPress={() => router.push('/add-alarm')}
                className="mt-8 px-8 py-4 rounded-2xl"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#1e40af' : '#2563eb',
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <ThemedText
                  className="font-bold"
                  style={{ fontSize: 17, color: '#ffffff' }}
                >
                  Add First Alarm
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {alarms.map((alarm) => {
                const mealInfo = MEAL_TYPE_INFO[alarm.meal_type];
                return (
                  <View
                    key={alarm.id}
                    className="rounded-3xl p-6"
                    style={{
                      backgroundColor: alarm.is_enabled ? '#ffffff' : '#f9fafb',
                      borderWidth: 2,
                      borderColor: alarm.is_enabled ? '#2563eb' : '#e5e7eb',
                      shadowColor: alarm.is_enabled ? '#2563eb' : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: alarm.is_enabled ? 0.1 : 0.05,
                      shadowRadius: 8,
                      elevation: alarm.is_enabled ? 3 : 1,
                    }}
                  >
                    {/* Header Row */}
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-16 h-16 rounded-full items-center justify-center mr-4"
                          style={{ backgroundColor: mealInfo.color + '20' }}
                        >
                          <ThemedText style={{ fontSize: 32 }}>
                            {mealInfo.icon}
                          </ThemedText>
                        </View>
                        <View className="flex-1">
                          <ThemedText
                            className="font-bold mb-1"
                            style={{
                              fontSize: 36,
                              color: alarm.is_enabled ? '#1f2937' : '#9ca3af',
                              lineHeight: 40,
                            }}
                          >
                            {formatTime(alarm.alarm_time)}
                          </ThemedText>
                          <ThemedText
                            className="font-semibold"
                            style={{
                              fontSize: 15,
                              color: alarm.is_enabled ? '#6b7280' : '#9ca3af',
                            }}
                          >
                            {alarm.alarm_label}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Toggle Switch */}
                      <Pressable
                        onPress={() => handleToggle(alarm.id, !alarm.is_enabled)}
                        className="ml-3"
                      >
                        <View
                          className="rounded-full items-center justify-center"
                          style={{
                            width: 64,
                            height: 36,
                            backgroundColor: alarm.is_enabled ? '#2563eb' : '#d1d5db',
                          }}
                        >
                          <View
                            className="absolute rounded-full"
                            style={{
                              width: 30,
                              height: 30,
                              backgroundColor: '#ffffff',
                              left: alarm.is_enabled ? 30 : 4,
                            }}
                          />
                        </View>
                      </Pressable>
                    </View>

                    {/* Repeat Days */}
                    {alarm.repeat_days && alarm.repeat_days.length > 0 && (
                      <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                        {alarm.repeat_days.map((day) => (
                          <View
                            key={day}
                            className="px-3 py-1.5 rounded-lg"
                            style={{
                              backgroundColor: alarm.is_enabled ? '#dbeafe' : '#f3f4f6',
                            }}
                          >
                            <ThemedText
                              className="font-bold"
                              style={{
                                fontSize: 12,
                                color: alarm.is_enabled ? '#2563eb' : '#9ca3af',
                              }}
                            >
                              {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                            </ThemedText>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row" style={{ gap: 10 }}>
                      <Pressable
                        onPress={() => handleEdit(alarm)}
                        className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? '#dbeafe' : '#eff6ff',
                          borderWidth: 1,
                          borderColor: '#bfdbfe',
                        })}
                      >
                        <Edit2 size={18} color="#2563eb" strokeWidth={2} />
                        <ThemedText
                          className="ml-2 font-bold"
                          style={{ fontSize: 15, color: '#2563eb' }}
                        >
                          Edit
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        onPress={() => handleDelete(alarm)}
                        className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? '#fecaca' : '#fee2e2',
                          borderWidth: 1,
                          borderColor: '#fca5a5',
                        })}
                      >
                        <Trash2 size={18} color="#dc2626" strokeWidth={2} />
                        <ThemedText
                          className="ml-2 font-bold"
                          style={{ fontSize: 15, color: '#dc2626' }}
                        >
                          Delete
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </PageLoader>
    </ThemedView>
  );
}

