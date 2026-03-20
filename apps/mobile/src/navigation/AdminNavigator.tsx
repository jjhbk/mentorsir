import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StudentsListScreen from '../screens/mentor/StudentsListScreen';
import StudentDetailScreen from '../screens/mentor/StudentDetailScreen';
import { colors } from '../theme/colors';
import { AdminTabParamList, MentorStudentsStackParamList } from '../types';

const Tab = createBottomTabNavigator<AdminTabParamList>();
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

// Stub screens for Mentors and Settings tabs
function MentorsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="users" size={40} color={colors.textFaint} />
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16 }}>Mentors</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6 }}>Mentor management coming soon</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="settings" size={40} color={colors.textFaint} />
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16 }}>Settings</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6 }}>Programme settings coming soon</Text>
    </View>
  );
}

const TABS: { name: keyof AdminTabParamList; component: React.ComponentType<any>; icon: string }[] = [
  { name: 'Overview',  component: AdminDashboardScreen, icon: 'bar-chart-2' },
  { name: 'Students',  component: StudentsNavigator,    icon: 'users'       },
  { name: 'Mentors',   component: MentorsScreen,        icon: 'user-check'  },
  { name: 'Settings',  component: SettingsScreen,       icon: 'settings'    },
];

export default function AdminNavigator() {
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
  tabItemActive: { backgroundColor: colors.accentLight },
});
