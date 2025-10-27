import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { calculateIOB } from '@/utils/diabetes-calculator';
import { Activity, Clock, Droplet } from 'lucide-react-native';
import { View } from 'react-native';

export function IOBDisplay() {
  const { insulinEntries } = useHealthStore();
  
  const recentInsulin = insulinEntries.filter(
    (entry) => Date.now() - entry.timestamp < entry.duration * 60 * 60 * 1000
  );
  
  const iobResult = calculateIOB(recentInsulin);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getInsulinTypeLabel = (type: string) => {
    switch (type) {
      case 'rapid': return 'Rapid';
      case 'short': return 'Short';
      case 'intermediate': return 'Intermediate';
      case 'long': return 'Long';
      default: return type;
    }
  };

  if (iobResult.totalIOB === 0) {
    return (
      <View
        className="rounded-2xl p-6 mb-6"
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 0,
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <View className="items-center">
          <Droplet size={32} color={'#9ca3af'} />
          <ThemedText className="text-center mt-3 font-semibold">
            No Active Insulin
          </ThemedText>
          <ThemedText className="text-xs text-center mt-2 opacity-60">
            No insulin on board
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: '#ffffff',
        borderWidth: 0,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: '#eff6ff' }}
          >
            <Droplet size={24} color="#2563eb" />
          </View>
          <View>
            <ThemedText className="text-xl font-bold">
              Insulin On Board
            </ThemedText>
            <ThemedText className="text-xs opacity-60">
              Active insulin in your system
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Total IOB */}
      <View
        className="p-5 rounded-2xl mb-4"
        style={{ backgroundColor: '#dbeafe' }}
      >
        <View className="items-center">
          <ThemedText className="text-sm opacity-80 mb-2">
            Total Active Insulin
          </ThemedText>
          <View className="flex-row items-baseline">
            <ThemedText className="text-5xl font-bold" style={{ color: '#2563eb' }}>
              {iobResult.totalIOB}
            </ThemedText>
            <ThemedText className="text-2xl ml-2 opacity-70">
              units
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Breakdown */}
      <ThemedText className="text-sm font-semibold mb-3">
        Active Doses:
      </ThemedText>
      
      <View style={{ gap: 12 }}>
        {iobResult.entries.map((entry, index) => (
          <View
            key={entry.insulinEntry.id}
            className="flex-row items-center p-4 rounded-xl"
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#f3f4f6' }}
            >
              <Activity size={18} color="#2563eb" />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <ThemedText className="font-semibold">
                  {entry.remainingUnits}u
                </ThemedText>
                <ThemedText className="text-xs ml-2 opacity-60">
                  • {getInsulinTypeLabel(entry.insulinEntry.type)}
                </ThemedText>
              </View>
              <View className="flex-row items-center">
                <Clock size={12} color={'#6b7280'} />
                <ThemedText className="text-xs ml-1 opacity-70">
                  {formatTime(entry.insulinEntry.timestamp)} • {entry.hoursRemaining}h remaining
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Warning */}
      {iobResult.totalIOB > 5 && (
        <View
          className="mt-4 p-4 rounded-xl"
          style={{ backgroundColor: '#fee2e2' }}
        >
          <ThemedText className="text-xs text-center" style={{ color: '#ef4444' }}>
            ⚠️ High insulin on board. Monitor for hypoglycemia.
          </ThemedText>
        </View>
      )}
    </View>
  );
}

