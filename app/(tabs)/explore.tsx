import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ExploreScreen() {
  return (
    <ThemedView className="flex-1 justify-center items-center p-5">
      <ThemedText type="title">Explore</ThemedText>
      <ThemedText>Second tab screen</ThemedText>
    </ThemedView>
  );
}
