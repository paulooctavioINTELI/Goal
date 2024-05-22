import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from "react-native";
import { NativeModules } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  launchCamera,
  CameraOptions,
  CameraType,
} from "react-native-image-picker";
import { format, parseISO, isBefore } from "date-fns";
import { Task, Schedule, TaskWithDay } from "../types";

const { AppBlockerModule } = NativeModules;

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const HabitListScreen: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule>({});
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [pendingTasksToday, setPendingTasksToday] = useState<TaskWithDay[]>([]);
  const [otherTasks, setOtherTasks] = useState<TaskWithDay[]>([]);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDay]);

  const fetchSchedule = async () => {
    try {
      const jsonSchedule = await AppBlockerModule.getSchedule();
      const fetchedSchedule = JSON.parse(jsonSchedule);
      setSchedule(fetchedSchedule);
      separateTasks(fetchedSchedule, selectedDay);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    }
  };

  const getDateTimeString = (day: string, time: string): string => {
    const dayIndex = DAYS_OF_WEEK.indexOf(day.toLowerCase());
    if (dayIndex === -1) throw new Error(`Invalid day: ${day}`);

    const today = new Date();
    const currentDayIndex = today.getDay();
    const difference = dayIndex - currentDayIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + difference);
    const dateString = targetDate.toISOString().split("T")[0];
    return `${dateString}T${time}`;
  };

  const separateTasks = (schedule: Schedule, day: string) => {
    const pendingToday: TaskWithDay[] = [];
    const other: TaskWithDay[] = [];
    
    Object.entries(schedule).forEach(([taskDay, tasks]) => {
      tasks.forEach((task) => {
        const dateTimeString = getDateTimeString(taskDay, task.time);
        const taskTime = parseISO(dateTimeString);
        if (taskDay.toLowerCase() === format(new Date(), "EEEE").toLowerCase()) {
          if (!task.accomplished && isBefore(taskTime, new Date())) {
            pendingToday.push({ ...task, day: taskDay });
          } else {
            other.push({ ...task, day: taskDay });
          }
        } else {
          other.push({ ...task, day: taskDay });
        }
      });
    });

    setPendingTasksToday(pendingToday);
    setOtherTasks(other.filter((task) => task.day.toLowerCase() === day.toLowerCase()));
  };

  const handleTakePhoto = async (task: TaskWithDay) => {
    const options: CameraOptions = {
      mediaType: "photo",
      cameraType: "back" as CameraType,
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.error("ImagePicker Error: ", response.errorMessage);
      } else {
        await updateTaskAsAccomplished(task);
      }
    });
  };

  const updateTaskAsAccomplished = async (task: TaskWithDay) => {
    const tasks = [...(schedule[task.day] || [])];
    const updatedTasks = tasks.map((t) =>
      t.time === task.time ? { ...t, accomplished: true } : t
    );
    const updatedSchedule = {
      ...schedule,
      [task.day]: updatedTasks,
    };

    try {
      await AppBlockerModule.updateSchedule(JSON.stringify(updatedSchedule));
      setSchedule(updatedSchedule);
      separateTasks(updatedSchedule, selectedDay);
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
  };

  const renderDayOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedDay(item)}
      className={`w-7 m-2 h-7 justify-center items-center rounded-full ${
        selectedDay === item ? "bg-celadon-700" : "bg-transparent border-celadon"
      } border`}
    >
      <Text className={`text-lg ${selectedDay === item ? "text-white" : "text-celadon"}`} style={{ lineHeight: 20 }}>
        {item.charAt(0)}
      </Text>
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }: { item: TaskWithDay }) => {
    const dateTimeString = getDateTimeString(item.day, item.time);
    let taskTime;
    try {
      taskTime = parseISO(dateTimeString);
      if (isNaN(taskTime.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (error) {
      console.error("Failed to parse date:", dateTimeString);
      return null;
    }

    return (
      <View className="mb-4">
        <View className="p-2 border-b border-gray-700 rounded-lg bg-rich flex-row justify-between">
          <View className="flex-row gap-1">
            {pendingTasksToday.includes(item) && (
              <TouchableOpacity onPress={() => handleTakePhoto(item)}>
                <Icon name="camera-outline" size={24} color="#e8f1f2" />
              </TouchableOpacity>
            )}
            <View className="gap-2">
              <Text className="text-alice text-xl">{item.name}</Text>
              <Text className="text-alice font-thin text-xl">{item.time}</Text>
            </View>
          </View>
          {item.accomplished ? (
            <Icon name="checkmark-circle-outline" size={20} color="#b3efb2" />
          ) : (
            <Icon name="time-outline" size={20} color="#f6ae2d" />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-rich-900">
      {pendingTasksToday[0] && (
        <View className="mb-12 flex-row justify-between items-start">
          <View className="gap-4">
            <Text className="text-3xl text-alice font-bold">{pendingTasksToday[0].name}</Text>
            <Text className="text-lg text-alice-700 font-bold">{pendingTasksToday[0].time}h</Text>
          </View>
          <TouchableOpacity onPress={() => handleTakePhoto(pendingTasksToday[0])} className="flex p-2 bg-alice-900 rounded-lg">
            <Icon name="camera-outline" size={30} color="#e8f1f2" />
          </TouchableOpacity>
        </View>
      )}
      <View className="items-center">
        <FlatList
          data={DAYS_OF_WEEK}
          renderItem={renderDayOption}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="w-full pb-4 h-fit border-b border-b-alice"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
      <FlatList
        className="mt-12"
        data={
          pendingTasksToday[0] && pendingTasksToday[0].accomplished
            ? [...pendingTasksToday, ...otherTasks]
            : [...pendingTasksToday.slice(1), ...otherTasks]
        }
        renderItem={renderTaskItem}
        keyExtractor={(_, index) => index.toString()}
      />
    </SafeAreaView>
  );
};

export default HabitListScreen;
