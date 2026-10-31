export const FLOORS = [
  {
    id: 'roof', num: 'R', name: 'Plant room',
    lead: 'A website built like a building.',
    windows: [
      { h: 'What this is', p: 'One concrete elevation you scroll from roof to ground. Every section is a floor, every panel is a window, navigation is the lift. Nothing here is a photograph: the concrete is CSS.' },
      { h: 'How to use it', p: 'Press a lift button or scroll. The indicator in the stair tower follows you. Flip the switch to night and the windows light up.' },
    ],
  },
  {
    id: 'studio', num: '3', name: 'Studio',
    lead: 'Mass first, detail later.',
    windows: [
      { h: 'Practice', p: 'Lumpesammlig collects encounters and turns them into interactive experiments. This block is the loud sibling of Study 014: where that one tested a behaviour, this one wears the building.' },
      { h: 'Material', p: 'Board-formed concrete, deep reveals, weathering under every sill. Imperfections are placed, not random, so the elevation is the same on every visit.' },
      { h: 'Rule', p: 'If a thing is a window, it is cut into the wall. Nothing floats in front of the façade.' },
    ],
  },
  {
    id: 'works', num: '2', name: 'Works',
    lead: 'The floor that projects.',
    cantilever: true,
    windows: [
      { h: '014 Mass / Opening', p: 'Six bays that make room when one opens.', tag: 'Study' },
      { h: '013 The Switchboard', p: 'Patch, read and release two temporary comparisons.', tag: 'Study' },
      { h: '012 Impossible Index', p: 'Hold a place while the catalogue moves around it.', tag: 'Study' },
      { h: '008 WordArt', p: 'Loud type as a manipulable object.', tag: 'Live' },
      { h: '009 Stitched Care', p: 'Thousands of deliberate stitches, counted.', tag: 'Study' },
      { h: '001 Waschlumpe', p: 'A knitted surface under pointer tension.', tag: 'Live' },
    ],
  },
  {
    id: 'archive', num: '1', name: 'Archive',
    lead: 'Narrow slots, long memory.',
    slots: true,
    windows: [
      { h: 'Concept', p: 'Encounter, reading, distinction, transformation, experiment, reflection.' },
      { h: 'Architecture', p: 'Deterministic about evidence and execution. Non-deterministic about interpretation.' },
      { h: 'Ledger', p: 'What was built, what was checked, what remains open.' },
      { h: 'Research', p: 'Sources consulted, commits noted, nothing invented.' },
    ],
  },
  {
    id: 'ground', num: 'G', name: 'Ground',
    lead: 'Entrance under the pilotis.',
    ground: true,
    windows: [
      { h: 'Enter the collection', p: 'github.com/blackmath88/lumpesammlig', href: 'https://github.com/blackmath88/lumpesammlig' },
    ],
  },
];
