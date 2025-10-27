import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { HistoryHeader } from '@/components/history/HistoryHeader';
import { RecordsList } from '@/components/history/RecordsList';
import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHistoryData } from '@/hooks/use-history-data';
import { useAuthStore } from '@/stores/auth-store';
import { useFocusEffect } from '@react-navigation/native';
import { History } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const insets = useSafeAreaInsets();

  // Use history data hook
  const {
    records,
    loadingRecords,
    datesWithRecords,
    fetchRecordsForDate,
  } = useHistoryData(user?.id);

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  // Load records when date is selected
  useEffect(() => {
    if (selectedDate && user) {
      fetchRecordsForDate(selectedDate);
    }
  }, [selectedDate, user, fetchRecordsForDate]);

  // Handle date selection
  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    setExpandedRecords(new Set()); // Reset expanded records when date changes
  }, []);

  // Toggle record expansion
  const toggleRecordExpansion = useCallback((recordId: string) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  }, []);

  // Marked dates configuration
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Mark all dates with records
    datesWithRecords.forEach((date) => {
      marks[date] = {
        marked: true,
        dotColor: '#10b981',
      };
    });
    
    // Mark today with a blue circle
    marks[today] = {
      ...marks[today],
      selected: true,
      selectedColor: '#3b82f6',
      selectedTextColor: '#ffffff',
    };
    
    // If a different date is selected, mark it with a different color
    if (selectedDate && selectedDate !== today) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#2563eb',
        selectedTextColor: '#ffffff',
      };
      // Keep today marked but with a different style
      marks[today] = {
        ...marks[today],
        marked: true,
        dotColor: '#3b82f6',
        selected: false,
      };
    }
    
    return marks;
  }, [today, selectedDate, datesWithRecords]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  const androidNavBarHeight = Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom : 48) : 0;
  const tabBarHeight = (Platform.OS === 'ios' ? 88 : 68) + androidNavBarHeight;

  if (!user) {
    return (
      <PageLoader isLoading={isLoading} minDuration={500}>
        <ThemedView className="flex-1 justify-center items-center p-8" style={{ paddingBottom: tabBarHeight + 20}}>
          <History size={64} color={'#9ca3af'} />
          <ThemedText className="text-2xl font-bold mt-8 text-center">
            Insulin Injection History
          </ThemedText>
          <ThemedText className="text-base text-center mt-4 opacity-70">
            Log in to view your insulin injection history and track your progress
          </ThemedText>
        </ThemedView>
      </PageLoader>
    );
  }

  return (
    <PageLoader isLoading={isLoading} minDuration={500}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView className="flex-1 px-8" style={{ paddingTop: insets.top + 20, marginTop: 20}}>
          <View className="mb-6">
            <ThemedText 
              className="font-bold"
              style={{ fontSize: 20, lineHeight: 40 }}
            >
              Insulin Injection History
            </ThemedText>
            <ThemedText 
              className="opacity-60"
              style={{ fontSize: 13, marginTop: 2, lineHeight: 24 }}
            >
              Track your insulin injection progress and manage your schedule
            </ThemedText>
          </View>

          {/* Calendar Section */}
          <HistoryCalendar
            today={today}
            selectedDate={selectedDate}
            markedDates={markedDates}
            onDayPress={onDayPress}
          />
          
          {/* History Section */}
          <View className="mb-6">
            <HistoryHeader
              selectedDate={selectedDate}
              recordCount={records.length}
            />

            <RecordsList
              selectedDate={selectedDate}
              records={records}
              loadingRecords={loadingRecords}
              expandedRecords={expandedRecords}
              onToggleRecord={toggleRecordExpansion}
            />
          </View>
        </ThemedView>
      </ScrollView>
    </PageLoader>
  );
}
