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
  },
  {
    id: 'soft-green-macrame',
    number: '003',
    title: 'Soft Green',
    object: 'A 3.5 mm macramé cord whose fine fibres become load-bearing through twist.',
    material: 'Wound cotton cord / matte fuzz / compression / helical structure',
    translation: 'A procedural height field lit as dense, dry, diagonally wound fibre.',
    route: '/samples/003-soft-green',
    status: 'study',
    technology: ['React island', 'Raw WebGL', 'GLSL']
  },
  {
    id: 'blue-coil-basket',
    number: '004',
    title: 'Blue Coil',
    object: 'A hand-wrapped basket lid built by accumulating natural fibre around a raised centre.',
    material: 'Coiled plant fibre / indigo binding / radial repetition / handmade drift',
    translation: 'A procedural concentric relief whose light reveals wrapping, compression and interruption.',
    route: '/samples/004-blue-coil',
    status: 'study',
    technology: ['React island', 'Raw WebGL', 'GLSL']
  },
  {
    id: 'flaked-blue-painted-wood',
    number: '006',
    title: 'Flaked Blue',
    object: 'An old blue-grey painted wooden surface failing beside a window.',
    material: 'Chalky paint / brittle flakes / pale undercoat / directional wood grain',
    translation: 'A layered erosion field whose height and shadows expose accumulated material history.',
    route: '/samples/006-flaked-blue',
    status: 'study',
    technology: ['React island', 'Raw WebGL', 'GLSL']
  },
  {
    id: 'blue-printed-paper',
    number: '007',
    title: 'Blue Printed Paper',
    object: 'A dusty indigo decorative paper whose cream dashes gather into overlapping radial fields.',
    material: 'Fibrous paper / absorbed pigment / feathered print / systematic drift',
    translation: 'A seeded print system whose every mark inherits one coherent field of material error.',
    route: '/samples/007-blue-printed-paper',
    status: 'study',
    technology: ['React island', 'Raw WebGL', 'GLSL']
  }
];
