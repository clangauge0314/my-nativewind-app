import { ThemedText } from '@/components/themed-text';
import { CHART_COLORS, MEAL_TYPE_COLORS, ReportRecord, ReportTimeRange } from '@/types/report';
import {
  calculateDailySummary,
  calculateMealTypeSummary,
  calculatePeriodSummary,
  calculateWeeklyPeriodSummary,
  calculateWeeklySummary
} from '@/utils/report-calculator';
import { Activity, Droplet, PieChart as PieChartIcon, Syringe, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { ChartCard } from './ChartCard';
import { EmptyState } from './EmptyState';
import { SummaryCard } from './SummaryCard';

interface PeriodReportProps {
  records: ReportRecord[];
  timeRange: ReportTimeRange;
}

export const PeriodReport = React.memo(function PeriodReport({ records, timeRange }: PeriodReportProps) {
  const screenWidth = Dimensions.get('window').width - 64;

  // 일별 평균 혈당 데이터
  const dailyData = useMemo(() => {
    const dailySummaries = calculateDailySummary(records);
    
    return dailySummaries.map(summary => {
      const date = new Date(summary.date);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        value: summary.avgGlucose,
        label,
        dataPointText: `${summary.avgGlucose}`,
        date: summary.date,
      };
    });
  }, [records]);

  // 식사 유형별 인슐린 분포 (파이 차트)
  const mealTypeData = useMemo(() => {
    const mealSummaries = calculateMealTypeSummary(records);
    const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
    
    return mealSummaries.map((summary, index) => ({
      value: summary.totalInsulin,
      color: MEAL_TYPE_COLORS[summary.mealType] || colors[index % colors.length],
      text: `${summary.percentage}%`,
      label: summary.mealType.charAt(0).toUpperCase() + summary.mealType.slice(1),
    }));
  }, [records]);

  // 요일별/주차별 데이터
  const weeklyData = useMemo(() => {
    if (timeRange === '1week') {
      // 요일별
      const weeklySummaries = calculateWeeklySummary(records);
      
      const glucoseData = weeklySummaries.map(summary => ({
        value: summary.avgGlucose,
        label: summary.weekLabel,
        frontColor: CHART_COLORS.glucose,
        spacing: 2,
      }));
      
      const insulinData = weeklySummaries.map(summary => ({
        value: summary.totalInsulin,
        label: summary.weekLabel,
        frontColor: CHART_COLORS.insulin,
      }));
      
      return { glucoseData, insulinData };
    } else {
      // 주차별
      const weeklyPeriodSummaries = calculateWeeklyPeriodSummary(records);
      
      const glucoseData = weeklyPeriodSummaries.map(summary => ({
        value: summary.avgGlucose,
        label: summary.weekLabel.split(' ')[0] + ' ' + summary.weekLabel.split(' ')[1], // "Week 1"
        frontColor: CHART_COLORS.glucose,
        spacing: 2,
      }));
      
      const insulinData = weeklyPeriodSummaries.map(summary => ({
        value: summary.totalInsulin,
        label: summary.weekLabel.split(' ')[0] + ' ' + summary.weekLabel.split(' ')[1],
        frontColor: CHART_COLORS.insulin,
      }));
      
      return { glucoseData, insulinData };
    }
  }, [records, timeRange]);

  // 전체 기간 요약
  const periodSummary = useMemo(() => calculatePeriodSummary(records), [records]);

  if (records.length === 0) {
    return <EmptyState message="No data recorded for the selected period." />;
  }

  const maxGlucose = Math.max(...dailyData.map(d => d.value), 200);
  const avgGlucose = periodSummary.avgGlucose;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Daily Average Glucose Trend */}
      <ChartCard
        title="Daily Average Glucose Trend"
        subtitle={`Period Average: ${avgGlucose} mg/dL`}
        icon={<TrendingUp size={20} color={CHART_COLORS.glucose} />}
      >
        <View style={{ alignItems: 'center' }}>
          {dailyData.length > 15 ? (
            <LineChart
              data={dailyData}
              width={screenWidth}
              height={220}
              spacing={dailyData.length > 30 ? 20 : 30}
              initialSpacing={20}
              color={CHART_COLORS.glucose}
              thickness={2}
              startFillColor={CHART_COLORS.glucose + '30'}
              endFillColor={CHART_COLORS.glucose + '10'}
              startOpacity={0.8}
              endOpacity={0.1}
              areaChart
              curved
              isAnimated
              animationDuration={1000}
              xAxisColor={CHART_COLORS.grid}
              yAxisColor={CHART_COLORS.grid}
              yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 8 }}
              hideRules={false}
              rulesColor={CHART_COLORS.grid}
              maxValue={maxGlucose}
              noOfSections={4}
              dataPointsColor={CHART_COLORS.glucose}
              dataPointsRadius={3}
            />
          ) : (
            <BarChart
              data={dailyData.map(d => ({
                value: d.value,
                label: d.label,
                frontColor: d.value < 70 ? CHART_COLORS.low : d.value > 180 ? CHART_COLORS.high : CHART_COLORS.inRange,
                topLabelComponent: () => (
                  <ThemedText className="text-xs" style={{ color: CHART_COLORS.text }}>{d.value}</ThemedText>
                ),
              }))}
              width={screenWidth}
              height={220}
              barWidth={dailyData.length > 7 ? 18 : 28}
              spacing={dailyData.length > 7 ? 20 : 30}
              initialSpacing={15}
              isAnimated
              xAxisColor={CHART_COLORS.grid}
              yAxisColor={CHART_COLORS.grid}
              yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 9 }}
              hideRules={false}
              rulesColor={CHART_COLORS.grid}
              noOfSections={4}
              maxValue={maxGlucose}
            />
          )}
        </View>
      </ChartCard>

      {/* Insulin Distribution by Meal Type */}
      {mealTypeData.length > 0 && (
        <ChartCard
          title="Insulin Distribution by Meal Type"
          subtitle="Total insulin dosage ratio"
          icon={<PieChartIcon size={20} color={CHART_COLORS.insulin} />}
        >
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <PieChart
              data={mealTypeData}
              donut
              radius={100}
              innerRadius={60}
              innerCircleColor="#ffffff"
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <ThemedText className="text-2xl font-bold" style={{ color: CHART_COLORS.insulin }}>
                    {periodSummary.totalInsulin}
                  </ThemedText>
                  <ThemedText className="text-xs" style={{ color: CHART_COLORS.text }}>
                    units
                  </ThemedText>
                </View>
              )}
              showText
              textColor="#ffffff"
              textSize={12}
              fontWeight="bold"
            />
          </View>

          {/* 범례 */}
          <View className="flex-row flex-wrap justify-center mt-4" style={{ gap: 12 }}>
            {mealTypeData.map((item, index) => (
              <View key={index} className="flex-row items-center">
                <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 2, marginRight: 4 }} />
                <ThemedText className="text-xs text-gray-600">{item.label}</ThemedText>
              </View>
            ))}
          </View>
        </ChartCard>
      )}

      {/* Weekly/Daily Summary */}
      {weeklyData.glucoseData.length > 0 && (
        <ChartCard
          title={timeRange === '1week' ? 'Daily Summary' : 'Weekly Summary'}
          subtitle="Average glucose and total insulin"
          icon={<Activity size={20} color={CHART_COLORS.glucose} />}
        >
          <ThemedText className="text-xs font-semibold text-gray-700 mb-2">Average Glucose</ThemedText>
          <View style={{ alignItems: 'center' }}>
            <BarChart
              data={weeklyData.glucoseData}
              width={screenWidth}
              height={200}
              barWidth={weeklyData.glucoseData.length > 7 ? 18 : 32}
              spacing={weeklyData.glucoseData.length > 7 ? 15 : 30}
              initialSpacing={15}
              isAnimated
              xAxisColor={CHART_COLORS.grid}
              yAxisColor={CHART_COLORS.grid}
              yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 9 }}
              hideRules={false}
              rulesColor={CHART_COLORS.grid}
              noOfSections={4}
              maxValue={Math.max(...weeklyData.glucoseData.map((d: any) => d.value)) * 1.2}
            />
          </View>

          <ThemedText className="text-xs font-semibold text-gray-700 mb-2 mt-6">Total Insulin</ThemedText>
          <View style={{ alignItems: 'center' }}>
            <BarChart
              data={weeklyData.insulinData}
              width={screenWidth}
              height={180}
              barWidth={weeklyData.insulinData.length > 7 ? 18 : 32}
              spacing={weeklyData.insulinData.length > 7 ? 15 : 30}
              initialSpacing={15}
              isAnimated
              xAxisColor={CHART_COLORS.grid}
              yAxisColor={CHART_COLORS.grid}
              yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 9 }}
              hideRules={false}
              rulesColor={CHART_COLORS.grid}
              noOfSections={4}
              maxValue={Math.max(...weeklyData.insulinData.map((d: any) => d.value)) * 1.2}
            />
          </View>
        </ChartCard>
      )}

      {/* Period Summary */}
      <View className="mb-6">
        <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 16 }}>
          Period Summary
        </ThemedText>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          <SummaryCard
            title="AVG GLUCOSE"
            value={periodSummary.avgGlucose}
            unit="mg/dL"
            icon={<Droplet size={16} color={CHART_COLORS.glucose} />}
            color={CHART_COLORS.glucose}
            backgroundColor="#eff6ff"
          />
          <SummaryCard
            title="ESTIMATED A1C"
            value={periodSummary.eA1C}
            unit="%"
            subtitle="eA1C"
            icon={<Activity size={16} color="#dc2626" />}
            color="#dc2626"
            backgroundColor="#fee2e2"
          />
          <SummaryCard
            title="TOTAL INSULIN"
            value={periodSummary.totalInsulin}
            unit="units"
            icon={<Syringe size={16} color={CHART_COLORS.insulin} />}
            color={CHART_COLORS.insulin}
            backgroundColor="#faf5ff"
          />
          <SummaryCard
            title="DAILY AVG INSULIN"
            value={periodSummary.avgDailyInsulin}
            unit="units/day"
            icon={<Syringe size={16} color={CHART_COLORS.insulin} />}
            color={CHART_COLORS.insulin}
            backgroundColor="#faf5ff"
          />
          <SummaryCard
            title="TIME IN RANGE"
            value={periodSummary.timeInRange}
            unit="%"
            subtitle={`of ${periodSummary.recordCount} records`}
            icon={<Activity size={16} color={CHART_COLORS.inRange} />}
            color={CHART_COLORS.inRange}
            backgroundColor="#dcfce7"
          />
          <SummaryCard
            title="DAYS RECORDED"
            value={periodSummary.daysInRange}
            unit="days"
            icon={<Activity size={16} color="#6b7280" />}
            color="#6b7280"
            backgroundColor="#f3f4f6"
          />
        </View>
      </View>
    </ScrollView>
  );
});

