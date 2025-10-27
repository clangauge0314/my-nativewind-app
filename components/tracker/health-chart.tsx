import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { TimeRange } from './time-range-selector';

interface HealthChartProps {
  timeRange: TimeRange;
  type: "glucose" | "insulin";
}

const screenWidth = Dimensions.get("window").width;

function generateData(timeRange: TimeRange, type: "glucose" | "insulin") {
  const dataPoints =
    timeRange === "seconds"
      ? 10
      : timeRange === "minutes"
      ? 12
      : timeRange === "hours"
      ? 24
      : 30;

  const baseValue = type === "glucose" ? 100 : 10;
  const variance = type === "glucose" ? 30 : 5;

  return Array.from({ length: dataPoints }, (_, i) => ({
    x: i,
    y: baseValue + (Math.random() - 0.5) * variance * 2,
  }));
}

function ChartBar({
  height,
  color,
  index,
}: {
  height: number;
  color: string;
  index: number;
}) {
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withSpring(height, {
      damping: 15,
      stiffness: 100,
    });
  }, [height, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        marginHorizontal: 1,
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: "100%",
            backgroundColor: color,
            borderRadius: 4,
            opacity: 0.8,
          },
        ]}
      />
    </View>
  );
}

export function HealthChart({ timeRange, type }: HealthChartProps) {
  const data = generateData(timeRange, type);
  const chartColor = type === "glucose" ? "#ef4444" : "#047857";

  const title = type === "glucose" ? "Blood Glucose Level" : "Insulin Level";
  const unit = type === "glucose" ? "mg/dL" : "µU/mL";

  const currentValue = data[data.length - 1].y.toFixed(1);
  const avgValue = (
    data.reduce((sum, d) => sum + d.y, 0) / data.length
  ).toFixed(1);

  // Find min and max for scaling
  const values = data.map((d) => d.y);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const chartHeight = 150;

  return (
    <ThemedView
      className="mx-4 mb-4 p-4 rounded-2xl"
      style={{
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <ThemedText className="text-sm opacity-60">{title}</ThemedText>
          <ThemedText className="text-2xl font-bold mt-1">
            {currentValue}{" "}
            <ThemedText className="text-sm opacity-60">{unit}</ThemedText>
          </ThemedText>
        </View>
        <View className="items-end">
          <ThemedText className="text-xs opacity-60">Average</ThemedText>
          <ThemedText className="text-lg font-semibold">{avgValue}</ThemedText>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: 12,
          padding: 16,
          height: chartHeight + 40,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            height: chartHeight,
            alignItems: "flex-end",
          }}
        >
          {data.map((point, index) => {
            const barHeight =
              ((point.y - minValue) / (maxValue - minValue)) * chartHeight;

            return (
              <ChartBar
                key={`${timeRange}-${index}`}
                height={barHeight}
                color={chartColor}
                index={index}
              />
            );
          })}
        </View>

        {/* X-axis labels */}
        <View className="flex-row justify-between mt-2">
          <ThemedText className="text-xs opacity-50">Start</ThemedText>
          <ThemedText className="text-xs opacity-50 capitalize">
            {timeRange}
          </ThemedText>
          <ThemedText className="text-xs opacity-50">Now</ThemedText>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row justify-center items-center mt-3">
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: chartColor,
            marginRight: 6,
          }}
        />
        <ThemedText className="text-xs opacity-60">
          {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} view
        </ThemedText>
      </View>
    </ThemedView>
  );
}
