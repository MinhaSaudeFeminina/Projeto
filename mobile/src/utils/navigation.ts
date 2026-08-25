import type { NavigationProp } from '@react-navigation/native';

import type { RootStackParamList } from './navigationTypes';

export function navigateBackOrToday(
  navigation: NavigationProp<RootStackParamList>,
) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  navigation.navigate('MainTabs', { screen: 'Today' });
}

export function navigateToNotFound(
  navigation: NavigationProp<RootStackParamList>,
  attemptedRoute?: string,
) {
  navigation.navigate('NotFound', attemptedRoute ? { attemptedRoute } : undefined);
}
