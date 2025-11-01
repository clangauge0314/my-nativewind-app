import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity, Calendar, Droplet, Syringe } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface StatsOverviewProps {
  totalRecords: number;
  avgGlucose: number;
  totalInsulin: number;
  daysActive: number;
}

export const StatsOverview = React.memo(function StatsOverview({
  totalRecords,
  avgGlucose,
  totalInsulin,
  daysActive,
}: StatsOverviewProps) {
  const stats = [
    {
      icon: <Calendar size={20} color="#3b82f6" />,
      label: 'Days Active',
      value: daysActive,
      unit: 'days',
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      icon: <Activity size={20} color="#8b5cf6" />,
      label: 'Total Records',
      value: totalRecords,
      unit: 'records',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
    },
    {
      icon: <Droplet size={20} color="#06b6d4" />,
      label: 'Avg Glucose',
      value: avgGlucose,
      unit: 'mg/dL',
      color: '#06b6d4',
      bgColor: '#ecfeff',
    },
    {
      icon: <Syringe size={20} color="#ec4899" />,
      label: 'Total Insulin',
      value: totalInsulin.toFixed(1),
      unit: 'units',
      color: '#ec4899',
      bgColor: '#fdf2f8',
    },
  ];

  return (
    <ThemedView className="mb-6">
      <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 18 }}>
        Your Statistics
      </ThemedText>
      
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {stats.map((stat, index) => (
          <View
            key={index}
            className="flex-1 min-w-[45%] rounded-2xl p-4"
            style={{
              backgroundColor: stat.bgColor,
              borderWidth: 1,
              borderColor: stat.color + '20',
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              {stat.icon}
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: '#ffffff' }}
              >
                <ThemedText style={{ fontSize: 10, color: stat.color, fontWeight: '600' }}>
                  {stat.unit}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText
              className="font-bold"
              style={{
                fontSize: 28,
                color: stat.color,
                lineHeight: 32,
              }}
            >
              {stat.value}
            </ThemedText>
            
            <ThemedText
              style={{
                fontSize: 12,
                color: stat.color,
                opacity: 0.8,
                marginTop: 2,
              }}
            >
              {stat.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
});

