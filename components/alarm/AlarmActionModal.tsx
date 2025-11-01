import { ThemedText } from '@/components/themed-text';
import { Syringe, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, View } from 'react-native';

interface AlarmActionModalProps {
  visible: boolean;
  alarmLabel?: string;
  mealType?: string;
  onYes: () => void;
  onNo: () => void;
}

export function AlarmActionModal({
  visible,
  alarmLabel = 'Meal',
  mealType = 'breakfast',
  onYes,
  onNo,
}: AlarmActionModalProps) {
  const getMealEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      breakfast: '🌅',
      lunch: '🍱',
      dinner: '🌙',
      snack: '🍎',
      other: '🔔',
    };
    return emojis[type] || '🔔';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onNo}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      >
        <View
          className="mx-6 rounded-3xl p-8"
          style={{
            backgroundColor: '#ffffff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
            minWidth: 320,
          }}
        >
          {/* 닫기 버튼 */}
          <Pressable
            onPress={onNo}
            className="absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <X size={18} color="#6b7280" strokeWidth={2} />
          </Pressable>

          {/* 아이콘 */}
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: '#dbeafe' }}
            >
              <ThemedText style={{ fontSize: 48 }}>
                {getMealEmoji(mealType)}
              </ThemedText>
            </View>
          </View>

          {/* 제목 */}
          <ThemedText
            className="text-center font-bold mb-3"
            style={{
              fontSize: 24,
              color: '#1f2937',
              lineHeight: 32,
            }}
          >
            {alarmLabel} Time!
          </ThemedText>

          {/* 메시지 */}
          <View className="items-center mb-8">
            <View className="flex-row items-center mb-2">
              <Syringe size={20} color="#2563eb" strokeWidth={2} />
              <ThemedText
                className="ml-2 font-semibold"
                style={{
                  fontSize: 18,
                  color: '#2563eb',
                  lineHeight: 24,
                }}
              >
                Take Insulin Now?
              </ThemedText>
            </View>
            <ThemedText
              className="text-center mt-1"
              style={{
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 20,
              }}
            >
              Select Yes to record your blood sugar
            </ThemedText>
          </View>

          <View style={{ gap: 12 }}>
            <Pressable
              onPress={onYes}
              className="py-4 rounded-2xl"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#eff6ff' : '#ffffff',
                borderWidth: 2,
                borderColor: '#2563eb',
                transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              <View className="flex-row items-center justify-center">
                <Syringe size={20} color="#2563eb" strokeWidth={2.5} />
                <ThemedText
                  className="ml-2 text-center font-bold"
                  style={{
                    fontSize: 17,
                    color: '#2563eb',
                    letterSpacing: 0.5,
                  }}
                >
                  Yes, Record Now
                </ThemedText>
              </View>
            </Pressable>

            <Pressable
              onPress={onNo}
              className="py-4 rounded-2xl"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#f3f4f6' : '#ffffff',
                borderWidth: 2,
                borderColor: '#d1d5db',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <ThemedText
                className="text-center font-bold"
                style={{
                  fontSize: 17,
                  color: '#4b5563',
                  letterSpacing: 0.5,
                }}
              >
                Not Now
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

