import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LearnScreen } from '../screens/LearnScreen';
import { WorkbenchScreen } from '../screens/WorkbenchScreen';
import { RituuScreen } from '../screens/RituuScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../theme/colors';
import { LayoutDashboard, GraduationCap, Cpu, Sparkles, UserCheck } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.card,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.borderSubtle,
          elevation: 2,
          shadowColor: 'rgba(20, 30, 60, 0.06)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 6,
        },
        headerTitleStyle: {
          color: COLORS.navy,
          fontSize: 16,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        headerTintColor: COLORS.primary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderSubtle,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: 'rgba(20, 30, 60, 0.08)',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: 'RoboVerse Hub',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size - 2} color={color} />,
        }}
      />

      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          title: 'RoboVerse Academy',
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, size }) => <GraduationCap size={size - 2} color={color} />,
        }}
      />

      <Tab.Screen
        name="Lab"
        component={WorkbenchScreen}
        options={{
          title: 'Circuit Lab 3D',
          tabBarLabel: 'Lab',
          tabBarIcon: ({ color, size }) => <Cpu size={size - 2} color={color} />,
        }}
      />

      <Tab.Screen
        name="Rituu"
        component={RituuScreen}
        options={{
          title: 'Rituu AI Mentor',
          tabBarLabel: 'Rituu',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.rituuTabIcon}>
              <Sparkles size={size - 2} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Student Passport',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCheck size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  rituuTabIcon: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
