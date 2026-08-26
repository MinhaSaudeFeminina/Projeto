import { Fragment, useMemo } from 'react';
import { Linking, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import {
  parseRichText,
  type InlineSpan,
  type RichTextBlock,
} from '../../utils/richText';
import { theme } from '../../utils/theme';

export type RichTextProps = {
  html: string | null | undefined;
  style?: StyleProp<ViewStyle>;
};

/** Indentation added per nested list level. */
const nestingIndent = theme.spacing.lg;

export function RichText({ html, style }: RichTextProps) {
  const blocks = useMemo(() => parseRichText(html), [html]);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {blocks.map((block, index) => (
        <Block block={block} first={index === 0} key={index} />
      ))}
    </View>
  );
}

function Block({ block, first }: { block: RichTextBlock; first: boolean }) {
  switch (block.kind) {
    case 'heading':
      return (
        <Text
          accessibilityRole="header"
          style={[
            block.level === 2 ? styles.heading2 : styles.heading3,
            first && styles.firstBlock,
          ]}
        >
          <Spans spans={block.spans} />
        </Text>
      );

    case 'quote':
      return (
        <View style={[styles.quote, first && styles.firstBlock]}>
          <View style={styles.quoteBar} />
          <Text style={styles.quoteText}>
            <Spans spans={block.spans} />
          </Text>
        </View>
      );

    case 'listItem':
      return (
        <View
          style={[
            styles.listItem,
            first && styles.firstBlock,
            block.depth > 0 && { marginLeft: block.depth * nestingIndent },
          ]}
        >
          <Text
            style={[styles.marker, block.ordered && styles.orderedMarker]}
          >
            {block.marker}
          </Text>
          <Text style={styles.listText}>
            <Spans spans={block.spans} />
          </Text>
        </View>
      );

    default:
      return (
        <Text style={[styles.paragraph, first && styles.firstBlock]}>
          <Spans spans={block.spans} />
        </Text>
      );
  }
}

function Spans({ spans }: { spans: InlineSpan[] }) {
  return (
    <>
      {spans.map((span, index) => (
        <Fragment key={index}>
          {span.href ? (
            <Text
              accessibilityRole="link"
              onPress={() => openLink(span.href)}
              style={[styles.link, markStyles(span)]}
            >
              {span.text}
            </Text>
          ) : (
            <Text style={markStyles(span)}>{span.text}</Text>
          )}
        </Fragment>
      ))}
    </>
  );
}

function markStyles({ marks }: InlineSpan): StyleProp<TextStyle> {
  return [
    marks.includes('bold') && styles.bold,
    marks.includes('italic') && styles.italic,
    marks.includes('strike') && styles.strike,
  ];
}

function openLink(href: string | null) {
  if (!href) {
    return;
  }

  // A blocked or malformed URL should not take the screen down.
  Linking.openURL(href).catch(() => undefined);
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: theme.typography.weights.bold,
  },
  container: {
    gap: theme.spacing.md,
  },
  firstBlock: {
    marginTop: 0,
  },
  heading2: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extraBold,
    lineHeight: 26,
    marginTop: theme.spacing.md,
  },
  heading3: {
    color: theme.colors.secondaryForeground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 23,
    marginTop: theme.spacing.sm,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
    textDecorationLine: 'underline',
  },
  listItem: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  listText: {
    color: theme.colors.foreground,
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 24,
  },
  marker: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 24,
    minWidth: 18,
  },
  orderedMarker: {
    textAlign: 'right',
  },
  paragraph: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 24,
  },
  quote: {
    backgroundColor: theme.colors.lilasLight,
    borderBottomRightRadius: theme.radii.md,
    borderTopRightRadius: theme.radii.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
    overflow: 'hidden',
    paddingRight: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  quoteBar: {
    backgroundColor: theme.colors.lilas,
    width: 4,
  },
  quoteText: {
    color: theme.colors.secondaryForeground,
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
});
