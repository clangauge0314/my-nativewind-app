import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View } from 'react-native';
import { Calendar, DateData, MarkedDates } from 'react-native-calendars';

interface HistoryCalendarProps {
  today: string;
  selectedDate: string;
  markedDates: MarkedDates;
  onDayPress: (day: DateData) => void;
}

export const HistoryCalendar = React.memo(function HistoryCalendar({
  today,
  selectedDate,
  markedDates,
  onDayPress,
}: HistoryCalendarProps) {
  return (
    <View 
      className="mb-6 bg-white rounded-2xl border border-gray-200 overflow-hidden" 
      style={{
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Calendar
        current={today}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#64748b',
          selectedDayBackgroundColor: '#3b82f6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3b82f6',
          dayTextColor: '#1e293b',
          textDisabledColor: '#cbd5e1',
          dotColor: '#3b82f6',
          selectedDotColor: '#ffffff',
          arrowColor: '#3b82f6',
          monthTextColor: '#1e293b',
          indicatorColor: '#3b82f6',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
        }}
        style={{
          borderRadius: 16,
          padding: 10,
        }}
        hideExtraDays={true}
        enableSwipeMonths={true}
      />
      {selectedDate && (
        <View className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <ThemedText className="text-sm text-blue-900 font-semibold">
            Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </ThemedText>
        </View>
      )}
    </View>
  );
});

