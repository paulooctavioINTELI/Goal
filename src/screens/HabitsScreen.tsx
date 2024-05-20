// src/screens/HabitsScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types';
import Icon from 'react-native-vector-icons/Ionicons'; 

type HabitsScreenProps = NativeStackScreenProps<MainTabParamList, 'Habits'>;

const HabitsScreen = ({ navigation }: HabitsScreenProps) => {
  return (
    <View className='flex-1 bg-rich-900'>
      <Text>Habits Screen</Text>
      <Icon name="Habits-outline" size={40} color="#000" />
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
};

export default HabitsScreen;
