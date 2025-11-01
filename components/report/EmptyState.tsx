import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BarChart3 } from 'lucide-react-native';
import React from 'react';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = React.memo(function EmptyState({
  message = 'No data to display.',
}: EmptyStateProps) {
  return (
    <ThemedView className="bg-white rounded-2xl border border-gray-200 p-8 items-center justify-center">
      <BarChart3 size={48} color="#9ca3af" />
      <ThemedText className="text-center text-gray-500 mt-4" style={{ fontSize: 14 }}>
        {message}
      </ThemedText>
      <ThemedText className="text-center text-gray-400 mt-2" style={{ fontSize: 12 }}>
        Charts will appear here once you record data.
      </ThemedText>
    </ThemedView>
  );
});

