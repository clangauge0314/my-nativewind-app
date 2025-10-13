module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        // Expo Router를 사용하는 경우 jsxImportSource 추가
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel", // NativeWind Babel 프리셋 추가
      ],
    };
  };