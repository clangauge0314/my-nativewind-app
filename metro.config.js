const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// .lottie 및 .json 파일 asset으로 인식
config.resolver.assetExts.push('lottie', 'json');

// NativeWind Transformer를 사용하여 기본 config 래핑
module.exports = withNativeWind(config, {
  input: './global.css'
})