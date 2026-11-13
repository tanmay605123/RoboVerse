import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { AuthScreen } from '../screens/AuthScreen';
import { TabNavigator } from './TabNavigator';
import { ExploreScreen } from '../screens/ExploreScreen';
import { StoreScreen } from '../screens/StoreScreen';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();

const linking: LinkingOptions<any> = {
  prefixes: ['roboverse://', 'https://roboverse.io'],
  config: {
    screens: {
      Auth: 'auth',
      MainTabs: {
        screens: {
          Home: 'dashboard',
          Learn: 'learn',
          Lab: 'workbench',
          Rituu: 'rituu',
          Profile: 'profile',
        },
      },
      Explore: 'explore',
      Store: 'store',
    },
  },
};

export function AppNavigator() {
  const { isAuthenticated } = useMobileAuthStore();

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: false,
        colors: {
          primary: COLORS.primary,
          background: COLORS.bgBase,
          card: COLORS.card,
          text: COLORS.textPrimary,
          border: COLORS.borderSubtle,
          notification: COLORS.teal,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.card,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            color: COLORS.navy,
            fontWeight: '700',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Explore"
              component={ExploreScreen}
              options={{
                title: 'Hackathons & Maker Shops',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Store"
              component={StoreScreen}
              options={{
                title: 'TechSavyyy Hardware Store',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
