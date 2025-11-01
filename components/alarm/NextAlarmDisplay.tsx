import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { AlarmClock, Bell, Calendar, Clock, Edit2, Utensils } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

export interface NextAlarmDisplayProps {
  alarmTime?: string; // "08:00:00" 형식
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  alarmLabel?: string;
  isEnabled?: boolean;
  onEdit?: () => void;
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  other: 'Other',
};

export const NextAlarmDisplay = React.memo(function NextAlarmDisplay({
  alarmTime,
  mealType = 'breakfast',
  alarmLabel,
  isEnabled = true,
  onEdit,
}: NextAlarmDisplayProps) {
  const { responsiveSize, responsiveFontSize } = useResponsive();

  const formattedTime = useMemo(() => {
    if (!alarmTime) return '--:--';
    const [hours, minutes] = alarmTime.split(':');
    return `${hours}:${minutes}`;
  }, [alarmTime]);

  const mealTypeLabel = useMemo(
    () => alarmLabel || MEAL_TYPE_LABELS[mealType] || mealType,
    [alarmLabel, mealType]
  );

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const timeUntilAlarm = useMemo(() => {
    if (!alarmTime) return null;
    const [hours, minutes] = alarmTime.split(':').map(Number);
    let diff = (hours * 60 + minutes) - (currentHour * 60 + currentMinute);
    if (diff < 0) diff += 24 * 60; // Tomorrow
    
    const hoursUntil = Math.floor(diff / 60);
    const minutesUntil = diff % 60;
    
    if (hoursUntil === 0) {
      return `in ${minutesUntil} min`;
    } else if (hoursUntil < 12) {
      return `in ${hoursUntil}h ${minutesUntil}m`;
    } else {
      return 'Tomorrow';
    }
  }, [alarmTime, currentHour, currentMinute]);

  if (!alarmTime) {
    return (
      <View className="mb-0 mt-4">
        <View
          className="rounded-3xl p-24"
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
          <View className="items-center justify-center">
            <AlarmClock size={70} color={'#cbd5e1'} strokeWidth={1.5} />
            <ThemedText
              className="text-center mt-6 font-bold"
              style={{
                fontSize: 26,
                color: '#1f2937',
                letterSpacing: 0.5,
                lineHeight: 36,
              }}
            >
              No Alarm Set
            </ThemedText>
            <ThemedText
              className="text-center mt-4 px-6"
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 24,
                letterSpacing: 0.2,
              }}
            >
              Set your alarm.
            </ThemedText>
            {onEdit && (
              <Pressable
                onPress={onEdit}
                className="mt-8 px-8 py-4 rounded-2xl"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#1e40af' : '#2563eb',
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                })}
              >
                <ThemedText
                  className="font-bold"
                  style={{
                    fontSize: 17,
                    color: '#ffffff',
                    letterSpacing: 0.5,
                  }}
                >
                  Set Alarm
                </ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-0 mt-4">
      {/* Card Container */}
      <View
        className="rounded-3xl p-8"
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
        <View className="flex-row items-center justify-between mb-6">
          {/* Alarm Section */}
          <View className="flex-row items-center flex-1">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mr-5"
              style={{
                backgroundColor: '#eff6ff',
                borderWidth: 0,
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <AlarmClock size={32} color={'#2563eb'} strokeWidth={2} />
            </View>

            <View className="flex-1">
              <ThemedText
                className="font-semibold mb-2"
                style={{ color: '#6b7280', fontSize: 14, letterSpacing: 0.3 }}
              >
                {timeUntilAlarm || 'Next Alarm'}
              </ThemedText>
              <ThemedText
                className="font-bold mb-2"
                style={{ fontSize: 32, lineHeight: 36, letterSpacing: -0.5 }}
              >
                {formattedTime}
              </ThemedText>
              <View className="flex-row items-center">
                <View
                  className="px-3 py-1.5 rounded-full flex-row items-center"
                  style={{ backgroundColor: '#f0fdf4' }}
                >
                  <Utensils size={13} color="#16a34a" />
                  <ThemedText
                    className="ml-1.5 font-semibold"
                    style={{ fontSize: 12, color: '#16a34a' }}
                  >
                    {mealTypeLabel}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Action Icons */}
          <View className="flex-col items-center" style={{ gap: 12 }}>
            <Pressable
              className="w-14 h-14 rounded-2xl items-center justify-center relative"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#dbeafe' : '#eff6ff',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <View
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
                style={{ 
                  backgroundColor: isEnabled ? '#22c55e' : '#ef4444',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }}
              />
              <Bell size={24} color={'#2563eb'} strokeWidth={2} />
            </Pressable>
            {onEdit && (
              <Pressable
                onPress={onEdit}
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#dbeafe' : '#eff6ff',
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Edit2 size={24} color={'#2563eb'} strokeWidth={2} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: '#e5e7eb',
            marginBottom: 20,
          }}
        />

        {/* Detailed Info Grid */}
        <View style={{ gap: 16 }}>
          {/* Row 1 */}
          <View className="flex-row justify-between">
            <View className="flex-1 mr-3">
              <View
                className="p-4 rounded-2xl"
                style={{ backgroundColor: '#f9fafb' }}
              >
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#2563eb" strokeWidth={2} />
                  <ThemedText
                    className="ml-2 font-semibold"
                    style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    Frequency
                  </ThemedText>
                </View>
                <ThemedText
                  className="font-bold"
                  style={{ fontSize: 15, color: '#1f2937' }}
                >
                  Daily Repeat
                </ThemedText>
              </View>
            </View>

            <View className="flex-1 ml-3">
              <View
                className="p-4 rounded-2xl"
                style={{ backgroundColor: '#f9fafb' }}
              >
                <View className="flex-row items-center mb-2">
                  <Clock size={16} color="#2563eb" strokeWidth={2} />
                  <ThemedText
                    className="ml-2 font-semibold"
                    style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    Timing
                  </ThemedText>
                </View>
                <ThemedText
                  className="font-bold"
                  style={{ fontSize: 15, color: '#1f2937' }}
                >
                  On Time
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Row 2 - Status */}
          <View
            className="p-4 rounded-2xl flex-row items-center justify-between"
            style={{ 
              backgroundColor: isEnabled ? '#f0fdf4' : '#fef2f2',
              borderWidth: 1,
              borderColor: isEnabled ? '#bbf7d0' : '#fecaca',
            }}
          >
            <View className="flex-row items-center">
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isEnabled ? '#22c55e' : '#ef4444',
                  marginRight: 8,
                }}
              />
              <ThemedText
                className="font-semibold"
                style={{
                  fontSize: 11,
                  color: isEnabled ? '#166534' : '#991b1b',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Status
              </ThemedText>
            </View>
            <ThemedText
              className="font-bold"
              style={{
                fontSize: 15,
                color: isEnabled ? '#15803d' : '#dc2626',
              }}
            >
              {isEnabled ? 'Active & Enabled' : 'Disabled'}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
});
