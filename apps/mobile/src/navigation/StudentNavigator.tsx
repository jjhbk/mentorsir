import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TodayScreen from '../screens/student/TodayScreen';
import ScheduleScreen from '../screens/student/ScheduleScreen';
import TestsScreen from '../screens/student/TestsScreen';
import MeScreen from '../screens/student/MeScreen';
import { colors } from '../theme/colors';
import { StudentTabParamList } from '../types';

const Tab = createBottomTabNavigator<StudentTabParamList>();

const TABS = [
  { name: 'Today' as const, component: TodayScreen },
  { name: 'Schedule' as const, component: ScheduleScreen },
  { name: 'Tests' as const, component: TestsScreen },
  { name: 'Me' as const, component: MeScreen },
];

export default function StudentNavigator() {
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
