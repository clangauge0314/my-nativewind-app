import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { Activity, Clock, Droplet, History } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

export function RecentHistory() {
  const { bloodGlucoseEntries, insulinEntries, settings } = useHealthStore();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInsulinTypeLabel = (type: string) => {
    switch (type) {
      case 'rapid': return 'Rapid';
      case 'short': return 'Short';
      case 'intermediate': return 'Inter.';
      case 'long': return 'Long';
      default: return type;
    }
  };

  const getBGTypeLabel = (type: string) => {
    switch (type) {
      case 'fasting': return 'Fasting';
      case 'before_meal': return 'Pre-meal';
      case 'after_meal': return 'Post-meal';
      case 'bedtime': return 'Bedtime';
      case 'random': return 'Random';
      default: return type;
    }
  };

  // Combine and sort entries
  const allEntries = [
    ...bloodGlucoseEntries.slice(0, 10).map((entry) => ({
      type: 'bg' as const,
      timestamp: entry.timestamp,
      data: entry,
    })),
    ...insulinEntries.slice(0, 10).map((entry) => ({
      type: 'insulin' as const,
      timestamp: entry.timestamp,
      data: entry,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);

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
      <View className="flex-row items-center mb-6">
        <History size={24} color="#2563eb" />
        <ThemedText className="text-xl font-bold ml-3">
          Recent Activity
        </ThemedText>
      </View>

      <ScrollView
        style={{ maxHeight: 400 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 12 }}>
          {allEntries.length === 0 ? (
            <View className="items-center py-8">
              <ThemedText className="text-sm opacity-60">
                No recent activity
              </ThemedText>
              <ThemedText className="text-xs opacity-40 mt-2">
                Start tracking to see your history
              </ThemedText>
            </View>
          ) : (
            allEntries.map((entry, index) => (
              <View
                key={`${entry.type}-${entry.timestamp}-${index}`}
                className="flex-row items-center p-4 rounded-xl"
                style={{
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
              >
                {/* Icon */}
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: entry.type === 'bg'
                      ? '#dbeafe'
                      : '#ede9fe',
                  }}
                >
                  {entry.type === 'bg' ? (
                    <Activity size={18} color="#2563eb" />
                  ) : (
                    <Droplet size={18} color="#7c3aed" />
                  )}
                </View>

                {/* Content */}
                <View className="flex-1">
                  {entry.type === 'bg' ? (
                    <>
                      <View className="flex-row items-center mb-1">
                        <ThemedText className="font-bold">
                          {entry.data.value} {settings.units}
                        </ThemedText>
                        <View
                          className="ml-2 px-2 py-0.5 rounded"
                          style={{ backgroundColor: '#f3f4f6' }}
                        >
                          <ThemedText className="text-xs opacity-70">
                            {getBGTypeLabel(entry.data.type)}
                          </ThemedText>
                        </View>
                      </View>
                      {entry.data.notes && (
                        <ThemedText className="text-xs opacity-60 mb-1">
                          {entry.data.notes}
                        </ThemedText>
                      )}
                    </>
                  ) : (
                    <>
                      <View className="flex-row items-center mb-1">
                        <ThemedText className="font-bold">
                          {entry.data.units} units
                        </ThemedText>
                        <View
                          className="ml-2 px-2 py-0.5 rounded"
                          style={{ backgroundColor: '#f3f4f6' }}
                        >
                          <ThemedText className="text-xs opacity-70">
                            {getInsulinTypeLabel(entry.data.type)}
                          </ThemedText>
                        </View>
                      </View>
                      {entry.data.notes && (
                        <ThemedText className="text-xs opacity-60 mb-1">
                          {entry.data.notes}
                        </ThemedText>
                      )}
                    </>
                  )}
                  
                  <View className="flex-row items-center">
                    <Clock size={10} color={'#6b7280'} />
                    <ThemedText className="text-xs ml-1 opacity-60">
                      {formatTime(entry.timestamp)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

