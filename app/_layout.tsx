import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // טיפול בשגיאות
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // קביעת מסלול התחלתי
  initialRouteName: '(tabs)',
};

// מונע מה-Splash Screen להיעלם לפני הטעינה
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // טיפול בשגיאות טעינה
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // הסתרת ה-Splash Screen כשהגופנים נטענים
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}


function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* מסלול של טאבים */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* מסכים נוספים */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="home" options={{ title: 'דף הבית' }} />
        <Stack.Screen name="login" options={{ title: 'התחברות' }} />
        <Stack.Screen name="register" options={{ title: 'הרשמה' }} />
      </Stack>
    </ThemeProvider>
  );
}
