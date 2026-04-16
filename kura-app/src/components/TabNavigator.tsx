import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import BudgetScreen from '../features/dashboard/screens/BudgetScreen';
import InvestmentScreen from '../features/investment/screens/InvestmentScreen';

const Stack = createNativeStackNavigator();

interface TabOption {
  name: string;
  icon: string;
  label: string;
}

export default function TabNavigator() {
  const [activeTab, setActiveTab] = useState('Banking');
  const insets = useSafeAreaInsets();

  const tabs: TabOption[] = [
    { name: 'Banking', icon: 'card', label: 'Banking' },
    { name: 'Invest', icon: 'trending-up', label: 'Invest' },
  ];

  const currentScreen = activeTab === 'Banking' ? DashboardScreen : InvestmentScreen;

  // 胶囊标签栏渲染逻辑
  const renderTabItems = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const activeBtnBgColor = 'rgba(139, 92, 246, 0.3)';
        const activeContentColor = '#8B5CF6';
        const inactiveContentColor = '#FFFFFF';

        const btnBgColor = isActive ? activeBtnBgColor : 'transparent';
        const contentColor = isActive ? activeContentColor : inactiveContentColor;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => setActiveTab(tab.name)}
            style={[
              styles.tabButton,
              {
                backgroundColor: btnBgColor,
                paddingVertical: 5,
                paddingHorizontal: 7,
                borderRadius: 32
              }
            ]}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={contentColor}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: contentColor,
                  fontWeight: isActive ? '600' : '400',
                }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 150,
        }}
      >
        <Stack.Screen
          name={activeTab}
          component={currentScreen}
        />
        <Stack.Screen
          name="Budget"
          component={BudgetScreen}
        />
      </Stack.Navigator>

      {/* 胶囊形底部导航栏 */}
      <View
        style={[
          styles.wrapper,
          { 
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: 'transparent'
          }
        ]}
      >
        {isLiquidGlassSupported ? (
          <LiquidGlassView
            effect="regular"
            colorScheme="dark"
            tintColor="rgba(139, 92, 246, 0.05)"
            style={styles.capsuleShape}
          >
            {renderTabItems()}
          </LiquidGlassView>
        ) : (
          <View 
            style={[
              styles.capsuleShape, 
              styles.fallbackCapsule
            ]}
          >
            {renderTabItems()}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 90,
    paddingVertical: 8,
    alignItems: 'center',
  },
  capsuleShape: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  fallbackCapsule: {
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: 'rgba(139, 139, 149, 0.3)',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 9,
    marginTop: 2.5,
  }
});
