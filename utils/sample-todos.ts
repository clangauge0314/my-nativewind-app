import { useTodoStore } from '@/stores/todo-store';

export const addSampleTodos = () => {
  const { addTodo } = useTodoStore.getState();
  
  // Get today's date in Korea timezone
  const getKoreaDate = (daysOffset: number = 0) => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    koreaTime.setUTCDate(koreaTime.getUTCDate() + daysOffset);
    return koreaTime.toISOString().split('T')[0];
  };

  // Sample A1C tests
  addTodo({
    title: 'A1C Blood Test',
    date: getKoreaDate(0), // Today
    type: 'a1c',
    completed: false,
    notes: 'Quarterly checkup at hospital',
  });

  addTodo({
    title: 'A1C Test - Follow Up',
    date: getKoreaDate(7), // Next week
    type: 'a1c',
    completed: false,
    notes: 'Review results with doctor',
  });

  addTodo({
    title: 'A1C Test Results',
    date: getKoreaDate(-7), // Last week
    type: 'a1c',
    completed: true,
    notes: 'Result: 6.2% - Good control',
  });

  // Blood pressure check
  addTodo({
    title: 'Blood Pressure Check',
    date: getKoreaDate(2),
    type: 'blood_pressure',
    completed: false,
    notes: 'Morning measurement',
  });

  // Blood sugar monitoring
  addTodo({
    title: 'Fasting Blood Sugar',
    date: getKoreaDate(0),
    type: 'blood_sugar',
    completed: false,
    notes: 'Before breakfast',
  });

  addTodo({
    title: 'Blood Sugar Check',
    date: getKoreaDate(1),
    type: 'blood_sugar',
    completed: false,
    notes: '2 hours after lunch',
  });

  // Medication reminders
  addTodo({
    title: 'Take Metformin',
    date: getKoreaDate(0),
    type: 'medication',
    completed: true,
    notes: '500mg with breakfast',
  });

  addTodo({
    title: 'Evening Medication',
    date: getKoreaDate(3),
    type: 'medication',
    completed: false,
    notes: 'After dinner',
  });
};

