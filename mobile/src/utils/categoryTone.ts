import type { AppChipTone } from '../components/ui/AppChip';

const tones: AppChipTone[] = ['rosa', 'lilas', 'roxo', 'magenta', 'fertile'];

/**
 * Categories are user-managed on the backend and carry no colour, so the tone
 * is derived from the slug: stable across renders, varied across categories.
 */
export function categoryTone(slug: string | null | undefined): AppChipTone {
  if (!slug) {
    return 'primary';
  }

  const hash = Array.from(slug).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return tones[hash % tones.length];
}
