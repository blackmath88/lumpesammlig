export type Sample = {
  id: string;
  number: string;
  title: string;
  object: string;
  material: string;
  translation: string;
  route: string;
  status: 'live' | 'study' | 'planned';
};

export const samples: Sample[] = [
  {
    id: 'waschlumpe',
    number: '001',
    title: 'Waschlumpe',
    object: 'A loosely knitted washcloth with a lilac → sage → mint colour fade.',
    material: 'Open cotton knit / irregular tension / soft fibre',
    translation: 'Procedural textile surface, pointer tension and slow cloth-like waves.',
    route: '/samples/001-waschlumpe',
    status: 'live'
  },
  {
    id: 'placeholder-002',
    number: '002',
    title: 'Next object',
    object: 'Reserved for the next real-world find.',
    material: 'Unknown',
    translation: 'Unknown',
    route: '#library',
    status: 'planned'
  },
  {
    id: 'placeholder-003',
    number: '003',
    title: 'Next object',
    object: 'Another material, mechanism or accidental interface.',
    material: 'Unknown',
    translation: 'Unknown',
    route: '#library',
    status: 'planned'
  }
];
