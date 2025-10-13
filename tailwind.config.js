/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: NativeWind 클래스가 포함된 모든 파일의 경로를 업데이트해야 합니다.
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")], // NativeWind 프리셋 추가
  theme: {
    extend: {},
  },
  plugins: [],
};