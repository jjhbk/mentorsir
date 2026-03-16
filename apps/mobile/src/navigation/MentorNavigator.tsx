import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorDashboardScreen from '../screens/mentor/MentorDashboardScreen';
import StudentsListScreen from '../screens/mentor/StudentsListScreen';
import StudentDetailScreen from '../screens/mentor/StudentDetailScreen';
import AlertsScreen from '../screens/mentor/AlertsScreen';
import { colors } from '../theme/colors';
import { MentorTabParamList, MentorStudentsStackParamList } from '../types';

const Tab = createBottomTabNavigator<MentorTabParamList>();
const StudentsStack = createNativeStackNavigator<MentorStudentsStackParamList>();

function StudentsNavigator() {
  return (
    <StudentsStack.Navigator>
      <StudentsStack.Screen name="StudentsList" component={StudentsListScreen} options={{ headerShown: false }} />
      <StudentsStack.Screen
        name="StudentDetail"
        component={StudentDetailScreen}
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerBackTitle: 'Students',
        }}
      />
    </StudentsStack.Navigator>
  );
}

const TABS = [
  { name: 'Dashboard' as const, component: MentorDashboardScreen },
  { name: 'Students' as const, component: StudentsNavigator },
  { name: 'Alerts' as const, component: AlertsScreen },
];

export default function MentorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: s.bar,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <View style={s.tabItem}>
            {focused && <View style={s.dot} />}
            <Text style={[s.label, focused && s.labelActive]}>
              {route.name}
            </Text>
          </View>
        ),
      })}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 68,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    position: 'absolute',
    top: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textFaint,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  labelActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
