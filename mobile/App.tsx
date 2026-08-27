import 'react-native-gesture-handler';

import {
  BarlowCondensed_400Regular,
  BarlowCondensed_400Regular_Italic,
  BarlowCondensed_500Medium,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
} from '@expo-google-fonts/barlow-condensed';
import { LeckerliOne_400Regular } from '@expo-google-fonts/leckerli-one';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import {
  QuickActionsSheet,
  type QuickActionTarget,
} from './src/components/layout/QuickActionsSheet';
import { SafeAreaScreen } from './src/components/layout/SafeAreaScreen';
import { LoadingState } from './src/components/ui/LoadingState';
import { getDatabase } from './src/db/database';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { AnonymousQuestionPage } from './src/pages/AnonymousQuestionPage';
import { ContentDetailPage } from './src/pages/ContentDetailPage';
import { ContentsPage } from './src/pages/ContentsPage';
import { CycleHistoryPage } from './src/pages/CycleHistoryPage';
import { CyclePage } from './src/pages/CyclePage';
import { DayLogPage } from './src/pages/DayLogPage';
import { LifeStagesPage } from './src/pages/LifeStagesPage';
import { LoginPage } from './src/pages/LoginPage';
import { NotFoundPage } from './src/pages/NotFoundPage';
import { PeriodEditorPage } from './src/pages/PeriodEditorPage';
import { ProfilePage } from './src/pages/ProfilePage';
import { RegisterPage } from './src/pages/RegisterPage';
import { RemindersPage } from './src/pages/RemindersPage';
import { SupportPage } from './src/pages/SupportPage';
import { TodayPage } from './src/pages/TodayPage';
import type {
  MainTabParamList,
  RootStackParamList,
} from './src/utils/navigationTypes';
import { todayIso } from './src/utils/date';
import { theme } from './src/utils/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const defaultTextProps = Text as typeof Text & {
  defaultProps?: {
    style?: unknown;
  };
};

defaultTextProps.defaultProps = defaultTextProps.defaultProps ?? {};
defaultTextProps.defaultProps.style = [
  {
    fontFamily: theme.typography.fonts.regular,
    letterSpacing: theme.typography.letterSpacing,
  },
  defaultTextProps.defaultProps.style,
];

const screenTitles: Record<keyof MainTabParamList, string> = {
  Today: 'Hoje',
  Cycle: 'Ciclo',
  Contents: 'Conteudos',
  Profile: 'Perfil',
};

const tabIcons: Record<
  keyof MainTabParamList,
  ComponentProps<typeof Ionicons>['name']
> = {
  Today: 'home',
  Cycle: 'calendar',
  Contents: 'book',
  Profile: 'person',
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fonts.bold,
          fontSize: 12,
          letterSpacing: theme.typography.letterSpacing,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={tabIcons[route.name]} size={size} />
        ),
      })}
    >
      <Tab.Screen
        component={TodayPage}
        name="Today"
        options={{ title: screenTitles.Today }}
      />
      <Tab.Screen
        component={CyclePage}
        name="Cycle"
        options={{ title: screenTitles.Cycle }}
      />
      <Tab.Screen
        component={ContentsPage}
        name="Contents"
        options={{ title: screenTitles.Contents }}
      />
      <Tab.Screen
        component={ProfilePage}
        name="Profile"
        options={{ title: screenTitles.Profile }}
      />
    </Tab.Navigator>
  );
}

function MainTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);

  const handleQuickNavigate = (target: QuickActionTarget) => {
    if (target.route === 'Contents' || target.route === 'Cycle') {
      navigation.navigate(target.route);
      return;
    }

    if (target.route === 'DayLog') {
      navigation.getParent()?.navigate('DayLog', {
        date: todayIso(),
        focus: target.focus,
        symptomKey: target.symptomKey,
      });
      return;
    }

    navigation.getParent()?.navigate(target.route);
  };

  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const isFocused = state.index === index;
          const color = isFocused ? theme.colors.primary : theme.colors.tabInactive;
          const iconName = tabIcons[route.name as keyof MainTabParamList];
          const label =
            typeof options.title === 'string'
              ? options.title
              : screenTitles[route.name as keyof MainTabParamList];

          const handlePress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const item = (
            <Pressable
              // Without an explicit label the icon glyph becomes part of the
              // accessible name, so a screen reader announces it before "Ciclo".
              accessibilityLabel={label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              key={route.key}
              onPress={handlePress}
              style={styles.tabItem}
            >
              <Ionicons color={color} name={iconName} size={22} />
              <Text
                numberOfLines={1}
                style={[styles.tabLabel, isFocused && styles.activeTabLabel]}
              >
                {label}
              </Text>
            </Pressable>
          );

          if (index === 2) {
            return (
              <View key={route.key} style={styles.tabSlotWithAction}>
                <Pressable
                  accessibilityLabel="Abrir acoes rapidas"
                  accessibilityRole="button"
                  onPress={() => setQuickActionsVisible(true)}
                  style={styles.quickActionButton}
                >
                  <Ionicons color={theme.colors.primaryForeground} name="add" size={30} />
                </Pressable>
                {item}
              </View>
            );
          }

          return item;
        })}
      </View>

      <QuickActionsSheet
        onClose={() => setQuickActionsVisible(false)}
        onNavigate={handleQuickNavigate}
        visible={quickActionsVisible}
      />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BarlowCondensed_400Regular,
    BarlowCondensed_400Regular_Italic,
    BarlowCondensed_500Medium,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    LeckerliOne_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    // React Navigation only provides a safe area context to screens inside a
    // navigator, and RootNavigator renders its loading state above one.
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { initializing, session } = useAuthContext();

  // Warm the database up so the first Ciclo screen is not cold. Deliberately
  // not awaited: a failure here has to surface as an error message on the
  // screen that needed data, not as a blank app.
  useEffect(() => {
    if (session) {
      void getDatabase().catch(() => undefined);
    }
  }, [session]);

  if (initializing) {
    return (
      <SafeAreaScreen>
        <LoadingState
          message="Estamos preparando sua sessao."
          title="Entrando"
        />
      </SafeAreaScreen>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerShown: false,
      }}
    >
      {session ? (
        <>
          <Stack.Screen component={MainTabs} name="MainTabs" />
          <Stack.Screen component={ContentDetailPage} name="ContentDetail" />
          <Stack.Screen
            component={AnonymousQuestionPage}
            name="AnonymousQuestion"
          />
          <Stack.Screen component={DayLogPage} name="DayLog" />
          <Stack.Screen component={PeriodEditorPage} name="PeriodEditor" />
          <Stack.Screen component={CycleHistoryPage} name="CycleHistory" />
          <Stack.Screen component={RemindersPage} name="Reminders" />
          <Stack.Screen component={SupportPage} name="Support" />
          <Stack.Screen component={LifeStagesPage} name="LifeStages" />
          <Stack.Screen component={NotFoundPage} name="NotFound" />
        </>
      ) : (
        <>
          <Stack.Screen component={LoginPage} name="Login" />
          <Stack.Screen component={RegisterPage} name="Register" />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  activeTabLabel: {
    color: theme.colors.primary,
  },
  quickActionButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryForeground,
    borderRadius: 28,
    borderWidth: 4,
    height: 56,
    justifyContent: 'center',
    marginTop: -28,
    width: 56,
    ...theme.shadows.raised,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 72,
    paddingBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 48,
  },
  tabLabel: {
    color: theme.colors.tabInactive,
    fontFamily: theme.typography.fonts.bold,
    fontSize: 12,
  },
  tabSlotWithAction: {
    alignItems: 'center',
    flex: 2,
    flexDirection: 'row',
  },
});
