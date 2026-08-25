import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../utils/theme';
import type { MainTabParamList } from '../../utils/navigationTypes';

export type BottomTabItem<RouteName extends keyof MainTabParamList> = {
  key: RouteName;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onPress: () => void;
};

export type BottomTabsProps = {
  items: BottomTabItem<keyof MainTabParamList>[];
  style?: StyleProp<ViewStyle>;
};

export function BottomTabs({ items, style }: BottomTabsProps) {
  return (
    <View style={[styles.container, style]}>
      {items.map((item) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: item.active }}
          key={item.key}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.item,
            item.active && styles.activeItem,
            pressed && styles.pressed,
          ]}
        >
          {item.icon}
          <Text
            numberOfLines={1}
            style={[styles.label, item.active && styles.activeLabel]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  activeItem: {
    backgroundColor: theme.colors.secondary,
  },
  activeLabel: {
    color: theme.colors.primary,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    borderRadius: theme.radii.md,
    flex: 1,
    gap: theme.spacing.xs,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  pressed: {
    opacity: 0.82,
  },
});
