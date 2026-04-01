import { AppTheme, Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { BookOpen, Settings } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Leitura",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size ?? AppTheme.iconSize.md} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Configurações",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size ?? AppTheme.iconSize.md} />
          ),
        }}
      />

      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="highlights" options={{ href: null }} />
      <Tabs.Screen name="reader/[bookId]/[chapter]" options={{ href: null }} />
    </Tabs>
  );
}
