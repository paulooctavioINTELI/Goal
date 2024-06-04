// src/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HabitsScreen from '../screens/HabitsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PhoneNumberScreen from '../screens/PhoneNumberScreen';
import SelectDaysScreen from '../screens/AddHabit/SelectDaysScreen';
import ConfigureTimeScreen from '../screens/AddHabit/ConfigureTimeScreen';
import AdjustSpecificDaysScreen from '../screens/AddHabit/AdjustSpecificDaysScreen';
import { RootStackParamList, MainTabParamList } from '../types';
import Icon from 'react-native-vector-icons/Ionicons'; 
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'calendar-outline';
          let IconComponent = Icon;

          if (route.name === 'Habits') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Details') {
            iconName = 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = 'gavel';
            IconComponent = MaterialIcon;
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#b3efb2',
        tabBarInactiveTintColor: '#e8f1f2',
        tabBarStyle: {
          backgroundColor: '#00151c',
        },
      })}
    >
      <Tab.Screen 
        name="Habits" 
        component={HabitsScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Details" 
        component={SelectDaysScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PhoneNumber">
        <Stack.Screen
          name="PhoneNumber"
          component={PhoneNumberScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="SelectDays"
          component={SelectDaysScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="ConfigureTime"
          component={ConfigureTimeScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="AdjustSpecificDays"
          component={AdjustSpecificDaysScreen}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
