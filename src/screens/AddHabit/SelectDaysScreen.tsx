// src/screens/SelectDaysScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import Icon from "react-native-vector-icons/Ionicons";

type SelectDaysScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SelectDays"
>;

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const SelectDaysScreen: React.FC = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [habitName, setHabitName] = useState<string>("");
  const [selectedPattern, setSelectedPattern] = useState<string>("");
  const navigation = useNavigation<SelectDaysScreenNavigationProp>();
  const [placeholderColor, setPlaceholderColor] = useState<string>("");

  const toggleDay = (day: string) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
    setSelectedPattern("");
  };

  const handleNext = () => {
    navigation.navigate("ConfigureTime", { selectedDays, habitName });
  };

  const selectAllDays = () => {
    setSelectedDays([...DAYS_OF_WEEK]);
    setSelectedPattern("all");
  };

  const selectWeekdays = () => {
    setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
    setSelectedPattern("weekdays");
  };

  const selectWeekend = () => {
    setSelectedDays(["saturday", "sunday"]);
    setSelectedPattern("weekend");
  };

  const renderDayOption = (day: string) => (
    <TouchableOpacity
      key={day}
      onPress={() => toggleDay(day)}
      className={`w-7 m-2 h-7 justify-center items-center rounded-full ${
        selectedDays.includes(day)
          ? "bg-celadon-500"
          : "bg-transparent border-celadon"
      } border`}
    >
      <Text
        className={`text-lg ${
          selectedDays.includes(day) ? "text-white" : "text-celadon"
        }`}
        style={{ lineHeight: 20 }}
      >
        {day.charAt(0).toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  const renderPatternButton = (
    label: string,
    pattern: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      onPress={onPress}
      className={`p-2 rounded-lg ${
        selectedPattern === pattern
          ? "bg-celadon-500"
          : "bg-transparent border-celadon"
      } border`}
    >
      <Text
        className={`font-bold ${
          selectedPattern === pattern ? "text-alice" : "text-celadon"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    setTimeout(() => {
      setPlaceholderColor("#515455");
    }, 1000);
  }, [placeholderColor]);

  return (
    <SafeAreaView className="flex-1 bg-rich-900">
      <ScrollView className="p-7">
        <View className="mb-24 items-center flex-row">
          {habitName === '' && <Icon size={30} color={placeholderColor} name='create-outline' />}
          <TextInput
            className="text-3xl w-full font-bold text-alice bg-transparent ml-2"
            placeholder="Título do hábito"
            placeholderTextColor={placeholderColor}
            value={habitName}
            onChangeText={setHabitName}
          />
        </View>

        <Text className="text-lg font-bold mb-4 text-alice">
          Em quais dias?
        </Text>
        <View className="flex-row mb-3 justify-between">
          {renderPatternButton("Todo dia", "all", selectAllDays)}
          {renderPatternButton("Dia da Semana", "weekdays", selectWeekdays)}
          {renderPatternButton("Fim de Semana", "weekend", selectWeekend)}
        </View>
        <View className="flex-row mb-4">
          {DAYS_OF_WEEK.map(renderDayOption)}
        </View>
        <View className="w-full flex-row justify-end mt-20">
          <TouchableOpacity
            onPress={
              habitName !== ""
                ? handleNext
                : () => setPlaceholderColor("#b10f2e")
            }
            className="bg-celadon-500 py-1 px-3 rounded-lg items-center"
          >
            <Text className="text-alice text-lg font-bold">próximo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectDaysScreen;
