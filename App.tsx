// AddHabitScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  NativeModules,
} from 'react-native';

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
    // Fetch the current schedule when the component mounts
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
      // Update the schedule in the native module
      await AppBlockerModule.updateSchedule(JSON.stringify(updatedSchedule));
      setSchedule(updatedSchedule); // Update local state
      setTime(''); // Clear the input field after adding time
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const renderDayOption = ({item}: {item: string}) => (
    <TouchableOpacity
      onPress={() => setSelectedDay(item)}
      style={[styles.dayButton, selectedDay === item && styles.selectedDay]}>
      <Text style={styles.dayText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add a New Habit</Text>
      <Text style={styles.label}>Select a Day:</Text>
      <FlatList
        data={DAYS_OF_WEEK}
        renderItem={renderDayOption}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{height: 5}}
      />
      <Text style={styles.label}>Enter Time (HH:MM):</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="e.g., 08:00"
      />
      <TouchableOpacity onPress={handleAddTime} style={styles.addButton}>
        <Text style={styles.buttonText}>Add Time</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Current Schedule for {selectedDay}:</Text>
      {selectedDay && schedule[selectedDay] && (
        <FlatList
          data={schedule[selectedDay]}
          renderItem={({item}) => (
            <View style={styles.scheduleItem}>
              <Text style={{color: 'black'}}>{item.time}</Text>
              <Text style={{color: 'black'}}>
                Accomplished: {item.accomplished ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
    marginVertical: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black',
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dayButton: {
    height: 5,
    padding: 10,
    margin: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
  },
  selectedDay: {
    backgroundColor: 'lightblue',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  scheduleItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    backgroundColor: 'white',
    color: 'black',
  },
});

export default AddHabitScreen;
