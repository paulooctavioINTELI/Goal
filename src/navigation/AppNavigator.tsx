// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HabitsScreen from '../screens/HabitsScreen';
import AddHabitScreen from '../screens/DetailsScreen'; '../screens/DetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PhoneNumberScreen from '../screens/PhoneNumberScreen';
import { RootStackParamList, MainTabParamList } from '../types';
import Icon from 'react-native-vector-icons/Ionicons'; // Importando a biblioteca de ícones
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importando a biblioteca de ícones

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
            IconComponent = MaterialIcon; // Use MaterialIcon para a rota Profile
          }

          // Retorna o ícone apropriado
          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#b3efb2',
        tabBarInactiveTintColor: '#e8f1f2',
        tabBarStyle: {
          backgroundColor: '#00151c', // Cor de fundo da tab bar
        },
      })}
    >
      <Tab.Screen 
        name="Habits" 
        component={HabitsScreen} 
        options={{ headerShown: false }} // Remover cabeçalho
      />
      <Tab.Screen 
        name="Details" 
        component={AddHabitScreen} 
        options={{ headerShown: false }} // Remover cabeçalho
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} // Remover cabeçalho
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
          options={{ headerShown: false }} // Remover cabeçalho
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }} // Remover cabeçalho
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
