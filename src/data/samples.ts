export type Sample = {
  id: string;
  number: string;
  title: string;
  object: string;
  material: string;
  translation: string;
  route: string;
  status: 'live' | 'study';
  technology: readonly string[];
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
    status: 'live',
    technology: ['React island', 'Canvas 2D']
  }
];
