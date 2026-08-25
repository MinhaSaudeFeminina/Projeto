import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type MainTabParamList = {
  Today: undefined;
  Cycle: undefined;
  Contents: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ContentDetail: { id: string };
  AnonymousQuestion: undefined;
  Symptoms: { sourceAction?: string } | undefined;
  Reminders: undefined;
  Support: undefined;
  LifeStages: undefined;
  NotFound: { attemptedRoute?: string } | undefined;
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;
export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type MainTabScreenProps<RouteName extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, RouteName>;

declare global {
  namespace ReactNavigation {
    // React Navigation expects interface merging for the root param list.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
