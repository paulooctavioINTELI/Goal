// src/screens/ConfigureTimeScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import Icon from 'react-native-vector-icons/Ionicons';

type ConfigureTimeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ConfigureTime'
>;

type ConfigureTimeScreenRouteProp = RouteProp<RootStackParamList, 'ConfigureTime'>;

const ConfigureTimeScreen: React.FC = () => {
  const [periodicTime, setPeriodicTime] = useState<string>('00:00');
  const [fixedTimes, setFixedTimes] = useState<string[]>([]);
  const [periodStartTime, setPeriodStartTime] = useState<Date | null>(null);
  const [periodEndTime, setPeriodEndTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showIntervalPicker, setShowIntervalPicker] = useState<boolean>(false); // Estado para controlar a exibição do seletor de intervalo
  const [currentFixedTime, setCurrentFixedTime] = useState<Date>(new Date());
  const [selectedMode, setSelectedMode] = useState<string>('fixed');
  const [isStartPicker, setIsStartPicker] = useState<boolean>(true); // Estado para controlar o início e o fim
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const navigation = useNavigation<ConfigureTimeScreenNavigationProp>();
  const route = useRoute<ConfigureTimeScreenRouteProp>();
  const { selectedDays, habitName } = route.params;

  const handleNext = () => {
    let times = fixedTimes;
    if (selectedMode === 'periodic' && periodStartTime && periodEndTime) {
      const [hours, minutes] = periodicTime.split(':').map(Number);
      times = calculatePeriodicTimes(periodStartTime, periodEndTime, { hours, minutes });
    }
    navigation.navigate('AdjustSpecificDays', { selectedDays, habitName, periodicTime, fixedTimes: times });
  };

  const addFixedTime = (selectedDate: Date) => {
    const formattedTime = selectedDate.toTimeString().slice(0, 5);
    if (editIndex !== null) {
      const updatedTimes = [...fixedTimes];
      updatedTimes[editIndex] = formattedTime;
      setFixedTimes(updatedTimes);
      setEditIndex(null);
    } else if (!fixedTimes.includes(formattedTime)) {
      setFixedTimes((prevTimes) => [...prevTimes, formattedTime]);
    }
  };

  const editFixedTime = (index: number) => {
    setCurrentFixedTime(new Date(`1970-01-01T${fixedTimes[index]}:00`));
    setEditIndex(index);
    setShowTimePicker(true);
  };

  const deleteFixedTime = (index: number) => {
    setFixedTimes((prevTimes) => prevTimes.filter((_, i) => i !== index));
  };

  const calculatePeriodicTimes = (start: Date, end: Date, interval: { hours: number, minutes: number }) => {
    const times = [];
    let currentTime = new Date(start);

    while (currentTime <= end) {
      times.push(currentTime.toTimeString().slice(0, 5));
      currentTime.setHours(currentTime.getHours() + interval.hours);
      currentTime.setMinutes(currentTime.getMinutes() + interval.minutes);
    }

    return times;
  };

  const renderModeButton = (label: string, mode: string) => (
    <TouchableOpacity
      onPress={() => setSelectedMode(mode)}
      className={`p-2 rounded-lg ${
        selectedMode === mode ? 'bg-celadon-500' : 'bg-transparent border-celadon'
      } border`}
    >
      <Text className={`font-bold ${selectedMode === mode ? 'text-alice' : 'text-celadon'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 p-7 bg-rich-900">
      <Text className="text-4xl font-bold text-alice mb-24 bg-transparent">
        {habitName}
      </Text>
      <Text className="text-lg font-bold mb-4 text-alice">{selectedMode === 'fixed' ? "Qual horário de seu novo hábito?" : "Qual é o intervalo diário e a frequência do hábito?"}</Text>
      <View className="flex-row mb-4 justify-center gap-1">
        {renderModeButton('Periódico', 'periodic')}
        {renderModeButton('Horário fixo', 'fixed')}
      </View>
      {selectedMode === 'periodic' && (
        <View className='justify-center items-center'>
          <View className="flex-row mb-4 mt-4">
            <TouchableOpacity
              onPress={() => { setShowTimePicker(true); setIsStartPicker(true); }}
              className="border items-center gap-2 flex-row py-2 px-4 rounded-lg bg-transparent text-alice"
            >
              <Text className='text-lg font-bold text-alice'>De</Text>
              <View className="border px-2 py-1 rounded-lg bg-rich text-alice">
                <Text className="text-alice text-lg">{periodStartTime ? periodStartTime.toTimeString().slice(0, 5) : "00:00"}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setShowTimePicker(true); setIsStartPicker(false); }}
              className="flex-row items-center gap-2 py-2 px-4 rounded-lg bg-transparent text-alice ml-2"
            >
              <Text className='text-lg font-bold text-alice'>Até</Text>
              <View className="border px-2 py-1 rounded-lg bg-rich text-alice">
                <Text className="text-alice text-lg">{periodEndTime ? periodEndTime.toTimeString().slice(0, 5) : "00:00"}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={() => setShowIntervalPicker(true)}
              className="border py-2 px-4 rounded-lg bg-transparent border-celadon text-alice"
            >
              <Text className="text-celadon">{periodicTime ? `A cada ${periodicTime}` : "Selecionar Intervalo"}</Text>
            </TouchableOpacity>
            {showIntervalPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowIntervalPicker(false);
                  if (selectedDate) {
                    const hours = selectedDate.getHours().toString().padStart(2, '0');
                    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                    setPeriodicTime(`${hours}:${minutes}`);
                  }
                }}
              />
            )}
          </View>
        </View>
      )}
      {selectedMode === 'fixed' && (
        <>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-col items-center">
            <View className="flex-row justify-center mb-4">
              <View className="border px-4 py-3 rounded-lg bg-rich text-alice">
                <Text className="text-alice text-2xl">{currentFixedTime.toTimeString().slice(0, 5)}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="bg-alice h-[1px] flex-1"/>
              <Icon name="add-circle-outline" size={24} className="text-alice mx-2"/>
              <View className="bg-alice h-[1px] flex-1"/>
            </View>
          </TouchableOpacity>
          <View className="mt-4">
            {fixedTimes.map((time, index) => (
              <View key={index} className="m-1 px-2 py-1 rounded-lg bg-rich flex-row justify-between items-center">
                <Text className="text-alice text-2xl">{time}</Text>
                <View className="flex-row">
                  <TouchableOpacity onPress={() => editFixedTime(index)} className="mr-2">
                    <Icon name="create-outline" size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteFixedTime(index)}>
                    <Icon name="trash-outline" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      {showTimePicker && (
        <DateTimePicker
          value={currentFixedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setCurrentFixedTime(selectedDate);
              if (selectedMode === 'fixed') {
                addFixedTime(selectedDate);
              } else {
                if (isStartPicker) {
                  setPeriodStartTime(selectedDate);
                } else {
                  setPeriodEndTime(selectedDate);
                }
              }
            }
          }}
        />
      )}
      <View className='w-full flex-row justify-end mt-20'>
        <TouchableOpacity
          onPress={handleNext}
          className="bg-celadon-500 py-1 px-3 rounded-lg items-center"
        >
          <Text className="text-alice text-lg font-bold">próximo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ConfigureTimeScreen;
