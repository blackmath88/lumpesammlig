import { useEffect, useRef } from 'react';
import { DEFAULT_PAINT_PARAMETERS, type PaintParameters } from './material/parameters';
import './paint-field.css';

export type PaintQuality='micro'|'small'|'full';
type PaintFieldProps={bare?:boolean;parameters?:PaintParameters;quality?:PaintQuality;interactive?:boolean;className?:string;label?:string};

const vertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * .5 + .5;
    gl_Position = vec4(position, 0., 1.);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 resolution;
  uniform vec2 pointer;
  uniform vec4 physicalA;
  uniform vec4 physicalB;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3. - 2. * f);
    return mix(mix(hash21(i), hash21(i + vec2(1., 0.)), f.x),
               mix(hash21(i + vec2(0., 1.)), hash21(i + 1.), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.;
    float amplitude = .52;
    mat2 rotation = mat2(.86, -.5, .5, .86);
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = rotation * p * 2.03 + 13.7;
      amplitude *= .49;
    }
    return value;
  }

  float flakeIsland(vec2 uv, vec2 center, vec2 size, float seed) {
    vec2 local = (uv - center) / size;
    float tornEdge = (fbm(uv * vec2(31., 43.) + seed) - .5) * .84;
    float split = sin((local.y + fbm(uv * 13. + seed * 2.)) * 14.) * .085;
    return 1. - smoothstep(.72, .97, length(local) + tornEdge + split);
  }

  vec4 strata(vec2 uv) {
    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 p = vec2(uv.x * aspect, uv.y);
    vec2 warp = vec2(fbm(p * vec2(2.1, .72) + 7.4), fbm(p * vec2(1.5, 1.1) + 31.));
    vec2 q = p + (warp - .5) * vec2(.105, .035);

    float longWear = fbm(vec2(q.x * 2.7, q.y * .76) + vec2(4., 17.));
    float brokenMass = fbm(q * vec2(6.4, 2.25) + vec2(-9., 5.));
    float ageBand = sin(q.x * 8.7 + fbm(q * vec2(1.65, .62)) * 3.6) * .5 + .5;
    float concentration = smoothstep(.58, .9, ageBand) * smoothstep(.48, .73, fbm(q * vec2(3.5, .92) + 81.));
    float chipEdge = fbm(q * vec2(13.2, 4.1) + vec2(37., -14.));
    float erosion = longWear * .46 + brokenMass * .43 + concentration * .105;
    erosion += (chipEdge - .5) * .14 * smoothstep(.51, .67, longWear + brokenMass * .16);
    float scarAxis = .68 + (fbm(vec2(q.y * 1.35, 4.2)) - .5) * .15;
    float scarBreak = smoothstep(.43, .65, fbm(q * vec2(7.2, 2.55) + vec2(71., 6.)));
    float scar = smoothstep(.095, .018, abs(uv.x - scarAxis)) * scarBreak;
    float oldScarAxis = .27 + (fbm(vec2(q.y * 1.8, 29.)) - .5) * .09;
    float oldScar = smoothstep(.055, .012, abs(uv.x - oldScarAxis));
    oldScar *= smoothstep(.53, .74, fbm(q * vec2(5.4, 2.8) + 12.));
    erosion += scar * .18 + oldScar * .1;
    float flakeCluster = flakeIsland(uv, vec2(.73, .25), vec2(.065, .13), 5.);
    flakeCluster = max(flakeCluster, flakeIsland(uv, vec2(.79, .48), vec2(.044, .086), 17.));
    flakeCluster = max(flakeCluster, flakeIsland(uv, vec2(.66, .64), vec2(.034, .07), 31.));
    flakeCluster = max(flakeCluster, flakeIsland(uv, vec2(.29, .29), vec2(.027, .065), 47.));
    flakeCluster = max(flakeCluster, flakeIsland(uv, vec2(.24, .72), vec2(.042, .092), 63.));
    float failure = max(erosion, .622 + flakeCluster * .115);
    failure += (physicalA.y - .58) * .16 + (.74 - physicalA.x) * .22;

    float lostPaint = smoothstep(.66, .692, failure);
    float depthHistory = fbm(q * vec2(8.1, 2.8) + vec2(27., -8.));
    float rawWood = lostPaint * smoothstep(mix(.94,.66,physicalB.z), mix(1.02,.78,physicalB.z), depthHistory + longWear * .055 + flakeCluster * .045);
    float undercoat = lostPaint * (1. - rawWood) * mix(.35,1.15,physicalB.y);
    float paint = 1. - lostPaint;

    float edgeDistance = abs(failure - .676);
    float liftedEdge = (1. - smoothstep(.005, .032, edgeDistance)) * paint;
    liftedEdge *= (.55 + .45 * noise(q * vec2(28., 11.))) * mix(.1,1.7,physicalB.x);

    float verticalCrack = abs(fract(q.x * 5.1 + fbm(vec2(q.y * 1.8, q.x * 3.1) + 43.) * 1.55) - .5);
    float branchCrack = abs(fract((q.x + q.y * .14) * 4.2 + fbm(q * vec2(1.7, 3.1) + 19.) * 1.28) - .5);
    float crackMix = mix(verticalCrack, min(verticalCrack,branchCrack), physicalA.w);
    float crack = (1. - smoothstep(.003, mix(.006,.014,physicalA.z), crackMix)) * paint;
    crack *= smoothstep(.55, .76, fbm(q * vec2(3.8, 1.55) + 103.));

    float woodGrain = sin(q.y * 11. + fbm(vec2(q.x * 8., q.y * .42)) * 7.);
    float height = .11 + woodGrain * .012;
    height = mix(height, .35 + noise(q * 35.) * .018, undercoat);
    height = mix(height, .71 + fbm(q * vec2(8., 2.1)) * .028, paint);
    height += liftedEdge * .13;
    height -= crack * .045;
    return vec4(height, clamp(paint, 0., 1.), clamp(undercoat, 0., 1.), clamp(rawWood, 0., 1.));
  }

  void main() {
    vec2 texel = 1. / resolution;
    vec4 data = strata(vUv);
    vec4 dataX = strata(vUv + vec2(texel.x * 1.6, 0.));
    vec4 dataY = strata(vUv + vec2(0., texel.y * 1.6));
    float hx = dataX.x - data.x;
    float hy = dataY.x - data.x;
    vec3 normal = normalize(vec3(-hx * 30., -hy * 30., 1.));

    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    float grain = fbm(p * vec2(3.2, 23.) + vec2(13., 2.));
    float pigment = fbm(p * vec2(38., 28.) + 47.);
    float woodLine = sin(vUv.y * 116. + fbm(vec2(p.x * 13., vUv.y * 2.1)) * 9.);

    vec3 woodDark = vec3(.275, .205, .145);
    vec3 woodLight = vec3(.54, .405, .275);
    vec3 wood = mix(woodDark, woodLight, .5 + woodLine * .19 + grain * .16);
    vec3 primer = vec3(.69, .675, .585) * (.87 + pigment * .16);
    vec3 paint = vec3(.245, .37, .395);
    paint *= .83 + grain * .15 + pigment * .08;
    paint += vec3(.025, .03, .026) * smoothstep(.67, .9, grain);

    vec3 color = wood;
    color = mix(color, primer, data.z);
    color = mix(color, paint, data.y);

    float edge = 1. - smoothstep(.016, .13, abs(data.x - .52));
    float lowerOcclusion = edge * (1. - data.y) * .38;
    vec2 lightShift = (pointer - .5) * vec2(.16, .1);
    vec3 light = normalize(vec3(mix(-.76,.08,physicalB.w) + lightShift.x, .42 - lightShift.y, .9));
    float diffuse = max(dot(normal, light), 0.);
    float broad = max(dot(normal, light) * .5 + .5, 0.);
    color *= .54 + diffuse * .25 + broad * .22;
    color *= 1. - lowerOcclusion;

    float scratchX = abs(sin((p.x * 69. + fbm(vec2(p.x, vUv.y * 2.)) * 5.) * 3.14159));
    float scratchGate = smoothstep(.73, .91, noise(vec2(floor(p.x * 29.), floor(vUv.y * 13.))));
    float scratches = smoothstep(.985, .998, scratchX) * scratchGate * data.y;
    color = mix(color, color + vec3(.11, .12, .1), scratches * .35);
    color *= .94 + (hash21(gl_FragCoord.xy) - .5) * .035;

    float vignette = 1. - smoothstep(.42, 1., length((vUv - .5) * vec2(.72, 1.)));
    color *= .84 + vignette * .18;
    color = pow(color, vec3(.92));
    gl_FragColor = vec4(color, 1.);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function PaintField({bare=false,parameters=DEFAULT_PAINT_PARAMETERS,quality='full',interactive=true,className='',label='Procedural macro study of flaking blue-grey paint above pale undercoat and wood'}:PaintFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parametersRef=useRef(parameters);const requestDrawRef=useRef<()=>void>(()=>{});parametersRef.current=parameters;
  useEffect(()=>requestDrawRef.current(),[parameters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) {
      canvas.classList.add('paint-canvas--fallback');
      canvas.closest('.paint-hero')?.classList.add('paint-hero--fallback');
      return;
    }
    const vert = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const frag = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vert || !frag) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'resolution');
    const pointerUniform = gl.getUniformLocation(program, 'pointer');
    const physicalA=gl.getUniformLocation(program,'physicalA');const physicalB=gl.getUniformLocation(program,'physicalB');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: .28, y: .24 };
    let frame = 0;
    let visible=false;let pageVisible=document.visibilityState==='visible';

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return false;
      const cap=quality==='micro'?.55:quality==='small'?.65:window.innerWidth<700?.6:.85;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      const width=Math.max(1,Math.floor(rect.width*dpr));const height=Math.max(1,Math.floor(rect.height*dpr));if(canvas.width===width&&canvas.height===height)return false;canvas.width=width;canvas.height=height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      return true;
    };
    const draw = () => {
      frame = 0;const values=parametersRef.current;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, 1 - pointer.y);
      gl.uniform4f(physicalA,values.paintCoverage,values.age,values.brittleness,values.crackDirection);
      gl.uniform4f(physicalB,values.flakeLift,values.undercoatExposure,values.woodExposure,values.lightDirection);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const queueDraw = () => {
      if (!frame&&visible&&pageVisible) frame = requestAnimationFrame(draw);
    };
    const onPointer = (event: PointerEvent) => {
      if (motionQuery.matches) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      queueDraw();
    };
    const onVisibility=()=>{pageVisible=document.visibilityState==='visible';if(pageVisible)queueDraw();else{cancelAnimationFrame(frame);frame=0}};
    const onContextLost=(event:Event)=>{event.preventDefault();cancelAnimationFrame(frame);frame=0};
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)queueDraw();else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'120px'});
    if(interactive)canvas.addEventListener('pointermove', onPointer, { passive: true });
    canvas.addEventListener('webglcontextlost',onContextLost);document.addEventListener('visibilitychange',onVisibility);
    let resizeFrame=0;const observer=new ResizeObserver(()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;if(resize())queueDraw()})});
    observer.observe(canvas);intersection.observe(canvas);
    resize();
    requestDrawRef.current=queueDraw;
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);observer.disconnect();intersection.disconnect();
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost',onContextLost);document.removeEventListener('visibilitychange',onVisibility);requestDrawRef.current=()=>{};
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [interactive,quality]);

  const canvas=<canvas ref={canvasRef} className={`paint-canvas ${className}`} role={label?'img':undefined} aria-label={label||undefined} aria-hidden={label?undefined:true}/>;if(bare)return canvas;

  return (
    <section className="paint-hero" aria-labelledby="paint-title">
      {canvas}
      <div className="paint-shade" aria-hidden="true" />
      <div className="paint-copy">
        <p>OBJECT 006 / STRATIGRAPHY</p>
        <h1 id="paint-title">Flaked<br />Blue</h1>
        <span>A surface does not disappear at once. It cracks, lifts, and leaves its earlier layers visible.</span>
      </div>
      <div className="paint-legend"><b>LIGHT REVEALS HEIGHT</b><span>Move slowly. Only the broad light changes; the damage remains accumulated.</span></div>
      <a className="paint-back" href="/#library">Collection ↙</a>
    </section>
  );
}
