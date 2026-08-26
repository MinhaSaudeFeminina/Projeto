/**
 * Parses the educational content body into blocks the app can render.
 *
 * The markup is produced by the admin TipTap editor and narrowed server-side by
 * HtmlBodySanitizer to a closed set of tags: p, br, strong, em, s, h2, h3, ul,
 * ol, li, blockquote and a[href]. Older content is plain text with no tags at
 * all, so bare text is treated as a paragraph.
 */

export type InlineMark = 'bold' | 'italic' | 'strike';

export type InlineSpan = {
  text: string;
  marks: InlineMark[];
  href: string | null;
};

export type RichTextBlock =
  | { kind: 'heading'; level: 2 | 3; spans: InlineSpan[] }
  | { kind: 'paragraph'; spans: InlineSpan[] }
  | { kind: 'quote'; spans: InlineSpan[] }
  | {
      kind: 'listItem';
      ordered: boolean;
      marker: string;
      depth: number;
      spans: InlineSpan[];
    };

type ElementNode = {
  type: 'element';
  tag: string;
  href: string | null;
  children: HtmlNode[];
};

type TextNode = { type: 'text'; value: string };

type HtmlNode = ElementNode | TextNode;

const markByTag: Record<string, InlineMark> = {
  b: 'bold',
  del: 'strike',
  em: 'italic',
  i: 'italic',
  s: 'strike',
  strike: 'strike',
  strong: 'bold',
};

const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

export function parseRichText(html: string | null | undefined): RichTextBlock[] {
  if (!html?.trim()) {
    return [];
  }

  const blocks: RichTextBlock[] = [];

  collectBlocks(parseNodes(html), blocks, 0);

  return blocks.filter((block) =>
    block.spans.some((span) => span.text.trim().length > 0),
  );
}

function parseNodes(html: string): HtmlNode[] {
  const root: ElementNode = {
    type: 'element',
    tag: 'root',
    href: null,
    children: [],
  };
  const stack: ElementNode[] = [root];
  const tagPattern = /<(\/)?\s*([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>])*)>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html)) !== null) {
    const [raw, closingSlash, name, attributes] = match;

    appendText(stack, html.slice(cursor, match.index));
    cursor = tagPattern.lastIndex;

    const tag = name.toLowerCase();

    if (closingSlash) {
      closeTag(stack, tag);
      continue;
    }

    const element: ElementNode = {
      type: 'element',
      tag,
      href: tag === 'a' ? extractHref(attributes) : null,
      children: [],
    };

    stack[stack.length - 1].children.push(element);

    if (tag !== 'br' && !raw.trimEnd().endsWith('/>')) {
      stack.push(element);
    }
  }

  appendText(stack, html.slice(cursor));

  return root.children;
}

function appendText(stack: ElementNode[], value: string) {
  if (value.length > 0) {
    stack[stack.length - 1].children.push({ type: 'text', value });
  }
}

/**
 * Closes the nearest matching ancestor. An unmatched closing tag is ignored so
 * a stray `</div>` cannot unwind the whole document.
 */
function closeTag(stack: ElementNode[], tag: string) {
  for (let index = stack.length - 1; index > 0; index -= 1) {
    if (stack[index].tag === tag) {
      stack.length = index;
      return;
    }
  }
}

function extractHref(attributes: string) {
  const match = /href\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attributes);

  return match ? decodeEntities(match[2] ?? match[3] ?? '') : null;
}

function collectBlocks(
  nodes: HtmlNode[],
  blocks: RichTextBlock[],
  depth: number,
) {
  for (const node of nodes) {
    if (node.type === 'text') {
      pushSpans(blocks, { kind: 'paragraph', spans: [] }, [node]);
      continue;
    }

    switch (node.tag) {
      case 'h2':
      case 'h3':
        pushSpans(
          blocks,
          { kind: 'heading', level: node.tag === 'h2' ? 2 : 3, spans: [] },
          node.children,
        );
        break;

      case 'blockquote':
        collectQuote(node.children, blocks, depth);
        break;

      case 'ul':
      case 'ol':
        collectList(node, blocks, depth);
        break;

      case 'p':
        pushSpans(blocks, { kind: 'paragraph', spans: [] }, node.children);
        break;

      default:
        // Any other wrapper the sanitizer let through keeps its content.
        collectBlocks(node.children, blocks, depth);
    }
  }
}

function collectQuote(
  nodes: HtmlNode[],
  blocks: RichTextBlock[],
  depth: number,
) {
  const inner: RichTextBlock[] = [];

  collectBlocks(nodes, inner, depth);

  if (inner.length === 0) {
    pushSpans(blocks, { kind: 'quote', spans: [] }, nodes);
    return;
  }

  for (const block of inner) {
    blocks.push({ kind: 'quote', spans: block.spans });
  }
}

function collectList(
  list: ElementNode,
  blocks: RichTextBlock[],
  depth: number,
) {
  const ordered = list.tag === 'ol';
  let position = 0;

  for (const child of list.children) {
    if (child.type !== 'element' || child.tag !== 'li') {
      continue;
    }

    position += 1;

    const nested = child.children.filter(
      (node) => node.type === 'element' && (node.tag === 'ul' || node.tag === 'ol'),
    );
    const inline = child.children.filter((node) => !nested.includes(node));

    pushSpans(
      blocks,
      {
        kind: 'listItem',
        depth,
        marker: ordered ? `${position}.` : '•',
        ordered,
        spans: [],
      },
      inline,
    );

    collectBlocks(nested, blocks, depth + 1);
  }
}

function pushSpans(
  blocks: RichTextBlock[],
  block: RichTextBlock,
  nodes: HtmlNode[],
) {
  collectSpans(nodes, [], null, block.spans);
  blocks.push(block);
}

function collectSpans(
  nodes: HtmlNode[],
  marks: InlineMark[],
  href: string | null,
  spans: InlineSpan[],
) {
  for (const node of nodes) {
    if (node.type === 'text') {
      const text = decodeEntities(node.value);

      // Whitespace between block tags is layout, not content.
      if (text.trim().length > 0 || spans.length > 0) {
        spans.push({ href, marks, text });
      }

      continue;
    }

    if (node.tag === 'br') {
      spans.push({ href, marks, text: '\n' });
      continue;
    }

    const mark = markByTag[node.tag];

    collectSpans(
      node.children,
      mark && !marks.includes(mark) ? [...marks, mark] : marks,
      node.tag === 'a' ? node.href : href,
      spans,
    );
  }
}

function decodeEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#')) {
      const codePoint = code.startsWith('#x') || code.startsWith('#X')
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);

      return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
    }

    return namedEntities[code.toLowerCase()] ?? entity;
  });
}
