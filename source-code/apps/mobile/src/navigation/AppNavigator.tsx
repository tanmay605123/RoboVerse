import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { AuthScreen } from '../screens/AuthScreen';
import { TabNavigator } from './TabNavigator';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { isAuthenticated } = useMobileAuthStore();

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.neon,
          background: COLORS.bgBase,
          card: '#05110C',
          text: COLORS.textPrimary,
          border: COLORS.borderSubtle,
          notification: COLORS.teal,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
