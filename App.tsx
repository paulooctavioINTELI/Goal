// AddHabitScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {NativeModules} from 'react-native';

interface Task {
  time: string;
  accomplished: boolean;
}

interface Schedule {
  [key: string]: Task[];
}

const {AppBlockerModule} = NativeModules;

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
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [schedule, setSchedule] = useState<Schedule>({});

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const jsonSchedule = await AppBlockerModule.getSchedule();
        const fetchedSchedule = JSON.parse(jsonSchedule);
        setSchedule(fetchedSchedule);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      }
    };

    fetchSchedule();
  }, []);

  const handleAddTime = async (): Promise<void> => {
    if (!selectedDay || !time) return;

    const updatedSchedule = {
      ...schedule,
      [selectedDay]: [
        ...(schedule[selectedDay] || []),
        {time, accomplished: false},
      ],
    };

    try {
      await AppBlockerModule.updateSchedule(JSON.stringify(updatedSchedule));
      setSchedule(updatedSchedule);
      setTime('');
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const handleToggleAccomplished = async (
    index: number,
    taskTime: string,
  ): Promise<void> => {
    if (!selectedDay) return;
    console.log(schedule);
    

    const currentTime = new Date();
    const [currentHours, currentMinutes] = [
      currentTime.getHours(),
      currentTime.getMinutes(),
    ];
    const [taskHours, taskMinutes] = taskTime.split(':').map(Number);

    // Comparando se o horário atual é posterior ao da task
    if (
      currentHours > taskHours ||
      (currentHours === taskHours && currentMinutes >= taskMinutes)
    ) {
      const tasks = [...(schedule[selectedDay] || [])];

      if (tasks[index]) {
        tasks[index] = {
          ...tasks[index],
          accomplished: !tasks[index].accomplished, // Toggle based on current state
        };
      }

      const updatedSchedule = {
        ...schedule,
        [selectedDay]: tasks,
      };

      try {
        await AppBlockerModule.updateSchedule(JSON.stringify(updatedSchedule));
        setSchedule(updatedSchedule);
      } catch (error) {
        console.error('Failed to update schedule:', error);
      }
    } else {
      console.log("It's not time yet to mark this task as accomplished.");
    }
  };

  const renderDayOption = ({item}: {item: string}) => (
    <TouchableOpacity
      onPress={() => setSelectedDay(item)}
      className={`m-1 px-2 min-h-full rounded-lg ${
        selectedDay === item ? 'bg-green-500' : 'bg-gray-800'
      } border border-gray-700`}>
      <Text
        className={`${selectedDay === item ? 'text-white' : 'text-gray-300'}`}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 p-4 bg-gray-900">
      <Text className="text-2xl font-bold text-white mb-4">
        Add a New Habit
      </Text>
      <Text className="text-lg mb-2 text-gray-300">Select a Day:</Text>
      <FlatList
        data={DAYS_OF_WEEK}
        renderItem={renderDayOption}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4 max-h-16"
        contentContainerStyle={`items-center justify-center`}
      />
      <Text className="text-lg mb-2 text-gray-300">Enter Time (HH:MM):</Text>
      <TextInput
        className="border p-2 mb-2 rounded-lg bg-gray-800 text-white"
        value={time}
        onChangeText={setTime}
        placeholder="e.g., 08:00"
        placeholderTextColor="gray"
      />
      <TouchableOpacity
        onPress={handleAddTime}
        className="bg-green-500 p-3 rounded-lg items-center">
        <Text className="text-white font-bold">Add Time</Text>
      </TouchableOpacity>
      <Text className="text-lg mb-2 text-gray-300">
        Current Schedule for {selectedDay}:
      </Text>
      {selectedDay && schedule[selectedDay] && (
        <FlatList
          data={schedule[selectedDay]}
          renderItem={(
            {item, index}, // Adicione index aqui
          ) => (
            <TouchableOpacity
              onPress={() => handleToggleAccomplished(index, item.time)} // Use index
              className="p-2 border-b border-gray-700 bg-gray-800">
              <Text className="text-white">{item.time}</Text>
              <Text className="text-green-400">
                Accomplished: {item.accomplished ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      )}
    </SafeAreaView>
  );
};

export default AddHabitScreen;
