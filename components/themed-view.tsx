import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  className?: string;
};

export function ThemedView({ 
  style, 
  className,
  ...otherProps 
}: ThemedViewProps) {
  return (
    <View 
      className={className} 
      style={[{ backgroundColor: '#ffffff' }, style]} 
      {...otherProps} 
    />
  );
}