import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity, Calculator, Target } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

interface DiabetesSettingsCardProps {
  isf: number;
  icRatio: number;
  targetGlucose: number;
  onEdit: () => void;
}

export const DiabetesSettingsCard = React.memo(function DiabetesSettingsCard({
  isf,
  icRatio,
  targetGlucose,
  onEdit,
}: DiabetesSettingsCardProps) {
  const settings = [
    {
      icon: <Activity size={18} color="#3b82f6" />,
      label: 'ISF (Correction Factor)',
      value: isf,
      unit: 'mg/dL',
      description: '1 unit drops BG by',
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      icon: <Calculator size={18} color="#8b5cf6" />,
      label: 'I:C Ratio',
      value: `1:${icRatio}`,
      unit: 'g',
      description: '1 unit covers',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
    },
    {
      icon: <Target size={18} color="#06b6d4" />,
      label: 'Target Glucose',
      value: targetGlucose,
      unit: 'mg/dL',
      description: 'Aiming for',
      color: '#06b6d4',
      bgColor: '#ecfeff',
    },
  ];

  return (
    <ThemedView className="mb-6">
      <View className="flex-row items-center justify-between mb-3 px-1">
        <ThemedText className="font-bold" style={{ fontSize: 18 }}>
          Diabetes Settings
        </ThemedText>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ThemedText
            className="font-semibold"
            style={{
              fontSize: 14,
              color: '#3b82f6',
            }}
          >
            Edit
          </ThemedText>
        </Pressable>
      </View>

      <View style={{ gap: 12 }}>
        {settings.map((setting, index) => (
          <View
            key={index}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: setting.bgColor,
              borderWidth: 1,
              borderColor: setting.color + '20',
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  {setting.icon}
                  <ThemedText
                    className="ml-2 font-semibold"
                    style={{
                      fontSize: 13,
                      color: setting.color,
                    }}
                  >
                    {setting.label}
                  </ThemedText>
                </View>
                
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: setting.color,
                    opacity: 0.7,
                  }}
                >
                  {setting.description}
                </ThemedText>
              </View>

              <View className="items-end">
                <ThemedText
                  className="font-bold"
                  style={{
                    fontSize: 28,
                    color: setting.color,
                    lineHeight: 32,
                  }}
                >
                  {setting.value}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: setting.color,
                    opacity: 0.7,
                  }}
                >
                  {setting.unit}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
});

