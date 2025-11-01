import { ThemedText } from '@/components/themed-text';
import { DailyAggregate, TimeRange } from '@/types/tracker';
import { Droplet, Syringe } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface InsulinChartProps {
  dailyAggregates: DailyAggregate[];
  timeRange: TimeRange;
  loading: boolean;
}

interface ChartData { x: string; y: number; label: string; date: string; }

export const InsulinChart = React.memo(function InsulinChart({ 
  dailyAggregates, 
  timeRange, 
  loading 
}: InsulinChartProps) {
  const screenWidth = Dimensions.get('window').width - 32; // Account for margins

  const chartData = useMemo(() => {
    if (!dailyAggregates || dailyAggregates.length === 0) return [];

    // Group data based on time range
    let groupedData: { [key: string]: DailyAggregate[] } = {};
    
    dailyAggregates.forEach(day => {
      const date = new Date(day.date);
      let key: string;

      switch (timeRange) {
        case 'day':
          // Show last 7 days
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'week':
          // Group by week
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Week ${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        case 'month':
          // Group by month
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        case 'year':
          // Group by year (show months)
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        default:
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(day);
    });

    // Calculate averages for each group
    return Object.entries(groupedData).map(([key, days]) => {
      const totalInsulin = days.reduce((sum, day) => sum + day.totalInsulin, 0);
      const avgGlucose = days.reduce((sum, day) => sum + day.avgGlucose, 0) / days.length;
      const totalInjections = days.reduce((sum, day) => sum + day.injectionCount, 0);

      return {
        x: key,
        y: totalInsulin,
        label: `${totalInsulin.toFixed(1)}u`,
        date: days[0].date,
        avgGlucose: Math.round(avgGlucose),
        totalInjections,
      };
    }).slice(-10); // Show last 10 data points
  }, [dailyAggregates, timeRange]);

  const glucoseData = useMemo(() => {
    if (!dailyAggregates || dailyAggregates.length === 0) return [];

    let groupedData: { [key: string]: DailyAggregate[] } = {};
    
    dailyAggregates.forEach(day => {
      const date = new Date(day.date);
      let key: string;

      switch (timeRange) {
        case 'day':
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Week ${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        case 'month':
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        case 'year':
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        default:
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(day);
    });

    return Object.entries(groupedData).map(([key, days]) => {
      const avgGlucose = days.reduce((sum, day) => sum + day.avgGlucose, 0) / days.length;
      const totalInsulin = days.reduce((sum, day) => sum + day.totalInsulin, 0);

      return {
        x: key,
        y: avgGlucose,
        label: `${Math.round(avgGlucose)}mg/dL`,
        date: days[0].date,
        totalInsulin: Math.round(totalInsulin * 10) / 10,
      };
    }).slice(-10);
  }, [dailyAggregates, timeRange]);

  if (loading) {
    return (
      <View className="mx-4 mb-6 p-6 bg-white rounded-2xl border border-gray-200">
        <ThemedText className="text-center text-gray-500">Loading charts...</ThemedText>
      </View>
    );
  }

  if (chartData.length === 0) {
    return (
      <View className="mx-4 mb-6 p-6 bg-white rounded-2xl border border-gray-200">
        <ThemedText className="text-center text-gray-500">No data available for the selected time range</ThemedText>
      </View>
    );
  }

  const maxInsulin = Math.max(...chartData.map(d => d.y));
  const maxGlucose = Math.max(...glucoseData.map(d => d.y));

  return (
    <View className="mx-4 mb-6">
      {/* Insulin Chart */}
      <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4" style={{
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <View className="flex-row items-center mb-4">
          <Syringe size={20} color="#9333ea" />
          <ThemedText className="ml-2 font-bold text-gray-900" style={{ fontSize: 16 }}>
            Daily Insulin Usage
          </ThemedText>
        </View>

        <BarChart
          data={chartData.map(d => ({
            value: d.y,
            label: d.x,
            frontColor: '#9333ea',
            topLabelComponent: () => (
              <ThemedText className="text-xs" style={{ color: '#6b7280' }}>{d.y.toFixed(1)}u</ThemedText>
            ),
          }))}
          width={screenWidth}
          height={200}
          spacing={timeRange === 'day' ? 28 : 24}
          barWidth={14}
          initialSpacing={12}
          isAnimated
          xAxisColor="#e5e7eb"
          yAxisColor="#e5e7eb"
          yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
          hideRules={false}
          rulesColor="#f3f4f6"
          yAxisLabelTexts={[...Array(4)].map((_, i) => String(Math.round((maxInsulin * i) / 3)))}
        />
      </View>

      {/* Glucose Chart */}
      <View className="bg-white rounded-2xl border border-gray-200 p-4" style={{
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <View className="flex-row items-center mb-4">
          <Droplet size={20} color="#3b82f6" />
          <ThemedText className="ml-2 font-bold text-gray-900" style={{ fontSize: 16 }}>
            Average Glucose Levels
          </ThemedText>
        </View>

        <BarChart
          data={glucoseData.map(d => {
            const color = d.y < 70 ? '#ea580c' : d.y > 180 ? '#dc2626' : '#22c55e';
            return {
              value: d.y,
              label: d.x,
              frontColor: color,
              topLabelComponent: () => (
                <ThemedText className="text-xs" style={{ color: '#6b7280' }}>{Math.round(d.y)}mg/dL</ThemedText>
              ),
            };
          })}
          width={screenWidth}
          height={200}
          spacing={timeRange === 'day' ? 28 : 24}
          barWidth={14}
          initialSpacing={12}
          isAnimated
          xAxisColor="#e5e7eb"
          yAxisColor="#e5e7eb"
          yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
          hideRules={false}
          rulesColor="#f3f4f6"
          yAxisLabelTexts={[...Array(4)].map((_, i) => String(Math.round((maxGlucose * i) / 3)))}
        />

        {/* Legend */}
        <View className="flex-row justify-center mt-4" style={{ gap: 16 }}>
          <View className="flex-row items-center">
            <View style={{ width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: 2, marginRight: 4 }} />
            <ThemedText className="text-xs text-gray-600">Normal (70-180)</ThemedText>
          </View>
          <View className="flex-row items-center">
            <View style={{ width: 12, height: 12, backgroundColor: '#ea580c', borderRadius: 2, marginRight: 4 }} />
            <ThemedText className="text-xs text-gray-600">Low (&lt;70)</ThemedText>
          </View>
          <View className="flex-row items-center">
            <View style={{ width: 12, height: 12, backgroundColor: '#dc2626', borderRadius: 2, marginRight: 4 }} />
            <ThemedText className="text-xs text-gray-600">High (&gt;180)</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
});
