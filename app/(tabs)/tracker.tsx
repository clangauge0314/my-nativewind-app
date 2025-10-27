import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HealthChart } from '@/components/tracker/health-chart';
import { TimeRangeSelector, type TimeRange } from '@/components/tracker/time-range-selector';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrackerScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('hours');
  const insets = useSafeAreaInsets();

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

  return (
    <PageLoader isLoading={isLoading} minDuration={500}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        <ThemedView className="flex-1 pt-6 pb-4">
          {/* Title */}
          <ThemedText type="title" className="text-center mb-1">Health Tracker</ThemedText>
          <ThemedText className="text-center mb-6 opacity-70 text-sm">
            Monitor your glucose & insulin levels
          </ThemedText>
          
          {/* Time Range Selector */}
          <TimeRangeSelector 
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />

          {/* Glucose Chart */}
          <HealthChart timeRange={selectedRange} type="glucose" />

          {/* Insulin Chart */}
          <HealthChart timeRange={selectedRange} type="insulin" />

          {/* Info Card */}
          <ThemedView 
            className="mx-4 p-4 rounded-xl"
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <ThemedText className="text-xs text-center opacity-60">
              💡 Tip: Switch between time ranges to view detailed trends
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </PageLoader>
  );
}


