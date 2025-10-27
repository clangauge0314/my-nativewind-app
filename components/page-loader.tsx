import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface PageLoaderProps {
  isLoading: boolean;
  minDuration?: number; 
  children: React.ReactNode;
}

export function PageLoader({ isLoading, minDuration = 500, children }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const start = Date.now();
      setStartTime(start);
      setShowLoader(true);
    } else if (startTime !== null) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      
      const timer = setTimeout(() => {
        setShowLoader(false);
        setStartTime(null);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minDuration]);

  if (showLoader) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <View className="items-center">
          <ActivityIndicator 
            size="large" 
            color="#1d4ed8"
          />
          <ThemedText className="mt-4 text-sm opacity-70">
            Loading...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return <>{children}</>;
}

