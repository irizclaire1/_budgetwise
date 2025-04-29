import { Tabs } from 'expo-router';
import { Bot, Home, PlusCircle, ScanText, Wallet } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00C897', // Active icon/text color
        tabBarInactiveTintColor: '#888',   // Inactive icon/text color
        tabBarStyle: {
          backgroundColor: '#ffffff', // Background color of tab bar
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          title: 'Expense',
          tabBarIcon: ({ color }) => <PlusCircle color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <ScanText color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <Wallet color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color }) => <Bot color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}