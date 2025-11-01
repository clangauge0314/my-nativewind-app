import { ThemedText } from '@/components/themed-text';
import { CHART_COLORS, GLUCOSE_TARGET_RANGE, ReportRecord } from '@/types/report';
import { formatTime } from '@/utils/report-calculator';
import { Activity, Droplet, Syringe, Wheat } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { ChartCard } from './ChartCard';
import { EmptyState } from './EmptyState';
import { SummaryCard } from './SummaryCard';

interface OneDayReportProps {
  records: ReportRecord[];
}

// toNumber 유틸리티 함수 (report-calculator에서 export하지 않았으므로 여기서 정의)
const safeToNumber = (value: string | number): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

export const OneDayReport = React.memo(function OneDayReport({ records }: OneDayReportProps) {
  const screenWidth = Dimensions.get('window').width - 64;

  // 혈당 라인 차트 데이터
  const glucoseLineData = useMemo(() => {
    if (records.length === 0) return [];

    return records
      .map(record => {
        const date = new Date(record.created_at);
        const glucose = safeToNumber(record.current_glucose);
        
        return {
          value: glucose,
          label: formatTime(date),
          dataPointText: `${glucose}`,
          date: record.created_at,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records]);

  // 식사 유형별 인슐린 & 탄수화물 바 차트 데이터
  const mealData = useMemo(() => {
    const mealGroups = new Map<string, { insulin: number; carbs: number }>();
    
    records.forEach(record => {
      const mealType = record.meal_type;
      if (!mealGroups.has(mealType)) {
        mealGroups.set(mealType, { insulin: 0, carbs: 0 });
      }
      const group = mealGroups.get(mealType)!;
      group.insulin += safeToNumber(record.total_insulin);
      group.carbs += safeToNumber(record.carbohydrates);
    });

    const insulinData: any[] = [];
    const carbsData: any[] = [];
    const labels: string[] = [];

    mealGroups.forEach((data, mealType) => {
      const label = mealType.charAt(0).toUpperCase() + mealType.slice(1);
      labels.push(label);
      
      insulinData.push({
        value: Math.round(data.insulin * 10) / 10,
        label,
        frontColor: CHART_COLORS.insulin,
        spacing: 2,
      });
      
      carbsData.push({
        value: Math.round(data.carbs * 10) / 10,
        label,
        frontColor: CHART_COLORS.carbs,
      });
    });

    return { insulinData, carbsData, labels };
  }, [records]);

  // 요약 통계
  const summary = useMemo(() => {
    if (records.length === 0) {
      return {
        avgGlucose: 0,
        maxGlucose: 0,
        minGlucose: 0,
        totalInsulin: 0,
        totalCarbs: 0,
      };
    }

    const glucoseValues = records.map(r => safeToNumber(r.current_glucose));
    const totalInsulin = records.reduce((sum, r) => sum + safeToNumber(r.total_insulin), 0);
    const totalCarbs = records.reduce((sum, r) => sum + safeToNumber(r.carbohydrates), 0);

    return {
      avgGlucose: Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length),
      maxGlucose: Math.max(...glucoseValues),
      minGlucose: Math.min(...glucoseValues),
      totalInsulin: Math.round(totalInsulin * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
    };
  }, [records]);

  if (records.length === 0) {
    return <EmptyState message="No data recorded today." />;
  }

  const maxGlucose = Math.max(...glucoseLineData.map(d => d.value), GLUCOSE_TARGET_RANGE.max + 50);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Glucose Trend Line Chart */}
      <ChartCard
        title="Glucose Trend"
        subtitle="Blood glucose levels by time"
        icon={<Droplet size={20} color={CHART_COLORS.glucose} />}
      >
        <View style={{ alignItems: 'center' }}>
          <LineChart
            data={glucoseLineData}
            width={screenWidth}
            height={220}
            spacing={glucoseLineData.length > 10 ? 40 : 60}
            initialSpacing={20}
            color={CHART_COLORS.glucose}
            thickness={3}
            startFillColor={CHART_COLORS.glucose + '40'}
            endFillColor={CHART_COLORS.glucose + '10'}
            startOpacity={0.9}
            endOpacity={0.2}
            areaChart
            curved
            isAnimated
            animationDuration={1000}
            xAxisColor={CHART_COLORS.grid}
            yAxisColor={CHART_COLORS.grid}
            yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 9, width: 50 }}
            hideRules={false}
            rulesColor={CHART_COLORS.grid}
            rulesType="solid"
            yAxisLabelTexts={['0', '100', '200', '300']}
            maxValue={maxGlucose}
            noOfSections={4}
            showVerticalLines
            verticalLinesColor={CHART_COLORS.grid + '40'}
            dataPointsColor={CHART_COLORS.glucose}
            dataPointsRadius={4}
            textColor={CHART_COLORS.text}
            textFontSize={10}
            textShiftY={-10}
            textShiftX={-5}
          />
        </View>

        {/* Target Range Legend */}
        <View className="flex-row justify-center mt-4 flex-wrap" style={{ gap: 12 }}>
          <View className="flex-row items-center">
            <View style={{ width: 12, height: 12, backgroundColor: CHART_COLORS.inRange, borderRadius: 2, marginRight: 4 }} />
            <ThemedText className="text-xs text-gray-600">
              Target Range ({GLUCOSE_TARGET_RANGE.min}-{GLUCOSE_TARGET_RANGE.max} mg/dL)
            </ThemedText>
          </View>
        </View>
      </ChartCard>

      {/* Insulin & Carbs by Meal */}
      {mealData.insulinData.length > 0 && (
        <ChartCard
          title="Insulin & Carbs by Meal"
          subtitle="Dosage and intake by meal type"
          icon={<Syringe size={20} color={CHART_COLORS.insulin} />}
        >
          <View style={{ alignItems: 'center' }}>
            <BarChart
              data={mealData.insulinData}
              width={screenWidth}
              height={200}
              barWidth={32}
              spacing={50}
              initialSpacing={20}
              isAnimated
              xAxisColor={CHART_COLORS.grid}
              yAxisColor={CHART_COLORS.grid}
              yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 11 }}
              hideRules={false}
              rulesColor={CHART_COLORS.grid}
              noOfSections={4}
              maxValue={Math.max(...mealData.insulinData.map((d: any) => d.value)) * 1.2}
            />
          </View>

          <View className="mt-4">
            <ThemedText className="text-xs font-semibold text-gray-700 mb-2">Carbohydrate Intake</ThemedText>
            <View style={{ alignItems: 'center' }}>
              <BarChart
                data={mealData.carbsData}
                width={screenWidth}
                height={180}
                barWidth={32}
                spacing={50}
                initialSpacing={20}
                isAnimated
                xAxisColor={CHART_COLORS.grid}
                yAxisColor={CHART_COLORS.grid}
                yAxisTextStyle={{ color: CHART_COLORS.text, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: CHART_COLORS.text, fontSize: 11 }}
                hideRules={false}
                rulesColor={CHART_COLORS.grid}
                noOfSections={4}
                maxValue={Math.max(...mealData.carbsData.map((d: any) => d.value)) * 1.2}
              />
            </View>
          </View>

          {/* Legend */}
          <View className="flex-row justify-center mt-4 flex-wrap" style={{ gap: 16 }}>
            <View className="flex-row items-center">
              <View style={{ width: 12, height: 12, backgroundColor: CHART_COLORS.insulin, borderRadius: 2, marginRight: 4 }} />
              <ThemedText className="text-xs text-gray-600">Insulin (units)</ThemedText>
            </View>
            <View className="flex-row items-center">
              <View style={{ width: 12, height: 12, backgroundColor: CHART_COLORS.carbs, borderRadius: 2, marginRight: 4 }} />
              <ThemedText className="text-xs text-gray-600">Carbs (g)</ThemedText>
            </View>
          </View>
        </ChartCard>
      )}

      {/* Summary */}
      <View className="mb-6">
        <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 16 }}>
          Today's Summary
        </ThemedText>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          <SummaryCard
            title="AVG GLUCOSE"
            value={summary.avgGlucose}
            unit="mg/dL"
            icon={<Droplet size={16} color={CHART_COLORS.glucose} />}
            color={CHART_COLORS.glucose}
            backgroundColor="#eff6ff"
          />
          <SummaryCard
            title="MAX GLUCOSE"
            value={summary.maxGlucose}
            unit="mg/dL"
            icon={<Activity size={16} color={CHART_COLORS.high} />}
            color={CHART_COLORS.high}
            backgroundColor="#fee2e2"
          />
          <SummaryCard
            title="MIN GLUCOSE"
            value={summary.minGlucose}
            unit="mg/dL"
            icon={<Activity size={16} color={CHART_COLORS.low} />}
            color={CHART_COLORS.low}
            backgroundColor="#ffedd5"
          />
          <SummaryCard
            title="TOTAL INSULIN"
            value={summary.totalInsulin}
            unit="units"
            icon={<Syringe size={16} color={CHART_COLORS.insulin} />}
            color={CHART_COLORS.insulin}
            backgroundColor="#faf5ff"
          />
          <SummaryCard
            title="TOTAL CARBS"
            value={summary.totalCarbs}
            unit="g"
            icon={<Wheat size={16} color={CHART_COLORS.carbs} />}
            color={CHART_COLORS.carbs}
            backgroundColor="#fef3c7"
          />
          <SummaryCard
            title="RECORDS"
            value={records.length}
            unit="times"
            icon={<Activity size={16} color="#6b7280" />}
            color="#6b7280"
            backgroundColor="#f3f4f6"
          />
        </View>
      </View>
    </ScrollView>
  );
});

