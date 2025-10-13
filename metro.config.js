const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro'); // NativeWind 임포트

const config = getDefaultConfig(__dirname);

// NativeWind Transformer를 사용하여 기본 config 래핑
module.exports = withNativeWind(config, {
  input: './global.css' // 전역 CSS 파일 경로 지정
})