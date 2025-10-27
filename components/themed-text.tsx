import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  // Tailwind 클래스 매핑
  const typeClassName = {
    default: 'text-base leading-6 text-gray-900',
    defaultSemiBold: 'text-base leading-6 font-semibold text-gray-900',
    title: 'text-3xl font-bold leading-8 text-gray-900',
    subtitle: 'text-xl font-bold text-gray-900',
    link: 'text-base leading-7 text-blue-600',
  }[type];

  const combinedClassName = `${typeClassName} ${className || ''}`.trim();

  return (
    <Text
      className={combinedClassName}
      style={[{ color: '#11181C' }, style]}
      {...rest}
    />
  );
}