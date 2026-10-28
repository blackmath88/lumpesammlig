/**
 * 010 — Pixels to Stitches: the charted patterns.
 *
 * A chart is the shared logic of pixels and stitches: one colour decision per
 * cell. The same charts drive every treatment in the comparison and the
 * working interface.
 */
import { glyph, type Glyph } from './stitch-vocabulary';

const ROSE = { '#': 1, o: 2, d: 3 };
const OLIVE = { '#': 4, o: 5, d: 6 };
const BOTANICAL = { '#': 4, o: 5, s: 9, c: 7, l: 8, y: 12 };
const CORAL = { '#': 7 };
const TURQ = { '#': 10, d: 11 };

export const HEART: Glyph = glyph(
  [
    '.ooo...###.',
    'oo#oo.####d',
    'o#########d',
    '###########',
    '.#########d',
    '..#######d.',
    '...#####d..',
    '....###d...',
    '.....#.....'
  ],
  ROSE
);

export const CHECK: Glyph = glyph(
  [
    '.......o',
    '......o#',
    '.....o#d',
    'o...o#d.',
    '#o.o#d..',
    'd#o#d...',
    '.d#d....',
    '..d.....'
  ],
  OLIVE
);

export const BOTANICAL_MOTIF: Glyph = glyph(
  [
    '.....lcc.....',
    '....lcccc....',
    '....ccccc....',
    '.....ycc.....',
    '......s......',
    '..oo..s..oo..',
    '.o###.s.###o.',
    'o####.s.####o',
    '.o###.s.###o.',
    '..oo..s..oo..',
    '......s......',
    '......s......'
  ],
  BOTANICAL
);

export const CROSS: Glyph = glyph(
  [
    '#.....#',
    '##...##',
    '.##.##.',
    '..###..',
    '.##.##.',
    '##...##',
    '#.....#'
  ],
  CORAL
);

/** A tiny charted alphabet for the one stitched label. 5 × 7, two tones. */
const LETTERS: Record<string, string[]> = {
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  ' ': ['..', '..', '..', '..', '..', '..', '..']
};

export function letteringGlyph(text: string): Glyph {
  const rows: string[] = ['', '', '', '', '', '', ''];
  for (const ch of text.toUpperCase()) {
    const l = LETTERS[ch] ?? LETTERS[' '];
    for (let r = 0; r < 7; r++) rows[r] += l[r] + '.';
  }
  return glyph(rows, TURQ);
}
