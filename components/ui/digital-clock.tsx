import { ThemedText } from '@/components/themed-text';
import { Clock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

interface DigitalClockProps {
  showSeconds?: boolean;
  showDate?: boolean;
  size?: 'small' | 'medium' | 'large';
  timezone?: string; // e.g., 'Asia/Bangkok', 'America/New_York'
}

export function DigitalClock({ 
  showSeconds = true, 
  showDate = false,
  size = 'medium',
  timezone = 'Asia/Bangkok' // Default to Thailand time
}: DigitalClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    // Use Intl API for reliable timezone conversion
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    
    const parts = formatter.formatToParts(date);
    const hour = parts.find(p => p.type === 'hour')?.value || '12';
    const minute = parts.find(p => p.type === 'minute')?.value || '00';
    const second = parts.find(p => p.type === 'second')?.value || '00';
    const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value || 'AM';
    
    const timeString = showSeconds
      ? `${hour}:${minute}:${second} ${dayPeriod}`
      : `${hour}:${minute} ${dayPeriod}`;
    
    return timeString;
  };

  const formatDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    return formatter.format(date);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          timeSize: 18,
          dateSize: 12,
          iconSize: 16,
          gap: 6,
        };
      case 'large':
        return {
          timeSize: 34,
          dateSize: 16,
          iconSize: 28,
          gap: 10,
        };
      default: // medium
        return {
          timeSize: 24,
          dateSize: 14,
          iconSize: 20,
          gap: 8,
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <View>
      <View className="flex-row items-center" style={{ gap: styles.gap }}>
        <Clock size={styles.iconSize} color="#2563eb" strokeWidth={2.5} />
        <ThemedText
          style={{
            fontSize: styles.timeSize,
            lineHeight: styles.timeSize * 1.4,
            fontWeight: '700',
            color: '#1f2937',
            letterSpacing: 1,
          }}
        >
          {formatTime(currentTime)}
        </ThemedText>
      </View>
      
      {showDate && (
        <ThemedText
          className="mt-2"
          style={{
            fontSize: styles.dateSize,
            color: '#6b7280',
            fontWeight: '500',
            letterSpacing: 0.3,
          }}
        >
          {formatDate(currentTime)}
        </ThemedText>
      )}
    </View>
  );
}

