import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Todo {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  type: 'a1c' | 'blood_pressure' | 'blood_sugar' | 'medication' | 'other';
  completed: boolean;
  notes?: string;
  createdAt: number;
}

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  getTodosByDate: (date: string) => Todo[];
  getDatesWithTodos: () => string[];
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      
      addTodo: (todo) => {
        const newTodo: Todo = {
          ...todo,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };
        set((state) => ({ todos: [...state.todos, newTodo] }));
      },
      
      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        }));
      },
      
      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },
      
      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        }));
      },
      
      getTodosByDate: (date) => {
        return get().todos.filter((todo) => todo.date === date);
      },
      
      getDatesWithTodos: () => {
        return [...new Set(get().todos.map((todo) => todo.date))];
      },
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

