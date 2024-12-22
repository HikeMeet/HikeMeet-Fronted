import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';

<<<<<<< HEAD
// הגדרה ל-nativewind
NativeWindStyleSheet.setOutput({
  default: 'native',
});
=======
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
>>>>>>> a668193141a01f38c19ce6b78299ae9d1d99ca25

export default function Layout() {
  return (
<<<<<<< HEAD
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8f9fa' },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
=======
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
>>>>>>> a668193141a01f38c19ce6b78299ae9d1d99ca25
  );
}
