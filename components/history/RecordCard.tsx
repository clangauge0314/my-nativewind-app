import { ThemedText } from '@/components/themed-text';
import { InsulinPredictionRecord } from '@/types/health-record';
import { ChevronDown, ChevronUp, Clock, Droplet } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface RecordCardProps {
  record: InsulinPredictionRecord;
  isExpanded: boolean;
  onToggle: () => void;
}

export const RecordCard = React.memo(function RecordCard({
  record,
  isExpanded,
  onToggle,
}: RecordCardProps) {
  return (
    <View
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      style={{
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Header - Touchable */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-500 rounded-full p-2 mr-3">
                <Droplet size={18} color="#ffffff" />
              </View>
              <View className="flex-1">
                <ThemedText className="font-bold text-blue-900" style={{ fontSize: 16 }}>
                  {record.meal_type.charAt(0).toUpperCase() + record.meal_type.slice(1)}
                </ThemedText>
                <View className="flex-row items-center mt-1">
                  <Clock size={12} color="#64748b" />
                  <ThemedText className="text-xs text-gray-600 ml-1">
                    {new Date(record.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <View className={`px-3 py-1 rounded-full ${record.insulin_injected ? 'bg-green-100' : 'bg-red-100'}`}>
                <ThemedText className={`text-xs font-semibold ${record.insulin_injected ? 'text-green-900' : 'text-red-900'}`}>
                  {record.insulin_injected ? 'Injected' : 'Not Injected'}
                </ThemedText>
              </View>
              <View className="bg-blue-200 rounded-full p-1">
                {isExpanded ? (
                  <ChevronUp size={16} color="#1e40af" />
                ) : (
                  <ChevronDown size={16} color="#1e40af" />
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Main Info - Collapsible */}
      {isExpanded && (
        <View className="px-5 py-4">
          {/* Total Insulin - Highlighted */}
          <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
            <ThemedText className="text-xs text-blue-600 font-semibold mb-1">
              TOTAL INSULIN DOSE
            </ThemedText>
            <ThemedText className="text-3xl font-bold text-blue-900">
              {record.total_insulin} <ThemedText className="text-lg text-blue-600">units</ThemedText>
            </ThemedText>
          </View>

          {/* Grid Info */}
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {/* Blood Glucose */}
            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
              <ThemedText className="text-xs text-gray-500 mb-1">Blood Glucose</ThemedText>
              <ThemedText className="text-lg font-bold text-gray-900">
                {record.current_glucose} <ThemedText className="text-xs text-gray-500">mg/dL</ThemedText>
              </ThemedText>
            </View>

            {/* Carbohydrates */}
            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
              <ThemedText className="text-xs text-gray-500 mb-1">Carbohydrates</ThemedText>
              <ThemedText className="text-lg font-bold text-gray-900">
                {record.carbohydrates} <ThemedText className="text-xs text-gray-500">g</ThemedText>
              </ThemedText>
            </View>

            {/* Target Glucose */}
            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
              <ThemedText className="text-xs text-gray-500 mb-1">Target Glucose</ThemedText>
              <ThemedText className="text-lg font-bold text-gray-900">
                {record.target_glucose} <ThemedText className="text-xs text-gray-500">mg/dL</ThemedText>
              </ThemedText>
            </View>

            {/* Timer Duration */}
            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
              <ThemedText className="text-xs text-gray-500 mb-1">Timer Duration</ThemedText>
              <ThemedText className="text-lg font-bold text-gray-900">
                {record.timer_duration_minutes} <ThemedText className="text-xs text-gray-500">min</ThemedText>
              </ThemedText>
            </View>
          </View>

          {/* Calculation Breakdown */}
          <View className="mt-4 pt-4 border-t border-gray-200">
            <ThemedText className="text-xs text-gray-500 font-semibold mb-3">CALCULATION BREAKDOWN</ThemedText>
            <View style={{ gap: 6 }}>
              <View className="flex-row justify-between items-center">
                <ThemedText className="text-sm text-gray-600">Carb Insulin</ThemedText>
                <ThemedText className="text-sm font-semibold text-gray-900">{record.carb_insulin}u</ThemedText>
              </View>
              <View className="flex-row justify-between items-center">
                <ThemedText className="text-sm text-gray-600">Correction Insulin</ThemedText>
                <ThemedText className="text-sm font-semibold text-gray-900">{record.correction_insulin}u</ThemedText>
              </View>
              <View className="h-px bg-gray-200 my-1" />
              <View className="flex-row justify-between items-center">
                <ThemedText className="text-sm font-bold text-gray-900">Total</ThemedText>
                <ThemedText className="text-sm font-bold text-blue-600">{record.total_insulin}u</ThemedText>
              </View>
            </View>
          </View>

          {/* Notes */}
          {record.notes && (
            <View className="mt-4 pt-4 border-t border-gray-200">
              <ThemedText className="text-xs text-gray-500 font-semibold mb-2">NOTES</ThemedText>
              <ThemedText className="text-sm text-gray-700">{record.notes}</ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

