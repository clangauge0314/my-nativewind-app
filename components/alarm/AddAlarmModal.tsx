import { ThemedText } from '@/components/themed-text';
import { AlarmClock, Calendar, Clock, Utensils, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

interface AddAlarmModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (alarm: AlarmData) => void;
}

export interface AlarmData {
  alarmTime: string; // "HH:MM:SS"
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  alarmLabel: string;
  isEnabled: boolean;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#fbbf24' },
  { value: 'lunch', label: 'Lunch', icon: '☀️', color: '#60a5fa' },
  { value: 'dinner', label: 'Dinner', icon: '🌙', color: '#f472b6' },
  { value: 'snack', label: 'Snack', icon: '🍎', color: '#818cf8' },
  { value: 'other', label: 'Other', icon: '⏰', color: '#9ca3af' },
];

export const AddAlarmModal = React.memo(function AddAlarmModal({
  visible,
  onClose,
  onSave,
}: AddAlarmModalProps) {
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedMealType, setSelectedMealType] = useState<AlarmData['mealType']>('breakfast');
  const [alarmLabel, setAlarmLabel] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleSave = () => {
    const alarm: AlarmData = {
      alarmTime: `${selectedHour}:${selectedMinute}:00`,
      mealType: selectedMealType,
      alarmLabel: alarmLabel || MEAL_TYPES.find(m => m.value === selectedMealType)?.label || '',
      isEnabled,
    };
    onSave(alarm);
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setSelectedHour('08');
    setSelectedMinute('00');
    setSelectedMealType('breakfast');
    setAlarmLabel('');
    setIsEnabled(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="rounded-t-3xl"
          style={{
            backgroundColor: '#ffffff',
            maxHeight: '90%',
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <View className="flex-row items-center">
              <AlarmClock size={24} color="#2563eb" strokeWidth={2} />
              <ThemedText
                className="ml-3 font-bold"
                style={{ fontSize: 20 }}
              >
                Add New Alarm
              </ThemedText>
            </View>
            <Pressable
              onPress={handleClose}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#f3f4f6' : 'transparent',
              })}
            >
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          <ScrollView
            className="p-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Time Picker */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Clock size={18} color="#2563eb" strokeWidth={2} />
                <ThemedText
                  className="ml-2 font-semibold"
                  style={{ fontSize: 14, color: '#6b7280' }}
                >
                  SELECT TIME
                </ThemedText>
              </View>

              <View className="flex-row items-center justify-center p-6 bg-blue-50 rounded-2xl">
                {/* Hour Selector */}
                <ScrollView
                  className="flex-1 max-h-40"
                  showsVerticalScrollIndicator={false}
                >
                  {hours.map((hour) => (
                    <Pressable
                      key={hour}
                      onPress={() => setSelectedHour(hour)}
                      className="py-3 items-center"
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <ThemedText
                        className="font-bold"
                        style={{
                          fontSize: selectedHour === hour ? 32 : 20,
                          color: selectedHour === hour ? '#2563eb' : '#9ca3af',
                        }}
                      >
                        {hour}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>

                <ThemedText
                  className="font-bold mx-4"
                  style={{ fontSize: 32, color: '#2563eb' }}
                >
                  :
                </ThemedText>

                {/* Minute Selector */}
                <ScrollView
                  className="flex-1 max-h-40"
                  showsVerticalScrollIndicator={false}
                >
                  {minutes.filter((_, i) => i % 5 === 0).map((minute) => (
                    <Pressable
                      key={minute}
                      onPress={() => setSelectedMinute(minute)}
                      className="py-3 items-center"
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <ThemedText
                        className="font-bold"
                        style={{
                          fontSize: selectedMinute === minute ? 32 : 20,
                          color: selectedMinute === minute ? '#2563eb' : '#9ca3af',
                        }}
                      >
                        {minute}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Selected Time Display */}
              <View className="items-center mt-4">
                <ThemedText
                  className="font-bold"
                  style={{ fontSize: 48, color: '#1f2937', letterSpacing: -1 }}
                >
                  {selectedHour}:{selectedMinute}
                </ThemedText>
              </View>
            </View>

            {/* Meal Type Selector */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Utensils size={18} color="#2563eb" strokeWidth={2} />
                <ThemedText
                  className="ml-2 font-semibold"
                  style={{ fontSize: 14, color: '#6b7280' }}
                >
                  MEAL TYPE
                </ThemedText>
              </View>

              <View style={{ gap: 12 }}>
                {MEAL_TYPES.map((meal) => (
                  <Pressable
                    key={meal.value}
                    onPress={() => setSelectedMealType(meal.value as any)}
                    className="p-4 rounded-2xl flex-row items-center justify-between"
                    style={{
                      backgroundColor: selectedMealType === meal.value ? '#eff6ff' : '#f9fafb',
                      borderWidth: 2,
                      borderColor: selectedMealType === meal.value ? '#2563eb' : 'transparent',
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: meal.color + '20' }}
                      >
                        <ThemedText style={{ fontSize: 24 }}>{meal.icon}</ThemedText>
                      </View>
                      <ThemedText
                        className="font-semibold"
                        style={{
                          fontSize: 16,
                          color: selectedMealType === meal.value ? '#2563eb' : '#1f2937',
                        }}
                      >
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
                ))}
              </View>
            </View>

            {/* Status Toggle */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Calendar size={18} color="#2563eb" strokeWidth={2} />
                <ThemedText
                  className="ml-2 font-semibold"
                  style={{ fontSize: 14, color: '#6b7280' }}
                >
                  ALARM STATUS
                </ThemedText>
              </View>

              <Pressable
                onPress={() => setIsEnabled(!isEnabled)}
                className="p-4 rounded-2xl flex-row items-center justify-between"
                style={{
                  backgroundColor: isEnabled ? '#f0fdf4' : '#fef2f2',
                  borderWidth: 2,
                  borderColor: isEnabled ? '#22c55e' : '#ef4444',
                }}
              >
                <View className="flex-row items-center">
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: isEnabled ? '#22c55e' : '#ef4444',
                      marginRight: 12,
                    }}
                  />
                  <ThemedText
                    className="font-semibold"
                    style={{
                      fontSize: 16,
                      color: isEnabled ? '#15803d' : '#dc2626',
                    }}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </ThemedText>
                </View>
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: isEnabled ? '#16a34a' : '#b91c1c',
                  }}
                >
                  Tap to {isEnabled ? 'disable' : 'enable'}
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 border-t border-gray-200" style={{ gap: 12 }}>
            <Pressable
              onPress={handleSave}
              className="py-4 rounded-2xl items-center"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1e40af' : '#2563eb',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <ThemedText
                className="font-bold"
                style={{ fontSize: 16, color: '#ffffff' }}
              >
                Save Alarm
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleClose}
              className="py-4 rounded-2xl items-center"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#e5e7eb' : '#f3f4f6',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <ThemedText
                className="font-semibold"
                style={{ fontSize: 16, color: '#6b7280' }}
              >
                Cancel
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

