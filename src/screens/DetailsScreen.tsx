// src/screens/AddHabitScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeModules } from 'react-native';

const { AppBlockerModule } = NativeModules;

const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const AddHabitScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('sunday');
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

  const handleAddHabit = async (): Promise<void> => {
    if (!name) return;

    const formattedTime = time.toTimeString().slice(0, 5);

    try {
      const schedule = await AppBlockerModule.getSchedule();
      const updatedSchedule = {
        ...JSON.parse(schedule),
        [selectedDay]: [
          ...(JSON.parse(schedule)[selectedDay] || []),
          { time: formattedTime, accomplished: false, name },
        ],
      };

      await AppBlockerModule.updateSchedule(JSON.stringify(updatedSchedule));
      setName('');
      setTime(new Date());
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  return (
      <SafeAreaView className="flex-1 p-4 bg-rich-900">
        <Text className="text-2xl font-bold text-alice mb-4">Adicionar Hábito</Text>
        <Text className="text-lg mb-2 text-alice">Selecione um Dia:</Text>
        <View className="flex-row mb-4">
          {DAYS_OF_WEEK.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              className={`m-1 px-2 py-1 rounded-lg ${selectedDay === day ? 'bg-celadon-500' : 'bg-rich-700'}`}
            >
              <Text className={selectedDay === day ? 'text-alice' : 'text-alice'}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-lg mb-2 text-alice">Nome do Hábito:</Text>
        <TextInput
          className="border p-2 mb-4 rounded-lg bg-rich-700 text-alice"
          value={name}
          onChangeText={setName}
          placeholder="Ex: Treinar"
          placeholderTextColor="alice-200"
        />
        <Text className="text-lg mb-2 text-alice">Selecione o Horário:</Text>
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          className="border p-2 mb-4 rounded-lg bg-rich-700 text-alice"
        >
          <Text>{time.toTimeString().slice(0, 5)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                setTime(selectedDate);
              }
            }}
          />
        )}
        <TouchableOpacity
          onPress={handleAddHabit}
          className="bg-celadon-500 p-3 rounded-lg items-center"
        >
          <Text className="text-rich-500 font-bold">Adicionar Hábito</Text>
        </TouchableOpacity>
      </SafeAreaView>
  );
};

export default AddHabitScreen;
