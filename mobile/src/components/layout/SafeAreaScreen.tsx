import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../utils/theme';

export type SafeAreaScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function SafeAreaScreen({
  children,
  style,
  contentStyle,
}: SafeAreaScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {contentStyle ? (
        <View style={contentStyle}>{children}</View>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
});
