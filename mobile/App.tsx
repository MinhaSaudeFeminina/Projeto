import 'react-native-gesture-handler';

import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import {
  QuickActionsSheet,
  type QuickActionRoute,
} from './src/components/layout/QuickActionsSheet';
import { SafeAreaScreen } from './src/components/layout/SafeAreaScreen';
import { LoadingState } from './src/components/ui/LoadingState';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { AnonymousQuestionPage } from './src/pages/AnonymousQuestionPage';
import { ContentDetailPage } from './src/pages/ContentDetailPage';
import { ContentsPage } from './src/pages/ContentsPage';
import { CyclePage } from './src/pages/CyclePage';
import { LifeStagesPage } from './src/pages/LifeStagesPage';
import { LoginPage } from './src/pages/LoginPage';
import { NotFoundPage } from './src/pages/NotFoundPage';
import { ProfilePage } from './src/pages/ProfilePage';
import { RegisterPage } from './src/pages/RegisterPage';
import { RemindersPage } from './src/pages/RemindersPage';
import { SupportPage } from './src/pages/SupportPage';
import { SymptomsPage } from './src/pages/SymptomsPage';
import { TodayPage } from './src/pages/TodayPage';
import type {
  MainTabParamList,
  RootStackParamList,
} from './src/utils/navigationTypes';
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
  { fontFamily: theme.typography.fontFamily },
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
          borderTopColor: theme.colors.rosaLight,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily,
          fontSize: 12,
          fontWeight: theme.typography.weights.bold,
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

  const handleQuickNavigate = (
    route: QuickActionRoute,
    sourceAction?: string,
  ) => {
    if (route === 'Contents' || route === 'Cycle') {
      navigation.navigate(route);
      return;
    }

    navigation.getParent()?.navigate(route, sourceAction ? { sourceAction } : undefined);
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
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
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
          <Stack.Screen component={SymptomsPage} name="Symptoms" />
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
    ...theme.shadows.card,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderTopColor: theme.colors.rosaLight,
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
    fontSize: 12,
    fontWeight: theme.typography.weights.bold,
  },
  tabSlotWithAction: {
    alignItems: 'center',
    flex: 2,
    flexDirection: 'row',
  },
});
