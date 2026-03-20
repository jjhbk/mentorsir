import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import TodayScreen from '../screens/student/TodayScreen';
import ScheduleScreen from '../screens/student/ScheduleScreen';
import TestsScreen from '../screens/student/TestsScreen';
import ConnectScreen from '../screens/shared/ConnectScreen';
import MeScreen from '../screens/student/MeScreen';
import { colors } from '../theme/colors';
import { StudentTabParamList } from '../types';

const Tab = createBottomTabNavigator<StudentTabParamList>();

const TABS: { name: keyof StudentTabParamList; component: React.ComponentType<any>; icon: string }[] = [
  { name: 'Today',    component: TodayScreen,    icon: 'sun'        },
  { name: 'Schedule', component: ScheduleScreen, icon: 'calendar'   },
  { name: 'Tests',    component: TestsScreen,    icon: 'bar-chart-2'},
  { name: 'Connect',  component: ConnectScreen,  icon: 'message-circle' },
  { name: 'Me',       component: MeScreen,       icon: 'user'       },
];

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name)!;
        return {
          headerShown: false,
          tabBarStyle: s.bar,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={[s.tabItem, focused && s.tabItemActive]}>
              <Icon
                name={tab.icon}
                size={20}
                color={focused ? colors.accent : colors.textMuted}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        };
      }}
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
    height: 64,
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: colors.shadowMd,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: colors.accentLight,
  },
});
