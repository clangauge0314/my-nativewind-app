import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { View } from 'react-native';

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
}

export const SummaryCard = React.memo(function SummaryCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  color = '#3b82f6',
  backgroundColor = '#eff6ff',
}: SummaryCardProps) {
  return (
    <ThemedView
      className="flex-1 rounded-xl p-4 min-w-[45%]"
      style={{
        backgroundColor,
        borderWidth: 1,
        borderColor: color + '20',
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="text-xs font-semibold" style={{ color }}>
          {title}
        </ThemedText>
        {icon && <View>{icon}</View>}
      </View>
      
      <View className="flex-row items-end">
        <ThemedText className="text-2xl font-bold" style={{ color, lineHeight: 32 }}>
          {value}
        </ThemedText>
        {unit && (
          <ThemedText className="ml-1 mb-1 text-sm font-semibold" style={{ color }}>
            {unit}
          </ThemedText>
        )}
      </View>
      
      {subtitle && (
        <ThemedText className="text-xs mt-1" style={{ color, opacity: 0.7 }}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );
});

