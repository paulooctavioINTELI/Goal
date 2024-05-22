// src/components/HabitItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Task } from '../types';

interface HabitItemProps {
  task: Task;
  onToggleAccomplished: () => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ task, onToggleAccomplished }) => {
  return (
    <TouchableOpacity onPress={onToggleAccomplished} className="p-2 border-b border-gray-700 bg-gray-800">
      <Text className="text-white font-bold text-lg">{task.name}</Text>
      <Text className="text-white">{task.time}</Text>
      <Text className="text-green-400">Accomplished: {task.accomplished ? 'Yes' : 'No'}</Text>
    </TouchableOpacity>
  );
};

export default HabitItem;
