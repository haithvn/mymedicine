import "./src/global.css";
import React, { useState, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Home, Pill, ClipboardList, Activity, ChevronUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import './src/i18n';

// Screens
import Dashboard from './src/screens/Dashboard';
import Medicines from './src/screens/Medicines';
import Diseases from './src/screens/Diseases';
import Prescriptions from './src/screens/Prescriptions';

const Tab = createBottomTabNavigator();
const SCREEN_HEIGHT = Dimensions.get('window').height;
const TAB_BAR_HEIGHT = 80;

export default function App() {
  const { t } = useTranslation();
  const [isTabBarVisible, setIsTabBarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;

  const toggleTabBar = useCallback(() => {
    const toValue = isTabBarVisible ? TAB_BAR_HEIGHT : 0;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
    setIsTabBarVisible(!isTabBarVisible);
  }, [isTabBarVisible, slideAnim]);

  const hideTabBar = useCallback(() => {
    if (isTabBarVisible) {
      Animated.spring(slideAnim, {
        toValue: TAB_BAR_HEIGHT,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
      setIsTabBarVisible(false);
    }
  }, [isTabBarVisible, slideAnim]);

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
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
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
              marginTop: 2,
              marginBottom: 4,
            },
            tabBarStyle: {
              height: TAB_BAR_HEIGHT,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              backgroundColor: 'white',
              elevation: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              transform: [{ translateY: slideAnim }],
            }
          })}
          screenListeners={{
            tabPress: hideTabBar,
          }}
        >
          <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: t('layout.dashboard') }} />
          <Tab.Screen name="Medicines" component={Medicines} options={{ title: t('layout.medicines') }} />
          <Tab.Screen name="Diseases" component={Diseases} options={{ title: t('layout.diseases') }} />
          <Tab.Screen name="Prescriptions" component={Prescriptions} options={{ title: t('layout.prescriptions') }} />
        </Tab.Navigator>

        {/* Toggle Button - always visible at bottom */}
        <TouchableOpacity
          onPress={toggleTabBar}
          style={{
            position: 'absolute',
            bottom: isTabBarVisible ? TAB_BAR_HEIGHT + 10 : 10,
            alignSelf: 'center',
            backgroundColor: '#3B82F6',
            width: 50,
            height: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Animated.View style={{
            transform: [{ rotate: isTabBarVisible ? '180deg' : '0deg' }]
          }}>
            <ChevronUp size={20} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
