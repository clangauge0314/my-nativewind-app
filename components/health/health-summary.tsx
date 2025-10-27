import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { calculateIOB, getMenstrualCycleImpact } from '@/utils/diabetes-calculator';
import { Activity, Droplet, Moon, TrendingUp } from 'lucide-react-native';
import { View } from 'react-native';

export function HealthSummary() {
  const { 
    bloodGlucoseEntries, 
    insulinEntries, 
    exerciseEntries,
    sleepEntries,
    settings,
    getCurrentCycleDays,
  } = useHealthStore();
  
  // Latest BG
  const latestBG = bloodGlucoseEntries[0];
  
  // IOB
  const recentInsulin = insulinEntries.filter(
    (entry) => Date.now() - entry.timestamp < entry.duration * 60 * 60 * 1000
  );
  const iobResult = calculateIOB(recentInsulin);
  
  // Recent exercise (last 6 hours)
  const recentExercise = exerciseEntries.filter(
    (entry) => Date.now() - entry.timestamp < 6 * 60 * 60 * 1000
  );
  
  // Sleep quality
  const lastSleep = sleepEntries[0];
  
  // Menstrual cycle
  const cycleDays = getCurrentCycleDays();
  const cycleImpact = cycleDays ? getMenstrualCycleImpact(cycleDays) : null;
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  };

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
      <ThemedText className="text-xl font-bold mb-6">
        Health Overview
      </ThemedText>

      {/* Grid */}
      <View style={{ gap: 12 }}>
        {/* Latest Blood Glucose */}
        {latestBG && (
          <View
            className="p-4 rounded-2xl flex-row items-center"
            style={{ backgroundColor: '#dbeafe' }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: '#ffffff' }}
            >
              <Activity size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-xs opacity-70 mb-1">
                Latest Blood Glucose
              </ThemedText>
              <View className="flex-row items-baseline">
                <ThemedText className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                  {latestBG.value}
                </ThemedText>
                <ThemedText className="text-sm ml-2 opacity-70">
                  {settings.units}
                </ThemedText>
              </View>
              <ThemedText className="text-xs opacity-60 mt-1">
                {formatTime(latestBG.timestamp)}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Insulin On Board */}
        {iobResult.totalIOB > 0 && (
          <View
            className="p-4 rounded-2xl flex-row items-center"
            style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: '#eff6ff' }}
            >
              <Droplet size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-xs opacity-70 mb-1">
                Insulin On Board
              </ThemedText>
              <View className="flex-row items-baseline">
                <ThemedText className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                  {iobResult.totalIOB}
                </ThemedText>
                <ThemedText className="text-sm ml-2 opacity-70">
                  units
                </ThemedText>
              </View>
              <ThemedText className="text-xs opacity-60 mt-1">
                {iobResult.entries.length} active dose(s)
              </ThemedText>
            </View>
          </View>
        )}

        {/* Recent Exercise Warning */}
        {recentExercise.length > 0 && (
          <View
            className="p-4 rounded-2xl"
            style={{ backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#ef4444' }}
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={18} color="#ef4444" />
              <ThemedText className="font-semibold ml-2" style={{ color: '#ef4444' }}>
                Exercise Impact
              </ThemedText>
            </View>
            <ThemedText className="text-sm" style={{ color: '#ef4444' }}>
              Recent {recentExercise[0].intensity} exercise. Monitor for low BG. Consider reducing insulin by 10-20%.
            </ThemedText>
          </View>
        )}

        {/* Menstrual Cycle Impact */}
        {cycleImpact && cycleImpact.insulinAdjustment !== 0 && (
          <View
            className="p-4 rounded-2xl"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <View className="flex-row items-center mb-2">
              <Moon size={18} color={'#6b7280'} />
              <ThemedText className="font-semibold ml-2">
                Cycle Phase: {cycleImpact.phase}
              </ThemedText>
            </View>
            <ThemedText className="text-sm opacity-70">
              {cycleImpact.note}
            </ThemedText>
            {cycleImpact.insulinAdjustment > 0 && (
              <ThemedText className="text-xs mt-2" style={{ color: '#2563eb' }}>
                Consider +{cycleImpact.insulinAdjustment}% insulin adjustment
              </ThemedText>
            )}
          </View>
        )}

        {/* Sleep Quality */}
        {lastSleep && (
          <View
            className="p-4 rounded-2xl"
            style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <ThemedText className="text-xs opacity-70 mb-1">
                  Last Sleep
                </ThemedText>
                <ThemedText className="font-semibold">
                  {Math.round((lastSleep.endTime - lastSleep.startTime) / (1000 * 60 * 60))}h • {lastSleep.quality}
                </ThemedText>
              </View>
              <Moon size={24} color={'#6b7280'} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

