// src/screens/PhoneNumberScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Logo from '../assets/logo.svg';
import TextInputMask from 'react-native-text-input-mask';

type PhoneNumberScreenProps = NativeStackScreenProps<RootStackParamList, 'PhoneNumber'>;

const PhoneNumberScreen = ({ navigation }: PhoneNumberScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePress = () => {
    // Aqui você pode adicionar validação ou armazenamento do número de telefone
    navigation.replace('Main');
  };

  return (
    <View className="flex-1 items-center py-32 w-full gap-y-8 bg-rich-900 px-7">
      <Logo width={100} height={100} className="mt-4" />
      <Text className="text-xl text-alice font-bold">Insira seu número</Text>
      <TextInputMask
        className="w-full text-lg px-7 rounded-md bg-rich shadow-2xl"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        mask={"([000]) [00000]-[0000]"}
        keyboardType="phone-pad"
        placeholder="Phone number"
      />
      <TouchableOpacity className="bg-celadon-500 px-3 py-2 rounded" onPress={handlePress}>
        <Text className="text-alice text-xl font-bold text-center">Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PhoneNumberScreen;
