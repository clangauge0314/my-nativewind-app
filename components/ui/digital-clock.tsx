import { ThemedText } from '@/components/themed-text';
import { Clock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

interface DigitalClockProps {
  showSeconds?: boolean;
  showDate?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function DigitalClock({ 
  showSeconds = true, 
  showDate = false,
  size = 'medium' 
}: DigitalClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    const timeString = showSeconds
      ? `${hour12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
      : `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    return timeString;
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${monthName} ${day}, ${year}`;
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

