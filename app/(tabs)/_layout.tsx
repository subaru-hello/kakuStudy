// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // tabBarActiveTintColor: "#ffd33d",
        // headerStyle: { backgroundColor: "#25292e" },
        // headerShadowVisible: false,
        // headerTintColor: "#fff",
        // tabBarStyle: { backgroundColor: "#25292e" },
      }}
    >
      {/* Homeタブ */}
      <Tabs.Screen
        name="index" // => app/(tabs)/index.tsx が読み込まれる
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 勉強タブ */}
      <Tabs.Screen
        name="study"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
