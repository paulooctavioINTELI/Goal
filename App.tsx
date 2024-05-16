import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
} from 'react-native';
import {NativeModules} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {launchCamera, CameraOptions, CameraType} from 'react-native-image-picker';

interface Task {
  time: string;
  accomplished: boolean;
  name: string;
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
  const [selectedDay, setSelectedDay] = useState<string>('sunday');
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
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
    if (!selectedDay || !time || !name) return;

    const formattedTime = time.toTimeString().slice(0, 5);

    const updatedSchedule = {
      ...schedule,
      [selectedDay]: [
        ...(schedule[selectedDay] || []),
        {time: formattedTime, accomplished: false, name},
      ],
    };

    try {
      await AppBlockerModule.updateSchedule(JSON.stringify(updatedSchedule));
      setSchedule(updatedSchedule);
      setTime(new Date());
      setName('');
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleToggleAccomplished = async (
    index: number,
    taskTime: string,
  ): Promise<void> => {
    if (!selectedDay) return;

    const currentTime = new Date();
    const [currentHours, currentMinutes] = [
      currentTime.getHours(),
      currentTime.getMinutes(),
    ];
    const [taskHours, taskMinutes] = taskTime.split(':').map(Number);

    if (
      currentHours > taskHours ||
      (currentHours === taskHours && currentMinutes >= taskMinutes)
    ) {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Camera permission denied');
        return;
      }

      const options: CameraOptions = {
        mediaType: 'photo',
        cameraType: 'back' as CameraType,
      };

      launchCamera(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else {
          const tasks = [...(schedule[selectedDay] || [])];

          if (tasks[index]) {
            tasks[index] = {
              ...tasks[index],
              accomplished: !tasks[index].accomplished,
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
        }
      });
    } else {
      Alert.alert("It's not time yet to mark this task as accomplished.");
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
      />
      <Text className="text-lg mb-2 text-gray-300">Enter Time (HH:MM):</Text>
      <TextInput
        className="border p-2 mb-2 rounded-lg bg-gray-800 text-white"
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor="gray"
      />
      <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        className="border p-2 mb-2 rounded-lg bg-gray-800 text-white">
        <Text>{time.toTimeString().slice(0, 5)}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setTime(selectedDate);
            }
          }}
        />
      )}
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
              <View className='flex-row justify-between'>
                <Text className='text-white font-bold text-lg' >{item.name}</Text>
                <Text className="text-white">{item.time}</Text>
              </View>
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
