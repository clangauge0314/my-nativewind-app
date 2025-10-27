import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View } from 'react-native';

interface HistoryHeaderProps {
  selectedDate: string;
  recordCount: number;
}

export const HistoryHeader = React.memo(function HistoryHeader({
  selectedDate,
  recordCount,
}: HistoryHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <ThemedText className="text-xl font-bold">
        {selectedDate 
          ? `History for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
          : 'History'}
      </ThemedText>
      {selectedDate && recordCount > 0 && (
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <ThemedText className="text-xs font-semibold text-blue-900">
            {recordCount} {recordCount === 1 ? 'record' : 'records'}
          </ThemedText>
        </View>
      )}
    </View>
  );
});

