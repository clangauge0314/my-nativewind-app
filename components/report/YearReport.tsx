import { ThemedText } from '@/components/themed-text';
import { CHART_COLORS, ReportRecord } from '@/types/report';
import {
  calculateMonthlySummary,
  calculatePeriodSummary,
  calculateQuarterlySummary,
} from '@/utils/report-calculator';
import { Activity, Calendar, Droplet, Syringe, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { ChartCard } from './ChartCard';
import { EmptyState } from './EmptyState';
import { SummaryCard } from './SummaryCard';

interface YearReportProps {
  records: ReportRecord[];
}

export const YearReport = React.memo(function YearReport({ records }: YearReportProps) {
  const screenWidth = Dimensions.get('window').width - 64;

  // 월별 데이터
  const monthlyData = useMemo(() => {
    const monthlySummaries = calculateMonthlySummary(records);
    
    const glucoseData = monthlySummaries.map(summary => ({
      value: summary.avgGlucose,
      label: summary.month.split(' ')[0], // "Jan", "Feb", etc.
      frontColor: CHART_COLORS.glucose,
      spacing: 2,
    }));
    
    const insulinData = monthlySummaries.map(summary => ({
      value: summary.totalInsulin,
      label: summary.month.split(' ')[0],
      frontColor: CHART_COLORS.insulin,
    }));
    
    return { glucoseData, insulinData, summaries: monthlySummaries };
  }, [records]);

  // 분기별 데이터
  const quarterlyData = useMemo(() => {
    return calculateQuarterlySummary(records);
  }, [records]);

  // 연간 요약
  const yearSummary = useMemo(() => calculatePeriodSummary(records), [records]);

  if (records.length === 0) {
    return <EmptyState message="No data recorded in the past year." />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Monthly Average Glucose */}
      <ChartCard
        title="Monthly Average Glucose"
        subtitle={`Annual Average: ${yearSummary.avgGlucose} mg/dL`}
        icon={<TrendingUp size={20} color={CHART_COLORS.glucose} />}
      >
        <View style={{ alignItems: 'center' }}>
          {monthlyData.glucoseData.length > 6 ? (
            <LineChart
              data={monthlyData.glucoseData.map(d => ({
                value: d.value,
                label: d.label,
                dataPointText: `${d.value}`,
              }))}
              width={screenWidth}
              height={220}
              spacing={monthlyData.glucoseData.length > 9 ? 25 : 35}
              initialSpacing={20}
              color={CHART_COLORS.glucose}
              thickness={3}
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
              xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              hideRules={false}
              rulesColor={CHART_COLORS.grid}
              maxValue={Math.max(...monthlyData.glucoseData.map(d => d.value)) * 1.2}
              noOfSections={4}
              dataPointsColor={CHART_COLORS.glucose}
              dataPointsRadius={4}
              textColor={CHART_COLORS.text}
              textFontSize={10}
              textShiftY={-10}
            />
          ) : (
            <BarChart
              data={monthlyData.glucoseData}
              width={screenWidth}
              height={220}
              barWidth={32}
              spacing={35}
              initialSpacing={20}
              isAnimated
              xAxisColor={CHART_COLORS.grid}
              yAxisColor={CHART_COLORS.grid}
              yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              hideRules={false}
              rulesColor={CHART_COLORS.grid}
              noOfSections={4}
              maxValue={Math.max(...monthlyData.glucoseData.map(d => d.value)) * 1.2}
            />
          )}
        </View>
      </ChartCard>

      {/* Monthly Total Insulin */}
      <ChartCard
        title="Monthly Total Insulin"
        subtitle={`Annual Total: ${yearSummary.totalInsulin} units`}
        icon={<Syringe size={20} color={CHART_COLORS.insulin} />}
      >
        <View style={{ alignItems: 'center' }}>
          <BarChart
            data={monthlyData.insulinData}
            width={screenWidth}
            height={220}
            barWidth={monthlyData.insulinData.length > 9 ? 18 : 28}
            spacing={monthlyData.insulinData.length > 9 ? 20 : 30}
            initialSpacing={15}
            isAnimated
            xAxisColor={CHART_COLORS.grid}
            yAxisColor={CHART_COLORS.grid}
            yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
            hideRules={false}
            rulesColor={CHART_COLORS.grid}
            noOfSections={4}
            maxValue={Math.max(...monthlyData.insulinData.map(d => d.value)) * 1.2}
          />
        </View>
      </ChartCard>

      {/* Quarterly Summary */}
      {quarterlyData.length > 0 && (
        <View className="mb-6">
          <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 16 }}>
            Quarterly Summary
          </ThemedText>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {quarterlyData.map((quarter, index) => (
              <View
                key={index}
                className="flex-1 min-w-[45%] bg-white rounded-xl p-4 border border-gray-200"
                style={{
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Calendar size={16} color="#3b82f6" />
                  <ThemedText className="ml-2 font-bold text-gray-900" style={{ fontSize: 14 }}>
                    {quarter.quarter}
                  </ThemedText>
                </View>

                <View className="mb-2">
                  <ThemedText className="text-xs text-gray-500">Average Glucose</ThemedText>
                  <View className="flex-row items-end">
                    <ThemedText className="text-xl font-bold text-blue-600">
                      {quarter.avgGlucose}
                    </ThemedText>
                    <ThemedText className="ml-1 mb-0.5 text-xs text-blue-600">mg/dL</ThemedText>
                  </View>
                </View>

                <View className="mb-2">
                  <ThemedText className="text-xs text-gray-500">Estimated A1C</ThemedText>
                  <View className="flex-row items-end">
                    <ThemedText className="text-xl font-bold text-red-600">
                      {quarter.eA1C}
                    </ThemedText>
                    <ThemedText className="ml-1 mb-0.5 text-xs text-red-600">%</ThemedText>
                  </View>
                </View>

                <View className="mb-2">
                  <ThemedText className="text-xs text-gray-500">Total Insulin</ThemedText>
                  <View className="flex-row items-end">
                    <ThemedText className="text-lg font-bold text-purple-600">
                      {quarter.totalInsulin}
                    </ThemedText>
                    <ThemedText className="ml-1 mb-0.5 text-xs text-purple-600">units</ThemedText>
                  </View>
                </View>

                <View className="pt-2 border-t border-gray-200">
                  <ThemedText className="text-xs text-gray-400">
                    {quarter.recordCount} records
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Annual Summary */}
      <View className="mb-6">
        <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 16 }}>
          Annual Summary
        </ThemedText>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          <SummaryCard
            title="ANNUAL AVG GLUCOSE"
            value={yearSummary.avgGlucose}
            unit="mg/dL"
            icon={<Droplet size={16} color={CHART_COLORS.glucose} />}
            color={CHART_COLORS.glucose}
            backgroundColor="#eff6ff"
          />
          <SummaryCard
            title="ANNUAL EST. A1C"
            value={yearSummary.eA1C}
            unit="%"
            subtitle="eA1C"
            icon={<Activity size={16} color="#dc2626" />}
            color="#dc2626"
            backgroundColor="#fee2e2"
          />
          <SummaryCard
            title="ANNUAL TOTAL INSULIN"
            value={yearSummary.totalInsulin}
            unit="units"
            icon={<Syringe size={16} color={CHART_COLORS.insulin} />}
            color={CHART_COLORS.insulin}
            backgroundColor="#faf5ff"
          />
          <SummaryCard
            title="DAILY AVG INSULIN"
            value={yearSummary.avgDailyInsulin}
            unit="units/day"
            icon={<Syringe size={16} color={CHART_COLORS.insulin} />}
            color={CHART_COLORS.insulin}
            backgroundColor="#faf5ff"
          />
          <SummaryCard
            title="TIME IN RANGE"
            value={yearSummary.timeInRange}
            unit="%"
            subtitle="70-180 mg/dL"
            icon={<Activity size={16} color={CHART_COLORS.inRange} />}
            color={CHART_COLORS.inRange}
            backgroundColor="#dcfce7"
          />
          <SummaryCard
            title="TOTAL DAYS RECORDED"
            value={yearSummary.daysInRange}
            unit="days"
            icon={<Calendar size={16} color="#6b7280" />}
            color="#6b7280"
            backgroundColor="#f3f4f6"
          />
        </View>
      </View>

      {/* Health Insights */}
      <View
        className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200"
        style={{
          shadowColor: '#3b82f6',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <View className="flex-row items-start">
          <ThemedText className="mr-2">💡</ThemedText>
          <View className="flex-1">
            <ThemedText className="text-xs font-semibold text-blue-900 mb-1">
              Annual Health Insights
            </ThemedText>
            <ThemedText className="text-xs text-blue-800 opacity-80">
              {yearSummary.eA1C < 7.0
                ? "Excellent! Your A1C is within the target range. Keep up your current management approach."
                : yearSummary.eA1C < 8.0
                ? "Good, but there's room for improvement. Consider consulting with your healthcare provider to adjust your management plan."
                : "Your A1C is above the target range. Please work closely with your healthcare provider to review your management plan."}
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

