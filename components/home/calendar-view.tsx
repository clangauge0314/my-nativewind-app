import { useTodoStore } from '@/stores/todo-store';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { ThemedText } from '../themed-text';

type ViewMode = 'week' | 'month';

interface CalendarViewProps {
  onDateSelect?: (date: string) => void;
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const calendarOpacity = useSharedValue(1);
  const [renderKey, setRenderKey] = useState(0); // Force re-render
  const { getTodosByDate, getDatesWithTodos } = useTodoStore();

  // Get today's date in YYYY-MM-DD format (Korea timezone)
  const getTodayString = () => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  };

  const today = getTodayString();

  // Get current week dates
  const getWeekDates = (date: Date) => {
    const koreaDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const day = koreaDate.getUTCDay();
    const diff = koreaDate.getUTCDate() - day; // Sunday as first day
    const sunday = new Date(Date.UTC(koreaDate.getUTCFullYear(), koreaDate.getUTCMonth(), diff));
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(sunday);
      current.setUTCDate(sunday.getUTCDate() + i);
      dates.push(current);
    }
    return dates;
  };

  // Get current month dates
  const getMonthDates = (date: Date) => {
    const koreaDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const year = koreaDate.getUTCFullYear();
    const month = koreaDate.getUTCMonth();
    
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const startDay = firstDay.getUTCDay(); // Sunday start
    const daysInMonth = lastDay.getUTCDate();

    const dates: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let i = startDay - 1; i >= 0; i--) {
      dates.push({
        date: new Date(Date.UTC(year, month - 1, prevMonthLastDay - i)),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        date: new Date(Date.UTC(year, month, i)),
        isCurrentMonth: true,
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - dates.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({
        date: new Date(Date.UTC(year, month + 1, i)),
        isCurrentMonth: false,
      });
    }

    return dates;
  };

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(currentDate);
  const displayDates = viewMode === 'week' ? weekDates.map(d => ({ date: d, isCurrentMonth: true })) : monthDates;

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToggle = () => {
    const newMode = viewMode === 'week' ? 'month' : 'week';
    
    // Fade out
    calendarOpacity.value = withTiming(0, { 
      duration: 200, 
      easing: Easing.ease 
    });
    
    // After fade out, change view mode and fade in
    setTimeout(() => {
      setViewMode(newMode);
      setRenderKey(prev => prev + 1); // Force complete re-render
      calendarOpacity.value = withTiming(1, { 
        duration: 300, 
        easing: Easing.ease 
      });
    }, 200);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: calendarOpacity.value,
  }));

  const getHeaderText = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const koreaDate = new Date(currentDate.getTime() + (9 * 60 * 60 * 1000));
    
    if (viewMode === 'week') {
      const first = weekDates[0];
      const last = weekDates[6];
      const firstKorea = new Date(first.getTime() + (9 * 60 * 60 * 1000));
      const lastKorea = new Date(last.getTime() + (9 * 60 * 60 * 1000));
      return `${monthNames[firstKorea.getUTCMonth()]} ${firstKorea.getUTCDate()} - ${monthNames[lastKorea.getUTCMonth()]} ${lastKorea.getUTCDate()}, ${firstKorea.getUTCFullYear()}`;
    } else {
      return `${monthNames[koreaDate.getUTCMonth()]} ${koreaDate.getUTCFullYear()}`;
    }
  };

  const isSameDay = (date1: Date, date2: string) => {
    const koreaDate = new Date(date1.getTime() + (9 * 60 * 60 * 1000));
    const dateString = koreaDate.toISOString().split('T')[0];
    return dateString === date2;
  };

  const handleDatePress = (date: Date) => {
    const koreaDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const dateString = koreaDate.toISOString().split('T')[0];
    setSelectedDate(dateString);
    if (onDateSelect) {
      onDateSelect(dateString);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Render a single date cell
  const renderDateCell = (dayInfo: { date: Date; isCurrentMonth: boolean }, dayIndex: number) => {
    const isToday = isSameDay(dayInfo.date, today);
    const isSelected = selectedDate && isSameDay(dayInfo.date, selectedDate);
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const koreaDate = new Date(dayInfo.date.getTime() + (9 * 60 * 60 * 1000));
    const dateString = koreaDate.toISOString().split('T')[0];
    const hasTodos = getDatesWithTodos().includes(dateString);
    const todosForDate = getTodosByDate(dateString);
    
    // Show blue background only if selected, OR if it's today AND not selected yet
    const showBlueBackground = isSelected || (isToday && !selectedDate);

    return (
      <Pressable
        onPress={() => handleDatePress(dayInfo.date)}
        style={{
          minWidth: 44,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: showBlueBackground ? '#2563eb' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: showBlueBackground
                ? '#ffffff'
                : !dayInfo.isCurrentMonth
                ? ('#d1d5db')
                : isWeekend
                ? '#ef4444'
                : ('#1f2937')
            }}
          >
            {koreaDate.getUTCDate()}
          </ThemedText>
          
          {/* Todo indicator dots */}
          {hasTodos && (
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                flexDirection: 'row',
                gap: 2,
              }}
            >
              {todosForDate.slice(0, 3).map((todo, idx) => (
                <View
                  key={idx}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: showBlueBackground ? '#ffffff' : '#2563eb',
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View
      className="rounded-3xl p-6 mb-6"
      style={{
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {/* Custom Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          {/* Previous Button */}
          <Pressable
            onPress={handlePrevious}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? ('#e5e7eb')
                : ('#f3f4f6'),
            })}
          >
            <ChevronLeft size={20} color={'#6b7280'} />
          </Pressable>

          {/* Date Text */}
          <ThemedText className="text-base font-bold flex-1 text-center">
            {getHeaderText()}
          </ThemedText>

          {/* Next Button */}
          <Pressable
            onPress={handleNext}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? ('#e5e7eb')
                : ('#f3f4f6'),
            })}
          >
            <ChevronRight size={20} color={'#6b7280'} />
          </Pressable>
        </View>

        {/* Toggle Button */}
        <Pressable
          onPress={handleToggle}
          className="w-10 h-10 rounded-full items-center justify-center ml-3"
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
          })}
        >
          {viewMode === 'week' ? (
            <ChevronDown size={18} color="#000000" />
          ) : (
            <ChevronUp size={18} color="#000000" />
          )}
        </Pressable>
      </View>

      {/* Day Names */}
      <View className="flex-row justify-between mb-3">
        {dayNames.map((day, index) => (
          <View 
            key={index} 
            className="items-center justify-center"
            style={{ minWidth: 44, flex: 1 }}
          >
            <ThemedText
              className="text-xs font-bold"
              style={{
                color: index === 0 || index === 6
                  ? '#ef4444'
                  : ('#4b5563')
              }}
            >
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar Grid - Force complete re-render with key */}
      <Animated.View key={`calendar-${viewMode}-${renderKey}`} style={animatedStyle}>
        {Array.from({ length: Math.ceil(displayDates.length / 7) }).map((_, weekIndex) => (
          <View key={`week-${weekIndex}`} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            {displayDates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayInfo, dayIndex) => (
              <View key={`day-${weekIndex}-${dayIndex}`} style={{ flex: 1 }}>
                {renderDateCell(dayInfo, dayIndex)}
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
