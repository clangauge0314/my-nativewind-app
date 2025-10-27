import { ThemedText } from '@/components/themed-text';
import { Todo, useTodoStore } from '@/stores/todo-store';
import { Activity, Calendar, Check, Clock } from 'lucide-react-native';
import { View } from 'react-native';

interface TodoListViewProps {
  selectedDate: string;
}

export function TodoListView({ selectedDate }: TodoListViewProps) {
  const { getTodosByDate } = useTodoStore();
  
  const todos = getTodosByDate(selectedDate);

  const getTypeIcon = (type: Todo['type']) => {
    const iconColor = '#6b7280';
    switch (type) {
      case 'a1c':
        return <Activity size={18} color={iconColor} />;
      case 'blood_pressure':
        return <Activity size={18} color={iconColor} />;
      case 'blood_sugar':
        return <Activity size={18} color={iconColor} />;
      case 'medication':
        return <Clock size={18} color={iconColor} />;
      default:
        return <Calendar size={18} color={iconColor} />;
    }
  };

  const getTypeLabel = (type: Todo['type']) => {
    switch (type) {
      case 'a1c':
        return 'A1C Test';
      case 'blood_pressure':
        return 'Blood Pressure';
      case 'blood_sugar':
        return 'Blood Sugar';
      case 'medication':
        return 'Medication';
      default:
        return 'Other';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  };

  if (!selectedDate) {
    return (
      <View
        className="rounded-3xl p-6 mb-6"
        style={{
          backgroundColor: '#f8fafc',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        <ThemedText className="text-center opacity-60">
          Select a date to view schedule
        </ThemedText>
      </View>
    );
  }

  if (todos.length === 0) {
    return (
      <View
        className="rounded-3xl p-6 mb-6"
        style={{
          backgroundColor: '#f8fafc',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        <View className="items-center">
          <Calendar size={32} color={'#9ca3af'} />
          <ThemedText className="text-center mt-3 opacity-60">
            No schedule for {formatDate(selectedDate)}
          </ThemedText>
        </View>
      </View>
    );
  }

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
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <ThemedText className="text-lg font-bold">
          Schedule
        </ThemedText>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          <ThemedText className="text-xs font-semibold">
            {formatDate(selectedDate)}
          </ThemedText>
        </View>
      </View>

      {/* Todo Items */}
      <View style={{ gap: 12 }}>
        {todos.map((todo) => (
          <View
            key={todo.id}
            className="flex-row items-center p-4 rounded-2xl"
            style={{
              backgroundColor: todo.completed
                ? ('#f3f4f6')
                : '#ffffff',
              borderWidth: 1,
              borderColor: todo.completed
                ? '#d1d5db'
                : '#2563eb',
            }}
          >
            {/* Check Icon */}
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor: todo.completed ? '#2563eb' : '#eff6ff',
              }}
            >
              {todo.completed ? (
                <Check size={20} color="#ffffff" />
              ) : (
                getTypeIcon(todo.type)
              )}
            </View>

            {/* Content */}
            <View className="flex-1">
              <ThemedText
                className="text-base font-semibold mb-1"
                style={{
                  textDecorationLine: todo.completed ? 'line-through' : 'none',
                  opacity: todo.completed ? 0.6 : 1,
                }}
              >
                {todo.title}
              </ThemedText>
              <View className="flex-row items-center">
                <ThemedText
                  className="text-xs"
                  style={{
                    color: '#2563eb',
                    fontWeight: '600',
                  }}
                >
                  {getTypeLabel(todo.type)}
                </ThemedText>
                {todo.notes && (
                  <>
                    <ThemedText className="text-xs mx-2" style={{ opacity: 0.5 }}>
                      •
                    </ThemedText>
                    <ThemedText
                      className="text-xs flex-1"
                      style={{ opacity: 0.7 }}
                      numberOfLines={1}
                    >
                      {todo.notes}
                    </ThemedText>
                  </>
                )}
              </View>
            </View>

            {/* Status Badge */}
            {todo.completed && (
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <ThemedText className="text-xs font-semibold" style={{ color: '#16a34a' }}>
                  Done
                </ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Footer Note */}
      <ThemedText className="text-xs text-center mt-4" style={{ opacity: 0.5 }}>
        View only • Manage in Schedule tab
      </ThemedText>
    </View>
  );
}

