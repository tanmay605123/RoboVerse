import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { WorkbenchScreen } from '../screens/WorkbenchScreen';
import { RituuScreen } from '../screens/RituuScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { StoreScreen } from '../screens/StoreScreen';
import { COLORS } from '../theme/colors';
import { LayoutDashboard, Cpu, Sparkles, Trophy, ShoppingBag } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#05110C',
          borderBottomWidth: 1,
          borderBottomColor: COLORS.borderSubtle,
        },
        headerTitleStyle: {
          color: '#FFF',
          fontSize: 15,
          fontWeight: '800',
          fontFamily: 'monospace',
          letterSpacing: 1,
        },
        headerTintColor: COLORS.neon,
        tabBarStyle: {
          backgroundColor: '#040C08',
          borderTopWidth: 1,
          borderTopColor: 'rgba(57, 255, 106, 0.2)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.neon,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          fontFamily: 'monospace',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Control Room',
          tabBarLabel: 'Control',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size - 2} color={color} />,
        }}
      />

      <Tab.Screen
        name="Workbench"
        component={WorkbenchScreen}
        options={{
          title: '3D Circuit Workbench',
          tabBarLabel: 'Workbench',
          tabBarIcon: ({ color, size }) => <Cpu size={size - 2} color={color} />,
        }}
      />

      <Tab.Screen
        name="Rituu"
        component={RituuScreen}
        options={{
          title: 'Rituu AI Mentor',
          tabBarLabel: 'Rituu AI',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.rituuTabIcon}>
              <Sparkles size={size - 2} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Hackathons & Shops',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => <Trophy size={size - 2} color={color} />,
        }}
      />

      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{
          title: 'TechSavyyy Hardware',
          tabBarLabel: 'Store',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  rituuTabIcon: {
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
});
