import { useMemo } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 기준 디바이스 크기 (iPhone 12 기준)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// 화면 크기 기반 스케일 팩터
const scale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

// 폰트 크기 조정 (PixelRatio 고려)
const fontScale = PixelRatio.getFontScale();

export function useResponsive() {
  // 메모이제이션된 화면 크기 분류
  const screenSize = useMemo(() => {
    if (SCREEN_WIDTH < 375) return 'small'; // iPhone SE, 작은 폰
    if (SCREEN_WIDTH < 414) return 'medium'; // iPhone 12, 13
    if (SCREEN_WIDTH < 480) return 'large'; // iPhone 12/13 Pro Max
    return 'xlarge'; // 태블릿, 큰 화면
  }, []);

  // 메모이제이션된 반응형 함수들
  const responsiveSize = useMemo(() => (size: number) => {
    return Math.round(size * scale);
  }, []);

  const responsiveHeight = useMemo(() => (height: number) => {
    return Math.round(height * verticalScale);
  }, []);

  const responsiveFontSize = useMemo(() => (fontSize: number) => {
    const scaledSize = fontSize * scale;
    const adjustedSize = scaledSize / fontScale;
    return Math.max(12, Math.round(adjustedSize)); // 최소 12px
  }, []);

  const responsiveSpacing = useMemo(() => (spacing: number) => {
    return Math.round(spacing * scale);
  }, []);

  const responsiveIconSize = useMemo(() => (size: number) => {
    return Math.round(size * scale);
  }, []);

  const responsiveBorderRadius = useMemo(() => (radius: number) => {
    return Math.round(radius * scale);
  }, []);

  // 메모이제이션된 화면 크기별 컴포넌트 간격 조정
  const getComponentSpacing = useMemo(() => {
    switch (screenSize) {
      case 'small':
        return { margin: 12, padding: 16 };
      case 'medium':
        return { margin: 16, padding: 20 };
      case 'large':
        return { margin: 20, padding: 24 };
      case 'xlarge':
        return { margin: 24, padding: 28 };
      default:
        return { margin: 16, padding: 20 };
    }
  }, [screenSize]);

  // 메모이제이션된 화면 크기별 폰트 크기 조정
  const getFontSizes = useMemo(() => {
    switch (screenSize) {
      case 'small':
        return { 
          xs: 10, sm: 12, base: 14, lg: 16, xl: 18, 
          '2xl': 20, '3xl': 24, '4xl': 28 
        };
      case 'medium':
        return { 
          xs: 11, sm: 13, base: 15, lg: 17, xl: 19, 
          '2xl': 21, '3xl': 25, '4xl': 30 
        };
      case 'large':
        return { 
          xs: 12, sm: 14, base: 16, lg: 18, xl: 20, 
          '2xl': 22, '3xl': 26, '4xl': 32 
        };
      case 'xlarge':
        return { 
          xs: 13, sm: 15, base: 17, lg: 19, xl: 21, 
          '2xl': 23, '3xl': 27, '4xl': 34 
        };
      default:
        return { 
          xs: 11, sm: 13, base: 15, lg: 17, xl: 19, 
          '2xl': 21, '3xl': 25, '4xl': 30 
        };
    }
  }, [screenSize]);

  return {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    scale,
    verticalScale,
    fontScale,
    screenSize,
    responsiveSize,
    responsiveHeight,
    responsiveFontSize,
    responsiveSpacing,
    responsiveIconSize,
    responsiveBorderRadius,
    getComponentSpacing,
    getFontSizes,
  };
}
