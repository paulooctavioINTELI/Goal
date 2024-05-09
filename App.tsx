import React, {useState, useEffect} from 'react';
import {View, Button, Text, NativeModules} from 'react-native';

const {AppBlockerModule} = NativeModules;

const App = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    checkMonitoringStatus();
  }, []);

  const checkMonitoringStatus = async () => {
    const status = await AppBlockerModule.isMonitoringEnabled();
    setIsMonitoring(status);
  };

  const handleToggleMonitoring = async () => {
    const newStatus = await AppBlockerModule.toggleMonitoring();
    setIsMonitoring(newStatus);
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>{`Monitoring is ${isMonitoring ? 'enabled' : 'disabled'}`}</Text>
      <Button
        title={isMonitoring ? 'Disable Monitoring' : 'Enable Monitoring'}
        onPress={handleToggleMonitoring}
      />
    </View>
  );
};

export default App;
