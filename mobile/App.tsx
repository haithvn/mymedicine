import "./src/global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Home, Pill, ClipboardList, Activity } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import './src/i18n';

// Screens
import Dashboard from './src/screens/Dashboard';
import Medicines from './src/screens/Medicines';
import Diseases from './src/screens/Diseases';
import Prescriptions from './src/screens/Prescriptions';

const Tab = createBottomTabNavigator();

export default function App() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Dashboard') {
              return <Home size={size} color={color} />;
            } else if (route.name === 'Medicines') {
              return <Pill size={size} color={color} />;
            } else if (route.name === 'Diseases') {
              return <Activity size={size} color={color} />;
            } else if (route.name === 'Prescriptions') {
              return <ClipboardList size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            height: 60,
            paddingBottom: 10,
            paddingTop: 5,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: 'white',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
          }
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: t('layout.dashboard') }} />
        <Tab.Screen name="Medicines" component={Medicines} options={{ title: t('layout.medicines') }} />
        <Tab.Screen name="Diseases" component={Diseases} options={{ title: t('layout.diseases') }} />
        <Tab.Screen name="Prescriptions" component={Prescriptions} options={{ title: t('layout.prescriptions') }} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
