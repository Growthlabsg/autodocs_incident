// mobile-app/src/App.js
// Main Mobile App Entry Point

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import IncidentsScreen from './screens/IncidentsScreen';
import IncidentDetailScreen from './screens/IncidentDetailScreen';
import OnCallScreen from './screens/OnCallScreen';
import AlertsScreen from './screens/AlertsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function IncidentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="IncidentsList" component={IncidentsScreen} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#14b8a6',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#1e293b',
            borderTopColor: '#334155'
          }
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ tabBarIcon: () => '📊' }}
        />
        <Tab.Screen 
          name="Incidents" 
          component={IncidentsStack}
          options={{ tabBarIcon: () => '🚨' }}
        />
        <Tab.Screen 
          name="On-Call" 
          component={OnCallScreen}
          options={{ tabBarIcon: () => '📞' }}
        />
        <Tab.Screen 
          name="Alerts" 
          component={AlertsScreen}
          options={{ tabBarIcon: () => '🔔' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
