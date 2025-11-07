import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { HistoryHeader } from '@/components/history/HistoryHeader';
import { RecordsList } from '@/components/history/RecordsList';
import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHistoryData } from '@/hooks/use-history-data';
import { useAuthStore } from '@/stores/auth-store';
import { getTodayInTimezone } from '@/utils/timezone';
import { useFocusEffect } from '@react-navigation/native';
import { History } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const insets = useSafeAreaInsets();

  const today = useMemo(() => {
    // Use Thailand timezone (UTC+7)
    return getTodayInTimezone('Asia/Bangkok');
  }, []);

  const [selectedDate, setSelectedDate] = useState(today);

  const {
    records,
    loadingRecords,
    datesWithRecords,
    fetchRecordsForDate,
  } = useHistoryData(user?.uid);

  // 첫 로드 시 오늘 날짜의 레코드 가져오기
  useEffect(() => {
    if (user?.uid && today) {
      fetchRecordsForDate(today);
    }
  }, [user?.uid, today, fetchRecordsForDate]);

  // 선택된 날짜가 변경될 때마다 레코드 가져오기
  useEffect(() => {
    if (selectedDate && user?.uid) {
      fetchRecordsForDate(selectedDate);
    }
  }, [selectedDate, user?.uid, fetchRecordsForDate]);

  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    setExpandedRecords(new Set()); 
  }, []);

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

  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // 날짜별 레코드 개수에 따라 점 표시
    datesWithRecords.forEach((count, date) => {
      // 개수에 따라 점의 개수 결정 (최대 3개)
      const dotCount = Math.min(count, 3);
      const dots = Array.from({ length: dotCount }, (_, i) => ({
        color: '#10b981',
        selectedColor: '#ffffff',
      }));
      
      marks[date] = {
        marked: true,
        dots: dots,
      };
    });
    
    // 오늘 날짜 선택 표시
    marks[today] = {
      ...marks[today],
      selected: true,
      selectedColor: '#3b82f6',
      selectedTextColor: '#ffffff',
    };
    
    // 선택된 날짜 표시
    if (selectedDate && selectedDate !== today) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#2563eb',
        selectedTextColor: '#ffffff',
      };
      marks[today] = {
        ...marks[today],
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

  const tabBarHeight = insets.bottom + 68;

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

          <HistoryCalendar
            today={today}
            selectedDate={selectedDate}
            markedDates={markedDates}
            onDayPress={onDayPress}
          />
          
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
