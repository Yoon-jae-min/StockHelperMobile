import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import CompanyScreen from '../screens/CompanyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#1e293b',
          headerTitleStyle: { fontWeight: '600', fontSize: 18, color: '#1e293b' },
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: '주식 헬퍼' }}
        />
        <Stack.Screen
          name="Company"
          component={CompanyScreen}
          options={({ route }) => ({ title: route.params.symbol })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
