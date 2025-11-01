import { PageLoader } from '@/components/page-loader';
import { EmptyState } from '@/components/report/EmptyState';
import { OneDayReport } from '@/components/report/OneDayReport';
import { PeriodReport } from '@/components/report/PeriodReport';
import { YearReport } from '@/components/report/YearReport';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useReportData } from '@/hooks/use-report-data';
import { useAuthStore } from '@/stores/auth-store';
import { ReportTimeRange } from '@/types/report';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart3 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const timeRangeOptions: { value: ReportTimeRange; label: string; description: string }[] = [
  { value: '1day', label: '1 Day', description: 'Today' },
  { value: '1week', label: '1 Week', description: 'Last 7 days' },
  { value: '1month', label: '1 Month', description: 'Last month' },
  { value: '3months', label: '3 Months', description: 'Last 3 months' },
  { value: '1year', label: '1 Year', description: 'Last year' },
];

export default function ReportScreen() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<ReportTimeRange>('1week');
  const insets = useSafeAreaInsets();

  // 리포트 데이터 가져오기
  const { records, loading: dataLoading, refetch } = useReportData(user?.id, selectedRange);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <PageLoader isLoading={isLoading} minDuration={500}>
        <ThemedView className="flex-1 justify-center items-center p-8" style={{ paddingBottom: tabBarHeight + 20 }}>
          <BarChart3 size={64} color={'#9ca3af'} />
          <ThemedText className="text-2xl font-bold mt-8 text-center">Health Report</ThemedText>
          <ThemedText className="text-base text-center mt-4 opacity-70">
            Log in to view your health data reports
          </ThemedText>
        </ThemedView>
      </PageLoader>
    );
  }

  // 리포트 컨텐츠 렌더링
  const renderReportContent = () => {
    if (dataLoading && !refreshing) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ThemedText className="text-gray-500">Loading data...</ThemedText>
        </View>
      );
    }

    if (records.length === 0) {
      return <EmptyState message={`No data recorded for ${timeRangeOptions.find(o => o.value === selectedRange)?.label}.`} />;
    }

    switch (selectedRange) {
      case '1day':
        return <OneDayReport records={records} />;
      case '1year':
        return <YearReport records={records} />;
      default:
        return <PeriodReport records={records} timeRange={selectedRange} />;
    }
  };

  return (
    <PageLoader isLoading={isLoading} minDuration={500}>
      <ThemedView className="flex-1" style={{ paddingTop: insets.top + 20 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View className="px-8 mb-6">
            <ThemedText className="font-bold" style={{ fontSize: 20, lineHeight: 36 }}>
              Health Report
            </ThemedText>
            <ThemedText className="opacity-60 mt-1" style={{ fontSize: 13, lineHeight: 20 }}>
              Visualize and analyze your health data
            </ThemedText>
          </View>

          {/* Time Range Selector */}
          <View className="px-4 mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
            >
              {timeRangeOptions.map((option) => {
                const isSelected = selectedRange === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedRange(option.value)}
                    className="py-3 px-5 rounded-xl"
                    style={{
                      backgroundColor: isSelected ? '#3b82f6' : '#f3f4f6',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                      shadowColor: isSelected ? '#3b82f6' : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.2 : 0,
                      shadowRadius: 4,
                      elevation: isSelected ? 3 : 0,
                      minWidth: 80,
                    }}
                  >
                    <ThemedText
                      className="text-center font-bold mb-1"
                      style={{
                        color: isSelected ? '#ffffff' : '#4b5563',
                        fontSize: 15,
                      }}
                    >
                      {option.label}
                    </ThemedText>
                    <ThemedText
                      className="text-center"
                      style={{
                        color: isSelected ? '#ffffff' : '#9ca3af',
                        fontSize: 10,
                        opacity: 0.8,
                      }}
                    >
                      {option.description}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Report Content */}
          <View className="px-4">{renderReportContent()}</View>
        </ScrollView>
      </ThemedView>
    </PageLoader>
  );
}
