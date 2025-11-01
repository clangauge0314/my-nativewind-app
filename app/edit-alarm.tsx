import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DigitalClock } from '@/components/ui/digital-clock';
import { useAlarms } from '@/hooks/use-alarms';
import { useAuthStore } from '@/stores/auth-store';
import type { RepeatDay } from '@/types/alarm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlarmClock, Apple, Bell, Calendar, ChevronLeft, ChevronRight, Moon, Soup, Sunrise } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

interface AlarmData {
  alarmTime: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  alarmLabel: string;
  isEnabled: boolean;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: Sunrise, color: '#f59e0b' },
  { value: 'lunch', label: 'Lunch', icon: Soup, color: '#3b82f6' },
  { value: 'dinner', label: 'Dinner', icon: Moon, color: '#8b5cf6' },
  { value: 'snack', label: 'Snack', icon: Apple, color: '#ef4444' },
  { value: 'other', label: 'Other', icon: AlarmClock, color: '#6b7280' },
];

const DAYS_OF_WEEK: { value: RepeatDay; label: string }[] = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export default function EditAlarmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { alarms, updateAlarm, loading } = useAlarms(user?.uid, user?.email || undefined);
  
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedSecond, setSelectedSecond] = useState(0);
  const [isPM, setIsPM] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<AlarmData['mealType']>('breakfast');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<RepeatDay[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [isLoading, setIsLoading] = useState(true);

  // Load alarm data
  useEffect(() => {
    if (!params.id || alarms.length === 0) return;

    const alarm = alarms.find(a => a.id === params.id);
    
    if (alarm) {
      // Parse time
      const [hours, minutes, seconds] = alarm.alarm_time.split(':').map(Number);
      
      // Convert 24-hour to 12-hour format
      let hour12 = hours;
      let pm = false;
      
      if (hours === 0) {
        hour12 = 12;
        pm = false;
      } else if (hours === 12) {
        hour12 = 12;
        pm = true;
      } else if (hours > 12) {
        hour12 = hours - 12;
        pm = true;
      } else {
        hour12 = hours;
        pm = false;
      }

      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setSelectedSecond(seconds || 0);
      setIsPM(pm);
      setSelectedMealType(alarm.meal_type);
      setIsEnabled(alarm.is_enabled);
      setNotificationTitle(alarm.notification_title || '');
      setSelectedDays(alarm.repeat_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
      setIsLoading(false);
    }
  }, [params.id, alarms]);

  const handleSave = async () => {
    if (!user || !params.id) {
      toast.error('Please login to edit alarms');
      return;
    }

    try {
      setIsSaving(true);

      // Convert 12-hour to 24-hour format
      let hour24 = selectedHour;
      if (isPM && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      } else if (!isPM && selectedHour === 12) {
        hour24 = 0;
      }

      const alarmTime = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}:${selectedSecond.toString().padStart(2, '0')}`;
      const alarmLabel = MEAL_TYPES.find(m => m.value === selectedMealType)?.label || '';

      await updateAlarm({
        id: params.id,
        alarmTime,
        mealType: selectedMealType,
        alarmLabel,
        isEnabled,
        repeatDays: selectedDays,
        notificationTitle: notificationTitle.trim() || `${alarmLabel} Reminder`,
        notificationBody: `Time for your ${alarmLabel.toLowerCase()}!`,
      });

      toast.success('Alarm updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Error updating alarm:', error);
      
      if (error.message === 'An alarm with this time already exists') {
        toast.error('This time is already used for another alarm');
      } else {
        toast.error('Failed to update alarm');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (text: string) => {
    const num = parseInt(text) || 12;
    if (num >= 1 && num <= 12) {
      setSelectedHour(num);
    }
  };

  const handleMinuteChange = (text: string) => {
    const num = parseInt(text) || 0;
    if (num >= 0 && num <= 59) {
      setSelectedMinute(num);
    }
  };

  const handleSecondChange = (text: string) => {
    const num = parseInt(text) || 0;
    if (num >= 0 && num <= 59) {
      setSelectedSecond(num);
    }
  };

  const incrementHour = () => {
    if (selectedHour === 12) {
      setSelectedHour(1);
    } else if (selectedHour === 11) {
      setSelectedHour(12);
      setIsPM(!isPM); // 11 → 12일 때 AM/PM 전환
    } else {
      setSelectedHour(selectedHour + 1);
    }
  };

  const decrementHour = () => {
    if (selectedHour === 1) {
      setSelectedHour(12);
    } else if (selectedHour === 12) {
      setSelectedHour(11);
      setIsPM(!isPM); // 12 → 11일 때 AM/PM 전환
    } else {
      setSelectedHour(selectedHour - 1);
    }
  };

  const incrementMinute = () => {
    if (selectedMinute === 59) {
      setSelectedMinute(0);
      incrementHour();
    } else {
      setSelectedMinute(selectedMinute + 1);
    }
  };

  const decrementMinute = () => {
    if (selectedMinute === 0) {
      setSelectedMinute(59);
      decrementHour();
    } else {
      setSelectedMinute(selectedMinute - 1);
    }
  };

  const incrementSecond = () => {
    if (selectedSecond === 59) {
      setSelectedSecond(0);
    } else {
      setSelectedSecond(selectedSecond + 1);
    }
  };

  const decrementSecond = () => {
    if (selectedSecond === 0) {
      setSelectedSecond(59);
    } else {
      setSelectedSecond(selectedSecond - 1);
    }
  };

  const formatTime = (hour: number, minute: number, second: number, pm: boolean) => {
    return `${hour}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${pm ? 'PM' : 'AM'}`;
  };

  const toggleDay = (day: RepeatDay) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        // Don't allow removing all days
        if (prev.length === 1) {
          toast.error('At least one day must be selected');
          return prev;
        }
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort((a, b) => {
          const order: RepeatDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          return order.indexOf(a) - order.indexOf(b);
        });
      }
    });
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <ThemedText className="mt-4" style={{ fontSize: 16, color: '#6b7280' }}>
          Loading alarm...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1" style={{ backgroundColor: '#ffffff' }}>
      {/* Header */}
      <View
        className="px-4 flex-row items-center justify-between border-b"
        style={{
          paddingTop: insets.top + 24,
          paddingBottom: 16,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#6b7280', fontWeight: '400' }}>
            Cancel
          </ThemedText>
        </Pressable>

        <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#1f2937', fontWeight: '600' }}>
          Edit Alarm
        </ThemedText>

        <Pressable
          onPress={handleSave}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#2563eb', fontWeight: '600' }}>
              Save
            </ThemedText>
          )}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 현재 시간 표시 */}
        <View className="px-6 pt-4 pb-2">
          <View 
            className="px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bfdbfe' }}
          >
            <ThemedText className="mb-1" style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>
              Current Time
            </ThemedText>
            <DigitalClock showSeconds={true} showDate={false} size="small" />
          </View>
        </View>

        <View className="items-center py-8 mt-2">
          <ThemedText
            style={{
              fontSize: selectedHour >= 10 ? 70 : 80,
              lineHeight: selectedHour >= 10 ? 84 : 96,
              fontWeight: '200',
              color: '#1f2937',
              letterSpacing: selectedHour >= 10 ? -3 : -2,
            }}
          >
            {formatTime(selectedHour, selectedMinute, selectedSecond, isPM)}
          </ThemedText>
          
          {/* AM/PM Toggle */}
          <View className="flex-row mt-4" style={{ gap: 8 }}>
            <Pressable
              onPress={() => setIsPM(false)}
              className="px-8 py-2 rounded-xl"
              style={{
                backgroundColor: !isPM ? '#2563eb' : '#f3f4f6',
              }}
            >
              <ThemedText
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  fontWeight: '600',
                  color: !isPM ? '#ffffff' : '#6b7280',
                }}
              >
                AM
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setIsPM(true)}
              className="px-8 py-2 rounded-xl"
              style={{
                backgroundColor: isPM ? '#2563eb' : '#f3f4f6',
              }}
            >
              <ThemedText
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  fontWeight: '600',
                  color: isPM ? '#ffffff' : '#6b7280',
                }}
              >
                PM
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Time Picker Controls */}
        <View className="px-6 mb-8">
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#f9fafb' }}
          >
            {/* Hour Picker */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#1f2937', fontWeight: '500' }}>Hour</ThemedText>
              <View className="flex-row items-center">
                <Pressable
                  onPress={decrementHour}
                  className="w-10 h-10 items-center justify-center"
                >
                  <ChevronLeft size={24} color="#2563eb" strokeWidth={2} />
                </Pressable>
                <TextInput
                  value={selectedHour.toString().padStart(2, '0')}
                  onChangeText={handleHourChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="mx-2 px-6 py-2 rounded-lg text-center"
                  style={{
                    backgroundColor: '#ffffff',
                    minWidth: 70,
                    fontSize: 20,
                    lineHeight: 28,
                    color: '#1f2937',
                    fontWeight: '600',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}
                />
                <Pressable
                  onPress={incrementHour}
                  className="w-10 h-10 items-center justify-center"
                >
                  <ChevronRight size={24} color="#2563eb" strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* Minute Picker */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#1f2937', fontWeight: '500' }}>Minute</ThemedText>
              <View className="flex-row items-center">
                <Pressable
                  onPress={decrementMinute}
                  className="w-10 h-10 items-center justify-center"
                >
                  <ChevronLeft size={24} color="#2563eb" strokeWidth={2} />
                </Pressable>
                <TextInput
                  value={selectedMinute.toString().padStart(2, '0')}
                  onChangeText={handleMinuteChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="mx-2 px-6 py-2 rounded-lg text-center"
                  style={{
                    backgroundColor: '#ffffff',
                    minWidth: 70,
                    fontSize: 20,
                    lineHeight: 28,
                    color: '#1f2937',
                    fontWeight: '600',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}
                />
                <Pressable
                  onPress={incrementMinute}
                  className="w-10 h-10 items-center justify-center"
                >
                  <ChevronRight size={24} color="#2563eb" strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* Second Picker */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#1f2937', fontWeight: '500' }}>Second</ThemedText>
              <View className="flex-row items-center">
                <Pressable
                  onPress={decrementSecond}
                  className="w-10 h-10 items-center justify-center"
                >
                  <ChevronLeft size={24} color="#2563eb" strokeWidth={2} />
                </Pressable>
                <TextInput
                  value={selectedSecond.toString().padStart(2, '0')}
                  onChangeText={handleSecondChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="mx-2 px-6 py-2 rounded-lg text-center"
                  style={{
                    backgroundColor: '#ffffff',
                    minWidth: 70,
                    fontSize: 20,
                    lineHeight: 28,
                    color: '#1f2937',
                    fontWeight: '600',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}
                />
                <Pressable
                  onPress={incrementSecond}
                  className="w-10 h-10 items-center justify-center"
                >
                  <ChevronRight size={24} color="#2563eb" strokeWidth={2} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Meal Type Selector */}
        <View className="px-6 mb-8">
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#f9fafb' }}
          >
            {MEAL_TYPES.map((meal, index) => {
              const Icon = meal.icon;
              return (
                <Pressable
                  key={meal.value}
                  onPress={() => setSelectedMealType(meal.value as any)}
                  className="flex-row items-center justify-between px-4 py-4"
                  style={{
                    borderBottomWidth: index < MEAL_TYPES.length - 1 ? 1 : 0,
                    borderBottomColor: '#e5e7eb',
                  }}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: meal.color + '20' }}
                    >
                      <Icon size={20} color={meal.color} strokeWidth={2} />
                    </View>
                    <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#1f2937', fontWeight: '500' }}>
                      {meal.label}
                    </ThemedText>
                  </View>
                  {selectedMealType === meal.value && (
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: '#2563eb' }}
                    >
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Notification Title */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center mb-3">
            <Bell size={20} color="#2563eb" strokeWidth={2} />
            <ThemedText
              className="ml-2 font-bold"
              style={{ fontSize: 15, lineHeight: 20, color: '#1f2937', letterSpacing: 0.5 }}
            >
              NOTIFICATION TITLE
            </ThemedText>
          </View>
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#f9fafb' }}
          >
            <TextInput
              value={notificationTitle}
              onChangeText={setNotificationTitle}
              placeholder="e.g., Time for breakfast!"
              placeholderTextColor="#9ca3af"
              className="px-4 py-4"
              style={{
                fontSize: 17,
                lineHeight: 24,
                color: '#1f2937',
                fontWeight: '500',
              }}
            />
          </View>
          <ThemedText
            className="mt-2 px-1"
            style={{ fontSize: 13, lineHeight: 18, color: '#6b7280' }}
          >
            Leave empty to use default notification
          </ThemedText>
        </View>

        {/* Repeat Days Selector */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center mb-3">
            <Calendar size={20} color="#2563eb" strokeWidth={2} />
            <ThemedText
              className="ml-2 font-bold"
              style={{ fontSize: 15, lineHeight: 20, color: '#1f2937', letterSpacing: 0.5 }}
            >
              REPEAT DAYS
            </ThemedText>
          </View>
          <View className="flex-row justify-between" style={{ gap: 8 }}>
            {DAYS_OF_WEEK.map((day) => (
              <Pressable
                key={day.value}
                onPress={() => toggleDay(day.value)}
                className="flex-1 items-center justify-center py-4 rounded-2xl"
                style={{
                  backgroundColor: selectedDays.includes(day.value) ? '#2563eb' : '#f9fafb',
                  borderWidth: 2,
                  borderColor: selectedDays.includes(day.value) ? '#2563eb' : '#e5e7eb',
                }}
              >
                <ThemedText
                  className="font-bold"
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: selectedDays.includes(day.value) ? '#ffffff' : '#6b7280',
                  }}
                >
                  {day.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Alarm Status Toggle */}
        <View className="px-6">
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#f9fafb' }}
          >
            <View className="flex-row items-center justify-between px-4 py-4">
              <ThemedText style={{ fontSize: 17, lineHeight: 24, color: '#1f2937', fontWeight: '500' }}>
                Alarm
              </ThemedText>
              <Switch
                value={isEnabled}
                onValueChange={setIsEnabled}
                trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#d1d5db"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

