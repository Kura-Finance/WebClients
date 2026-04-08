// src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import InvestmentScreen from '../features/investment/screens/InvestmentScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A24',
          borderTopColor: '#1A1A24',
          borderTopWidth: 1,
          paddingBottom: 15, // 針對 iOS Home Indicator 縮減留白
          paddingTop: 5,
          height: 55, // 原本 90 縮減近半
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#4B5563',
      }}
    >
      <Tab.Screen 
        name="Banking" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="card" size={20} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Invest" 
        component={InvestmentScreen} 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="trending-up" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
