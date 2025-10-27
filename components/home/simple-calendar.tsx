import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View } from 'react-native';

interface SimpleCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export function SimpleCalendar({ onDateSelect, selectedDate }: SimpleCalendarProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handleDayPress = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const day = prevMonth.getDate() - i;
    calendarDays.push(
      <View key={`prev-${day}`} className="w-10 h-10 items-center justify-center mx-1">
        <ThemedText className="text-sm text-gray-300">{day}</ThemedText>
      </View>
    );
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = day === today.getDate();
    const isSelected = selectedDate === dateStr;
    
    calendarDays.push(
      <View
        key={`day-${day}`}
        className={`w-10 h-10 items-center justify-center rounded-lg mx-1 ${
          isSelected ? 'bg-blue-500' : isToday ? 'bg-blue-100' : ''
        }`}
        onTouchEnd={() => handleDayPress(day)}
      >
        <ThemedText
          className={`text-sm font-medium ${
            isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          {day}
        </ThemedText>
      </View>
    );
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push(
      <View key={`next-${day}`} className="w-10 h-10 items-center justify-center mx-1">
        <ThemedText className="text-sm text-gray-300">{day}</ThemedText>
      </View>
    );
  }
  
  return (
    <View>
      {/* Day Names */}
      <View className="flex-row justify-between mb-2">
        {dayNames.map((day, index) => (
          <View key={index} className="w-10 items-center">
            <ThemedText className={`text-xs font-bold ${index === 0 || index === 6 ? 'text-red-500' : 'text-gray-500'}`}>
              {day}
            </ThemedText>
          </View>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {calendarDays}
      </View>
    </View>
  );
}
