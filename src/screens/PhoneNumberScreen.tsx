import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Logo from '../assets/logo.svg';
import TextInputMask from 'react-native-text-input-mask';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Contacts from 'react-native-contacts';
import { NativeModules } from 'react-native';

const { AppBlockerModule } = NativeModules;

type PhoneNumberScreenProps = NativeStackScreenProps<RootStackParamList, 'PhoneNumber'>;

const requestCameraPermission = async () => {
  try {
    const result = await request(PERMISSIONS.ANDROID.CAMERA);
    if (result === RESULTS.GRANTED) {
      return true;
    } else {
      Alert.alert(
        'Permissão necessária',
        'A permissão para acessar a câmera é necessária para continuar.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de câmera:', error);
    return false;
  }
};

const requestContactsPermission = async () => {
  try {
    const result = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
    if (result === RESULTS.GRANTED) {
      return true;
    } else {
      Alert.alert(
        'Permissão necessária',
        'A permissão para acessar a lista de contatos é necessária para continuar.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de contatos:', error);
    return false;
  }
};

const getContacts = async () => {
  try {
    const contacts = await Contacts.getAll();
    const phoneNumbers = contacts
      .map(contact => contact.phoneNumbers.map(phone => phone.number))
      .flat();
    return phoneNumbers;
  } catch (error) {
    console.error('Erro ao obter contatos:', error);
    return [];
  }
};

const requestOverlayPermission = async () => {
  try {
    const result = await AppBlockerModule.requestOverlayPermission();
    if (result) {
      console.log("Overlay permission requested");
    } else {
      console.log("Overlay permission already granted");
    }
  } catch (error) {
    console.error("Failed to request overlay permission:", error);
  }
};

const requestAccessibilityPermission = async () => {
  try {
    const result = await AppBlockerModule.requestAccessibilityPermission();
    return result;
  } catch (error) {
    console.error("Failed to request accessibility permission:", error);
    return false;
  }
};

const PhoneNumberScreen = ({ navigation }: PhoneNumberScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contacts, setContacts] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [overlayModalVisible, setOverlayModalVisible] = useState(false);
  const [accessibilityModalVisible, setAccessibilityModalVisible] = useState(false);

  const handlePress = async () => {
    const cameraPermissionGranted = await requestCameraPermission();
    const contactsPermissionGranted = await requestContactsPermission();

    if (cameraPermissionGranted && contactsPermissionGranted) {
      setOverlayModalVisible(true);
    }
  };

  const handleOverlayModalClose = async () => {
    const overlayPermissionGranted = await requestOverlayPermission();
    setOverlayModalVisible(false);
      setAccessibilityModalVisible(true);
  };

  const handleAccessibilityModalClose = async () => {
    const accessibilityPermissionGranted = await requestAccessibilityPermission();
    setAccessibilityModalVisible(false);
    if (accessibilityPermissionGranted) {
      const phoneNumbers = await getContacts();
      setContacts(phoneNumbers);
      navigation.replace('Main');
    }
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={overlayModalVisible}
        onRequestClose={() => setOverlayModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-opacity-50">
          <View className="bg-rich p-5 w-[90%] rounded-lg">
            <Text className="text-lg font-bold">Permissão de Sobreposição Necessária</Text>
            <Text className="mt-3">Para continuar, você precisa conceder a permissão de sobreposição de aplicativos:</Text>
            <TouchableOpacity className='py-3 m-3 px-5 items-center justify-center bg-celadon-600 rounded-md' onPress={handleOverlayModalClose} >
              <Text className='font-bold text-alice'>Conseder Permissão</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={accessibilityModalVisible}
        onRequestClose={() => setAccessibilityModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-opacity-50">
          <View className="bg-rich p-5 w-[90%] rounded-lg">
            <Text className="text-lg font-bold">Permissão de Acessibilidade Necessária</Text>
            <Text className="mt-3">Para continuar, você precisa conceder a permissão de serviço de acessibilidade:</Text>
            <Text className="mt-3 text-alice font-bold">Por favor, vá para:</Text>
            <Text className="mt-3 text-alice font-bold">Configurações ➡️ Acessibilidade ➡️ Aplicativos Instalados</Text>
            <Text className='mt-3'>e ative o serviço para Goal.</Text>
            <TouchableOpacity className='py-3 m-3 px-5 items-center justify-center bg-celadon-600 rounded-md' onPress={handleAccessibilityModalClose} >
              <Text className='font-bold text-alice'>Conseder Permissão</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PhoneNumberScreen;
