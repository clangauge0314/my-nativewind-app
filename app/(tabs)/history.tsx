import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { InsulinPredictionRecord } from '@/types/health-record';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown, ChevronUp, Clock, Droplet, History } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [records, setRecords] = useState<InsulinPredictionRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [datesWithRecords, setDatesWithRecords] = useState<Set<string>>(new Set());
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const insets = useSafeAreaInsets();

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  // Fetch all records to mark dates on calendar
  const fetchAllRecordDates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('insulin_prediction_records')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const dates = new Set(
          data.map((record) => {
            const date = new Date(record.created_at);
            return date.toISOString().split('T')[0];
          })
        );
        setDatesWithRecords(dates);
      }
    } catch (error) {
      console.error('Error fetching record dates:', error);
    }
  }, [user]);

  // Fetch records for selected date
  const fetchRecordsForDate = useCallback(async (date: string) => {
    if (!user) return;

    setLoadingRecords(true);
    try {
      // Get start and end of the selected day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('insulin_prediction_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching records:', error);
      Alert.alert('Error', 'Failed to load health records. Please try again.');
    } finally {
      setLoadingRecords(false);
    }
  }, [user]);

  // Load all record dates when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchAllRecordDates();
    }
  }, [user, fetchAllRecordDates]);

  // Load records when date is selected
  useEffect(() => {
    if (selectedDate && user) {
      fetchRecordsForDate(selectedDate);
    } else {
      setRecords([]);
    }
  }, [selectedDate, user, fetchRecordsForDate]);

  // Handle date selection
  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    setExpandedRecords(new Set()); // Reset expanded records when date changes
  }, []);

  // Toggle record expansion
  const toggleRecordExpansion = useCallback((recordId: string) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  }, []);

  // Marked dates configuration
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Mark all dates with records
    datesWithRecords.forEach((date) => {
      marks[date] = {
        marked: true,
        dotColor: '#10b981',
      };
    });
    
    // Mark today with a blue circle
    marks[today] = {
      ...marks[today],
      selected: true,
      selectedColor: '#3b82f6',
      selectedTextColor: '#ffffff',
    };
    
    // If a different date is selected, mark it with a different color
    if (selectedDate && selectedDate !== today) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#2563eb',
        selectedTextColor: '#ffffff',
      };
      // Keep today marked but with a different style
      marks[today] = {
        ...marks[today],
        marked: true,
        dotColor: '#3b82f6',
        selected: false,
      };
    }
    
    return marks;
  }, [today, selectedDate, datesWithRecords]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  const androidNavBarHeight = Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom : 48) : 0;
  const tabBarHeight = (Platform.OS === 'ios' ? 88 : 68) + androidNavBarHeight;

  if (!user) {
    return (
      <PageLoader isLoading={isLoading} minDuration={500}>
        <ThemedView className="flex-1 justify-center items-center p-8" style={{ paddingBottom: tabBarHeight + 20}}>
          <History size={64} color={'#9ca3af'} />
          <ThemedText className="text-2xl font-bold mt-8 text-center">
            Insulin Injection History
          </ThemedText>
          <ThemedText className="text-base text-center mt-4 opacity-70">
            Log in to view your insulin injection history and track your progress
          </ThemedText>
        </ThemedView>
      </PageLoader>
    );
  }

  return (
    <PageLoader isLoading={isLoading} minDuration={500}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView className="flex-1 px-8" style={{ paddingTop: insets.top + 20, marginTop: 20}}>
          <View className="mb-6">
            <ThemedText 
              className="font-bold"
              style={{ fontSize: 20, lineHeight: 40 }}
            >
              Insulin Injection History
            </ThemedText>
            <ThemedText 
              className="opacity-60"
              style={{ fontSize: 13, marginTop: 2, lineHeight: 24 }}
            >
              Track your insulin injection progress and manage your schedule
            </ThemedText>
          </View>

          {/* Calendar Section */}
          <View className="mb-6 bg-white rounded-2xl border border-gray-200 overflow-hidden" 
                style={{
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
            <Calendar
              current={today}
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#64748b',
                selectedDayBackgroundColor: '#3b82f6',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#3b82f6',
                dayTextColor: '#1e293b',
                textDisabledColor: '#cbd5e1',
                dotColor: '#3b82f6',
                selectedDotColor: '#ffffff',
                arrowColor: '#3b82f6',
                monthTextColor: '#1e293b',
                indicatorColor: '#3b82f6',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 12,
              }}
              style={{
                borderRadius: 16,
                padding: 10,
              }}
              hideExtraDays={true}
              enableSwipeMonths={true}
            />
            {selectedDate && (
              <View className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                <ThemedText className="text-sm text-blue-900 font-semibold">
                  Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </ThemedText>
              </View>
            )}
          </View>
          
          {/* History Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText className="text-xl font-bold">
                {selectedDate ? `History for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'History'}
              </ThemedText>
              {selectedDate && records.length > 0 && (
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <ThemedText className="text-xs font-semibold text-blue-900">
                    {records.length} {records.length === 1 ? 'record' : 'records'}
                  </ThemedText>
                </View>
              )}
            </View>

            {loadingRecords ? (
              <View className="p-8 bg-white rounded-2xl border border-gray-200 items-center justify-center"
                    style={{
                      shadowColor: '#2563eb',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <ThemedText className="text-gray-600 mt-4">Loading records...</ThemedText>
              </View>
            ) : !selectedDate ? (
              <View className="p-6 bg-white rounded-2xl border border-gray-200"
                    style={{
                      shadowColor: '#2563eb',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}>
                <View className="p-4 bg-gray-50 rounded-lg">
                  <ThemedText className="text-center text-gray-600">
                    Select a date to view health history
                  </ThemedText>
                </View>
              </View>
            ) : records.length === 0 ? (
              <View className="p-6 bg-white rounded-2xl border border-gray-200"
                    style={{
                      shadowColor: '#2563eb',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}>
                <View className="p-4 bg-gray-50 rounded-lg">
                  <ThemedText className="text-center text-gray-600">
                    No health records found for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </ThemedText>
                </View>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {records.map((record) => {
                  const isExpanded = expandedRecords.has(record.id);
                  
                  return (
                    <View
                      key={record.id}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                      style={{
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      {/* Header - Touchable */}
                      <TouchableOpacity
                        onPress={() => toggleRecordExpansion(record.id)}
                        activeOpacity={0.7}
                      >
                        <View className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <View className="bg-blue-500 rounded-full p-2 mr-3">
                                <Droplet size={18} color="#ffffff" />
                              </View>
                              <View className="flex-1">
                                <ThemedText className="font-bold text-blue-900" style={{ fontSize: 16 }}>
                                  {record.meal_type.charAt(0).toUpperCase() + record.meal_type.slice(1)}
                                </ThemedText>
                                <View className="flex-row items-center mt-1">
                                  <Clock size={12} color="#64748b" />
                                  <ThemedText className="text-xs text-gray-600 ml-1">
                                    {new Date(record.created_at).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </ThemedText>
                                </View>
                              </View>
                            </View>
                            <View className="flex-row items-center" style={{ gap: 8 }}>
                              <View className={`px-3 py-1 rounded-full ${record.insulin_injected ? 'bg-green-100' : 'bg-red-100'}`}>
                                <ThemedText className={`text-xs font-semibold ${record.insulin_injected ? 'text-green-900' : 'text-red-900'}`}>
                                  {record.insulin_injected ? 'Injected' : 'Not Injected'}
                                </ThemedText>
                              </View>
                              <View className="bg-blue-200 rounded-full p-1">
                                {isExpanded ? (
                                  <ChevronUp size={16} color="#1e40af" />
                                ) : (
                                  <ChevronDown size={16} color="#1e40af" />
                                )}
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Main Info - Collapsible */}
                      {isExpanded && (
                        <View className="px-5 py-4">
                          {/* Total Insulin - Highlighted */}
                          <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                            <ThemedText className="text-xs text-blue-600 font-semibold mb-1">
                              TOTAL INSULIN DOSE
                            </ThemedText>
                            <ThemedText className="text-3xl font-bold text-blue-900">
                              {record.total_insulin} <ThemedText className="text-lg text-blue-600">units</ThemedText>
                            </ThemedText>
                          </View>

                          {/* Grid Info */}
                          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                            {/* Blood Glucose */}
                            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
                              <ThemedText className="text-xs text-gray-500 mb-1">Blood Glucose</ThemedText>
                              <ThemedText className="text-lg font-bold text-gray-900">
                                {record.current_glucose} <ThemedText className="text-xs text-gray-500">mg/dL</ThemedText>
                              </ThemedText>
                            </View>

                            {/* Carbohydrates */}
                            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
                              <ThemedText className="text-xs text-gray-500 mb-1">Carbohydrates</ThemedText>
                              <ThemedText className="text-lg font-bold text-gray-900">
                                {record.carbohydrates} <ThemedText className="text-xs text-gray-500">g</ThemedText>
                              </ThemedText>
                            </View>

                            {/* Target Glucose */}
                            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
                              <ThemedText className="text-xs text-gray-500 mb-1">Target Glucose</ThemedText>
                              <ThemedText className="text-lg font-bold text-gray-900">
                                {record.target_glucose} <ThemedText className="text-xs text-gray-500">mg/dL</ThemedText>
                              </ThemedText>
                            </View>

                            {/* Timer Duration */}
                            <View className="flex-1 bg-gray-50 rounded-lg p-3 min-w-[45%]">
                              <ThemedText className="text-xs text-gray-500 mb-1">Timer Duration</ThemedText>
                              <ThemedText className="text-lg font-bold text-gray-900">
                                {record.timer_duration_minutes} <ThemedText className="text-xs text-gray-500">min</ThemedText>
                              </ThemedText>
                            </View>
                          </View>

                          {/* Calculation Breakdown */}
                          <View className="mt-4 pt-4 border-t border-gray-200">
                            <ThemedText className="text-xs text-gray-500 font-semibold mb-3">CALCULATION BREAKDOWN</ThemedText>
                            <View style={{ gap: 6 }}>
                              <View className="flex-row justify-between items-center">
                                <ThemedText className="text-sm text-gray-600">Carb Insulin</ThemedText>
                                <ThemedText className="text-sm font-semibold text-gray-900">{record.carb_insulin}u</ThemedText>
                              </View>
                              <View className="flex-row justify-between items-center">
                                <ThemedText className="text-sm text-gray-600">Correction Insulin</ThemedText>
                                <ThemedText className="text-sm font-semibold text-gray-900">{record.correction_insulin}u</ThemedText>
                              </View>
                              <View className="h-px bg-gray-200 my-1" />
                              <View className="flex-row justify-between items-center">
                                <ThemedText className="text-sm font-bold text-gray-900">Total</ThemedText>
                                <ThemedText className="text-sm font-bold text-blue-600">{record.total_insulin}u</ThemedText>
                              </View>
                            </View>
                          </View>

                          {/* Notes */}
                          {record.notes && (
                            <View className="mt-4 pt-4 border-t border-gray-200">
                              <ThemedText className="text-xs text-gray-500 font-semibold mb-2">NOTES</ThemedText>
                              <ThemedText className="text-sm text-gray-700">{record.notes}</ThemedText>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </PageLoader>
  );
}
