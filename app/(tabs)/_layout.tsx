import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderTopWidth: 1,
          borderTopColor: '#404040',
          height: 84 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 8,
          position: 'absolute',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="folder" 
              size={24} 
              color={focused ? '#0A84FF' : '#A0A0A0'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="bar-chart" 
              size={24} 
              color={focused ? '#0A84FF' : '#A0A0A0'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="person" 
              size={24} 
              color={focused ? '#0A84FF' : '#A0A0A0'} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

