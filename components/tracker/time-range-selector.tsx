import { ThemedText } from "@/components/themed-text";
import { Pressable, View } from "react-native";

export type TimeRange = "seconds" | "minutes" | "hours" | "days";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <View className="flex-row justify-center items-center gap-2 px-4 mb-4">
      {timeRangeOptions.map((option) => {
        const isSelected = selectedRange === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onRangeChange(option.value)}
            className="flex-1 py-3 rounded-lg"
            style={{
              backgroundColor: isSelected ? "#047857" : "#f3f4f6",
            }}
          >
            <ThemedText
              className="text-center text-sm font-semibold"
              style={{ color: isSelected ? "#ffffff" : "#4b5563" }}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
