import { ThemedText } from "@/components/themed-text";
import type { TimeRange } from "@/types/tracker";
import { Pressable, View } from "react-native";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string; description: string }[] = [
  { value: "hours", label: "24H", description: "Last 24 hours" },
  { value: "day", label: "7D", description: "Last 7 days" },
  { value: "week", label: "30D", description: "Last 30 days" },
  { value: "month", label: "3M", description: "Last 3 months" },
  { value: "year", label: "1Y", description: "Last 12 months" },
];

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <View className="px-4 mb-6">
      <View className="flex-row justify-center items-center gap-2">
        {timeRangeOptions.map((option) => {
          const isSelected = selectedRange === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onRangeChange(option.value)}
              className="flex-1 py-3 rounded-xl"
              style={{
                backgroundColor: isSelected ? "#3b82f6" : "#f3f4f6",
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? "#2563eb" : "#e5e7eb",
                shadowColor: isSelected ? '#3b82f6' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.2 : 0,
                shadowRadius: 4,
                elevation: isSelected ? 3 : 0,
              }}
            >
              <ThemedText
                className="text-center font-bold mb-1"
                style={{ 
                  color: isSelected ? "#ffffff" : "#4b5563",
                  fontSize: 16,
                }}
              >
                {option.label}
              </ThemedText>
              <ThemedText
                className="text-center"
                style={{ 
                  color: isSelected ? "#ffffff" : "#9ca3af",
                  fontSize: 10,
                  opacity: 0.8,
                }}
              >
                {option.description}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
