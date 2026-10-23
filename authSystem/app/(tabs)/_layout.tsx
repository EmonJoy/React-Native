import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        // নেভিগেশন বারের ব্যাকগ্রাউন্ড এবং টেক্সট কালার
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopColor: isDark ? '#334155' : '#e2e8f0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#FF00FF', // সিলেক্টেড বাটনের কালার
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8', // আন-সিলেক্টেড বাটনের কালার
        headerStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#0f172a',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* প্রথম ট্যাব: হোম — ক্লিক করলে লগইন চেক হবে */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (user) {
              // ইউজার লগইন করা আছে → ডিফল্ট ট্যাব নেভিগেশন বন্ধ করো এবং ড্যাশবোর্ডে পাঠাও
              e.preventDefault();
              router.push('/dashboard');
            }
            // ইউজার লগইন করা নেই → ডিফল্ট behavior চলবে (index/login স্ক্রিন দেখাবে)
          },
        }}
      />

      {/* দ্বিতীয় ট্যাব: প্রোফাইল */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* তৃতীয় ট্যাব: সেটিংস */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
