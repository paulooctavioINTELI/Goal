import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../types';
import { BlurView } from '@react-native-community/blur';

type AdjustSpecificDaysScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdjustSpecificDays'
>;

type AdjustSpecificDaysScreenRouteProp = RouteProp<
  RootStackParamList,
  'AdjustSpecificDays'
>;

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

const AdjustSpecificDaysScreen: React.FC = () => {
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [currentFixedTime, setCurrentFixedTime] = useState<Date>(new Date());
  const [dayAdjustments, setDayAdjustments] = useState<{ [key: string]: string[] }>({});
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const navigation = useNavigation<AdjustSpecificDaysScreenNavigationProp>();
  const route = useRoute<AdjustSpecificDaysScreenRouteProp>();
  const { selectedDays, habitName, periodicTime, fixedTimes } = route.params;

  useEffect(() => {
    const initialAdjustments = selectedDays.reduce((acc, day) => {
      acc[day] = fixedTimes;
      return acc;
    }, {} as { [key: string]: string[] });
    setDayAdjustments(initialAdjustments);
  }, [selectedDays, fixedTimes]);

  const handleSave = async () => {
    try {
      const schedule = await AppBlockerModule.getSchedule();
      const updatedSchedule = {
        ...JSON.parse(schedule),
        ...selectedDays.reduce((acc, day) => {
          const times = dayAdjustments[day] || [];
          return {
            ...acc,
            [day]: [
              ...(JSON.parse(schedule)[day] || []),
              ...times.map((time) => ({ time, accomplished: false, name: habitName })),
            ],
          };
        }, {}),
      };

      await AppBlockerModule.updateSchedule(JSON.stringify(updatedSchedule));
      navigation.navigate('Habits');
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const addAdjustmentTime = (day: string, newTime: string) => {
    setDayAdjustments((prevAdjustments) => {
      const updatedTimes = editIndex !== null 
        ? [...prevAdjustments[day].slice(0, editIndex), newTime, ...prevAdjustments[day].slice(editIndex + 1)]
        : [...(prevAdjustments[day] || []), newTime];
      return {
        ...prevAdjustments,
        [day]: updatedTimes,
      };
    });
    setEditIndex(null);
  };

  const toggleDay = (day: string) => {
    setSelectedDay(day);
  };

  const editFixedTime = (index: number) => {
    setEditIndex(index);
    setCurrentFixedTime(new Date(`1970-01-01T${dayAdjustments[selectedDay][index]}:00`));
    setShowTimePicker(true);
  };

  const deleteFixedTime = (index: number) => {
    setDayAdjustments((prevAdjustments) => {
      const updatedTimes = prevAdjustments[selectedDay].filter((_, i) => i !== index);
      return {
        ...prevAdjustments,
        [selectedDay]: updatedTimes,
      };
    });
  };

  const renderDayOption = (day: string) => (
    <TouchableOpacity
      key={day}
      onPress={() => toggleDay(day)}
      className={`w-7 m-2 h-7 justify-center items-center rounded-full ${
        selectedDay === day ? 'bg-celadon-500' : 'bg-transparent border-celadon'
      } border`}
    >
      <Text className={`text-lg ${selectedDay === day ? 'text-white' : 'text-celadon'}`} style={{ lineHeight: 20 }}>
        {day.charAt(0).toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1  bg-rich-900">
      <ScrollView className='p-4' contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-2xl font-bold text-alice mb-4">Ajuste de Dias Específicos</Text>
        <View className="flex-row mb-4">
          {DAYS_OF_WEEK.map(renderDayOption)}
        </View>
        <View className='gap-3 mb-20'>
          {dayAdjustments[selectedDay]?.map((time, index) => (
            <View key={index} className="m-1 px-2 py-3 rounded-lg bg-rich flex-row justify-between items-center">
              <Text className="text-alice text-2xl">{time}</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity onPress={() => editFixedTime(index)} className="mr-2">
                  <Icon name="create-outline" size={24} color="#f6ae2d" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteFixedTime(index)}>
                  <Icon name="trash-outline" size={24} color="#b10f2e" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {showTimePicker && (
            <DateTimePicker
              value={currentFixedTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false); // Close the picker immediately
                if (selectedDate) {
                  const newTime = selectedDate.toTimeString().slice(0, 5);
                  addAdjustmentTime(selectedDay, newTime);
                }
              }}
            />
          )}
        </View>
      </ScrollView>
      <View className='absolute bottom-0 flex justify-center items-center py-2 self-center w-full'>
      <BlurView
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
        <TouchableOpacity
          onPress={handleSave}
          className="bg-celadon-500 w-3/4 p-3 rounded-lg items-center"
        >
          <Text className="text-rich-500 font-bold">Começar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdjustSpecificDaysScreen;
