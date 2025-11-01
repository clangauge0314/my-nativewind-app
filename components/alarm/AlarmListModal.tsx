import { ThemedText } from '@/components/themed-text';
import type { Alarm } from '@/types/alarm';
import { DAY_LABELS, MEAL_TYPE_INFO } from '@/types/alarm';
import { AlarmClock, Edit2, List, Trash2, X } from 'lucide-react-native';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';

interface AlarmListModalProps {
  visible: boolean;
  onClose: () => void;
  alarms: Alarm[];
  loading: boolean;
  onToggle: (alarmId: string, isEnabled: boolean) => Promise<void>;
  onEdit: (alarm: Alarm) => void;
  onDelete: (alarmId: string) => Promise<void>;
}

export const AlarmListModal = React.memo(function AlarmListModal({
  visible,
  onClose,
  alarms,
  loading,
  onToggle,
  onEdit,
  onDelete,
}: AlarmListModalProps) {
  const handleDelete = (alarm: Alarm) => {
    Alert.alert(
      'Delete Alarm',
      `Are you sure you want to delete the ${alarm.alarmLabel} alarm?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(alarm.id),
        },
      ]
    );
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
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
              <List size={24} color="#16a34a" strokeWidth={2} />
              <ThemedText className="ml-3 font-bold" style={{ fontSize: 20 }}>
                My Alarms
              </ThemedText>
              {alarms.length > 0 && (
                <View
                  className="ml-3 px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <ThemedText
                    className="font-semibold"
                    style={{ fontSize: 12, color: '#16a34a' }}
                  >
                    {alarms.length}
                  </ThemedText>
                </View>
              )}
            </View>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#f3f4f6' : 'transparent',
              })}
            >
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {loading ? (
              <View className="items-center justify-center py-12">
                <ThemedText style={{ fontSize: 14, color: '#6b7280' }}>
                  Loading alarms...
                </ThemedText>
              </View>
            ) : alarms.length === 0 ? (
              <View className="items-center justify-center py-12">
                <AlarmClock size={64} color="#cbd5e1" strokeWidth={1.5} />
                <ThemedText
                  className="text-center mt-4 font-semibold"
                  style={{ fontSize: 18, color: '#1f2937' }}
                >
                  No Alarms Yet
                </ThemedText>
                <ThemedText
                  className="text-center mt-2"
                  style={{ fontSize: 14, color: '#6b7280' }}
                >
                  Add your first alarm to get started
                </ThemedText>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {alarms.map((alarm) => {
                  const mealInfo = MEAL_TYPE_INFO[alarm.mealType];
                  return (
                    <View
                      key={alarm.id}
                      className="rounded-2xl p-4"
                      style={{
                        backgroundColor: alarm.isEnabled ? '#ffffff' : '#f9fafb',
                        borderWidth: 2,
                        borderColor: alarm.isEnabled ? '#16a34a' : '#e5e7eb',
                      }}
                    >
                      {/* Header Row */}
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                          <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: mealInfo.color + '20' }}
                          >
                            <ThemedText style={{ fontSize: 24 }}>
                              {mealInfo.icon}
                            </ThemedText>
                          </View>
                          <View className="flex-1">
                            <ThemedText
                              className="font-bold mb-1"
                              style={{
                                fontSize: 28,
                                color: alarm.isEnabled ? '#1f2937' : '#9ca3af',
                              }}
                            >
                              {formatTime(alarm.alarmTime)}
                            </ThemedText>
                            <ThemedText
                              className="font-semibold"
                              style={{
                                fontSize: 13,
                                color: alarm.isEnabled ? '#6b7280' : '#9ca3af',
                              }}
                            >
                              {alarm.alarmLabel}
                            </ThemedText>
                          </View>
                        </View>

                        {/* Toggle Switch */}
                        <Pressable
                          onPress={() => onToggle(alarm.id, !alarm.isEnabled)}
                          className="ml-2"
                        >
                          <View
                            className="rounded-full items-center justify-center"
                            style={{
                              width: 56,
                              height: 32,
                              backgroundColor: alarm.isEnabled ? '#16a34a' : '#d1d5db',
                            }}
                          >
                            <View
                              className="absolute rounded-full"
                              style={{
                                width: 26,
                                height: 26,
                                backgroundColor: '#ffffff',
                                left: alarm.isEnabled ? 26 : 4,
                              }}
                            />
                          </View>
                        </Pressable>
                      </View>

                      {/* Repeat Days */}
                      {alarm.repeatDays && (
                        <View className="flex-row flex-wrap mb-3" style={{ gap: 6 }}>
                          {alarm.repeatDays.map((day) => (
                            <View
                              key={day}
                              className="px-2 py-1 rounded-md"
                              style={{
                                backgroundColor: alarm.isEnabled
                                  ? '#dcfce7'
                                  : '#f3f4f6',
                              }}
                            >
                              <ThemedText
                                className="font-semibold"
                                style={{
                                  fontSize: 11,
                                  color: alarm.isEnabled ? '#16a34a' : '#9ca3af',
                                }}
                              >
                                {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View className="flex-row" style={{ gap: 8 }}>
                        <Pressable
                          onPress={() => onEdit(alarm)}
                          className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                          style={({ pressed }) => ({
                            backgroundColor: pressed ? '#dbeafe' : '#eff6ff',
                          })}
                        >
                          <Edit2 size={16} color="#2563eb" strokeWidth={2} />
                          <ThemedText
                            className="ml-2 font-semibold"
                            style={{ fontSize: 13, color: '#2563eb' }}
                          >
                            Edit
                          </ThemedText>
                        </Pressable>

                        <Pressable
                          onPress={() => handleDelete(alarm)}
                          className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                          style={({ pressed }) => ({
                            backgroundColor: pressed ? '#fecaca' : '#fee2e2',
                          })}
                        >
                          <Trash2 size={16} color="#dc2626" strokeWidth={2} />
                          <ThemedText
                            className="ml-2 font-semibold"
                            style={{ fontSize: 13, color: '#dc2626' }}
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

          {/* Footer */}
          <View className="p-6 border-t border-gray-200">
            <Pressable
              onPress={onClose}
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
                Close
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

