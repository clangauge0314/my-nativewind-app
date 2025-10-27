import { ThemedText } from '@/components/themed-text';
import { InsulinPredictionRecord } from '@/types/health-record';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { RecordCard } from './RecordCard';

interface RecordsListProps {
  selectedDate: string;
  records: InsulinPredictionRecord[];
  loadingRecords: boolean;
  expandedRecords: Set<string>;
  onToggleRecord: (recordId: string) => void;
}

export const RecordsList = React.memo(function RecordsList({
  selectedDate,
  records,
  loadingRecords,
  expandedRecords,
  onToggleRecord,
}: RecordsListProps) {
  if (loadingRecords) {
    return (
      <View 
        className="p-8 bg-white rounded-2xl border border-gray-200 items-center justify-center"
        style={{
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <ThemedText className="text-gray-600 mt-4">Loading records...</ThemedText>
      </View>
    );
  }

  if (!selectedDate) {
    return (
      <View 
        className="p-6 bg-white rounded-2xl border border-gray-200"
        style={{
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="p-4 bg-gray-50 rounded-lg">
          <ThemedText className="text-center text-gray-600">
            Select a date to view health history
          </ThemedText>
        </View>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View 
        className="p-6 bg-white rounded-2xl border border-gray-200"
        style={{
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="p-4 bg-gray-50 rounded-lg">
          <ThemedText className="text-center text-gray-600">
            No health records found for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          isExpanded={expandedRecords.has(record.id)}
          onToggle={() => onToggleRecord(record.id)}
        />
      ))}
    </View>
  );
});

