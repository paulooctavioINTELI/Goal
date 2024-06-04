// src/navigation/types.ts

export type RootStackParamList = {
  PhoneNumber: undefined;
  Main: undefined;
  SelectDays: undefined;
  ConfigureTime: { selectedDays: string[], habitName: string };
  AdjustSpecificDays: { selectedDays: string[], habitName: string, periodicTime: string, fixedTimes: string[] };
  Habits: undefined;
};

export type MainTabParamList = {
  Habits: undefined;
  Details: undefined;
  Profile: undefined;
};

export interface Task {
  time: string;
  accomplished: boolean;
  name: string;
}

export interface Schedule {
  [key: string]: Task[];
}

export interface TaskWithDay extends Task {
  day: string;
}
