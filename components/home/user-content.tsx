import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/stores/auth-store';
import { View } from 'react-native';

export function UserContent() {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <View className="flex-1">
      {/* Main Content Area */}
      <View className="flex-1 items-center justify-center">
        <ThemedText className="text-lg" style={{ color: '#6b7280' }}>
          Your dashboard content goes here
        </ThemedText>
      </View>
    </View>
  );
}
