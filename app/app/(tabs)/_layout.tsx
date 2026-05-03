import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import { theme } from '@/src/ui/theme';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.navBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 10,
          height: 64,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.label,
          fontSize: 11,
          letterSpacing: 0.8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'home',
          tabBarIcon: ({ color }) => <TabBarIcon name="dot-circle-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'history',
          tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
        }}
      />
    </Tabs>
  );
}
