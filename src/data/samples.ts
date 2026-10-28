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
  },
  {
    id: 'wordart',
    number: '008',
    title: 'WordArt',
    object: 'A remembered desktop publishing tool from the turn of the millennium: loud type, direct manipulation and effects with absolutely no shame.',
    material: 'Gradient fill / outline / extrusion / warp / selection handles / instant feedback',
    translation: 'A browser-native WordArt workbench where expressive typography behaves like a manipulable object rather than styled copy.',
    route: '/samples/008-wordart',
    status: 'live',
    technology: ['Astro', 'SVG', 'Vanilla JS']
  },
  {
    id: 'stitched-care',
    number: '009',
    title: 'Stitched Care',
    object: 'An embroidered needlepoint cover fitted to a curved clothes hanger: a humble support that received thousands of deliberate stitches.',
    material: 'Turquoise stitch field / rose, coral, pale flowers / olive leaves / brown curls / brown edging along the silhouette',
    translation: 'One shaped stitch grid rendered at two distances, revealed as a count of accumulated decisions.',
    route: '/samples/009-stitched-care',
    status: 'study',
    technology: ['Astro', 'Canvas 2D', 'Vanilla TS']
  },
  {
    id: 'pixels-to-stitches',
    number: '010',
    title: 'Pixels to Stitches',
    object: 'A question raised by the embroidered hanger: pixels and stitches share a chart, yet embroidery reads as warmer and handmade.',
    material: 'Charted marks / thread direction / volume and matte light / visible evenweave / controlled variation',
    translation: 'A still five-treatment comparison at interface size, then a small working list with stitched states.',
    route: '/samples/010-pixels-to-stitches',
    status: 'study',
    technology: ['Astro', 'Canvas 2D', 'Vanilla TS']
  },
  {
    id: 'thread-icons',
    number: '011',
    title: 'Thread Icons',
    object: 'A contemporary embroidered icon set for digital interfaces: six familiar icons made of thread, with a streetwear-patch attitude.',
    material: 'Satin fills following each shape / fanned stitches on curves / cord outlines / layered regions / knots',
    translation: 'Build-time SVG stitch vocabulary, six icons at 24, 32 and 48 px on light and dark surfaces, in a working toolbar.',
    route: '/samples/011-thread-icons',
    status: 'study',
    technology: ['Astro', 'SVG', 'Vanilla TS']
  }
  {
    id: 'impossible-index',
    number: '012',
    title: 'The Impossible Index',
    object: 'A card catalogue encountered through the problem of rediscovering already-solved software issues.',
    material: 'Preclassified records / paper index / provenance / ranking',
    translation: 'A short query reorders a finite pre-indexed collection and exposes why each card matched.',
    route: '/samples/012-impossible-index',
    status: 'study',
    technology: ['Astro', 'Vanilla TS', 'SVG-free semantic cards']
  },
  {
    id: 'switchboard',
    number: '013',
    title: 'The Switchboard',
    object: 'A telephone switchboard read as temporary connections between independent voices.',
    material: 'Endpoints / connections / routing / operator authority',
    translation: 'Topic lenses reroute a visible conversation without rewriting its attributed source contributions.',
    route: '/samples/013-switchboard',
    status: 'study',
    technology: ['Astro', 'SVG', 'Vanilla TS']
  },
];