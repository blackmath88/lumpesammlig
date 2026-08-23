import { useEffect, useRef } from 'react';
import { DEFAULT_PAPER_PARAMETERS, type PaperParameters } from './material/parameters';
import './paper-field.css';

export type PaperQuality='micro'|'small'|'full';
type PaperFieldProps={bare?:boolean;parameters?:PaperParameters;quality?:PaperQuality;interactive?:boolean;className?:string;label?:string};

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
  uniform float mode;
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
    float amplitude = .53;
    mat2 turn = mat2(.81, -.59, .59, .81);
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = turn * p * 2.02 + 17.13;
      amplitude *= .48;
    }
    return value;
  }

  float paperHeight(vec2 p) {
    float broad = fbm(p * vec2(1.25, 1.05) + 8.2);
    float dent = fbm(p * vec2(3.4, 2.1) + vec2(31., 4.));
    float pulp = fbm(p * 27. + vec2(4., 61.));
    float creaseA = exp(-pow(abs(p.y - .33 - sin(p.x * 4.1) * .018) * 115., 1.35));
    float creaseB = exp(-pow(abs(p.x + p.y * .18 - 1.12) * 150., 1.25));
    return broad * mix(.16,.82,physicalA.y) + dent * .19 + pulp * mix(.012,.08,physicalA.x) - creaseA * .021 - creaseB * .012;
  }

  float radialPrint(vec2 p, vec2 center, float seed, float scale, float turn) {
    vec2 q = p - center;
    float radius = length(q);
    float angle = atan(q.y, q.x);
    float irregular = (fbm(p * 8. + seed) - .5) * .13;
    float ringPhase = fract(radius * scale + angle * turn + irregular);
    float ring = 1. - smoothstep(.095, .175, abs(ringPhase - .5));
    float around = angle * max(radius, .075) * scale * 6.35 + seed;
    around += (noise(p * 33. + seed * 2.4) - .5) * .14;
    float tick = 1. - smoothstep(.065, .135, abs(fract(around) - .5));
    float centreFade = smoothstep(.055, .15, radius);
    float outerFade = 1. - smoothstep(.51, .68, radius);
    float dropout = smoothstep(.34, .51, noise(floor(vec2(radius * scale, around)) + seed));
    return ring * tick * centreFade * outerFade * dropout;
  }

  float printField(vec2 p) {
    vec2 drift = vec2(fbm(p * 2.3 + 12.), fbm(p * 2.1 + 49.)) - .5;
    vec2 q = p + drift * mix(.002,.055,physicalB.z);
    float radiusScale=mix(.72,1.35,physicalB.y);
    float marks = radialPrint(q, vec2(.28, .79), 2.1, 14.1*radiusScale, .027);
    marks = max(marks, radialPrint(q, vec2(.72, .71), 7.3, 13.6*radiusScale, -.022));
    marks = max(marks, radialPrint(q, vec2(.48, .38), 13.7, 14.8*radiusScale, .031));
    marks = max(marks, radialPrint(q, vec2(.94, .27), 22.4, 13.3*radiusScale, -.026));
    marks = max(marks, radialPrint(q, vec2(.08, .18), 31.9, 14.5*radiusScale, .02));
    float absorption = fbm(p * 49. + 6.2);
    float fibreBreak = noise(p * vec2(114., 67.) + 28.);
    marks *= mix(1.,.64 + absorption*.36,physicalA.w);
    marks *= smoothstep(mix(.02,.26,physicalB.w), mix(.12,.48,physicalB.w), fibreBreak);
    marks=smoothstep(mix(.06,.25,physicalB.x),mix(.35,.72,physicalB.x),marks);
    return marks*physicalA.z;
  }

  void main() {
    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    vec2 texel = vec2(aspect, 1.) / resolution;
    float ink = printField(p);
    float h = paperHeight(p) + ink * .0005;
    float hx = paperHeight(p + vec2(texel.x * 2., 0.)) + printField(p + vec2(texel.x * 2., 0.)) * .0005 - h;
    float hy = paperHeight(p + vec2(0., texel.y * 2.)) + printField(p + vec2(0., texel.y * 2.)) * .0005 - h;
    vec3 normal = normalize(vec3(-hx * 3.2, -hy * 3.2, .82));

    float pulp = fbm(p * 38. + 18.);
    float fleckA = smoothstep(.93, .985, noise(p * vec2(92., 11.) + 3.));
    float fleckB = smoothstep(.945, .99, noise(p * vec2(17., 106.) + 71.));
    float pin = smoothstep(.975, .998, hash21(floor(p * 245.)));
    vec3 paper = vec3(.77, .735, .635) * (.91 + pulp * .13);
    paper += vec3(.055, .048, .026) * (fleckA + fleckB) * .17;
    paper -= pin * .045;
    vec3 indigo = vec3(.205, .285, .43);
    indigo *= .83 + fbm(p * 31. + 93.) * .18;
    indigo += paper * (1. - smoothstep(.13, .62, fbm(p * 74. + 25.))) * .075;
    vec3 cream = mix(vec3(.78, .745, .63), paper, .32);
    vec3 color = mix(indigo, cream, ink);

    vec2 lightShift = (pointer - .5) * vec2(.18, .12);
    vec3 light = normalize(vec3(-.42 + lightShift.x, .5 - lightShift.y, .88));
    float diffuse = max(dot(normal, light), 0.);
    color *= .67 + diffuse * .31;
    color += vec3(.03, .026, .018) * max(dot(normal, normalize(vec3(.25, -.3, .92))), 0.) * .12;

    if (mode > .5 && mode < 1.5) {
      color = paper * (.68 + diffuse * .3);
    } else if (mode > 1.5 && mode < 2.5) {
      color = mix(vec3(.19, .27, .42), vec3(.82, .79, .68), ink);
    } else if (mode > 2.5) {
      color = normal * .5 + .5;
    }

    float edgeLight = 1. - smoothstep(.36, 1.05, length((vUv - .5) * vec2(.72, 1.)));
    color *= .88 + edgeLight * .12;
    color += (hash21(gl_FragCoord.xy) - .5) * .018;
    color = pow(color, vec3(.94));
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

function debugMode() {
  const value = new URLSearchParams(window.location.search).get('material');
  if (value === 'paper') return 1;
  if (value === 'print') return 2;
  if (value === 'normal') return 3;
  return 0;
}

export default function PaperField({bare=false,parameters=DEFAULT_PAPER_PARAMETERS,quality='full',interactive=true,className='',label='Procedural macro study of dusty indigo print absorbed into warm fibrous paper'}:PaperFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parametersRef=useRef(parameters);const requestDrawRef=useRef<()=>void>(()=>{});parametersRef.current=parameters;
  useEffect(()=>requestDrawRef.current(),[parameters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) {
      canvas.classList.add('paper-canvas--fallback');
      canvas.closest('.paper-hero')?.classList.add('paper-hero--fallback');
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
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'resolution');
    const pointerUniform = gl.getUniformLocation(program, 'pointer');
    const modeUniform = gl.getUniformLocation(program, 'mode');
    const physicalA=gl.getUniformLocation(program,'physicalA');const physicalB=gl.getUniformLocation(program,'physicalB');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: .3, y: .26 };
    let frame = 0;
    let visible=false;let pageVisible=document.visibilityState==='visible';

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return false;
      const cap=quality==='micro'?.6:quality==='small'?.75:window.innerWidth<700?.65:.9;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      const width=Math.max(1,Math.floor(rect.width*dpr));const height=Math.max(1,Math.floor(rect.height*dpr));if(canvas.width===width&&canvas.height===height)return false;canvas.width=width;canvas.height=height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      return true;
    };
    const draw = () => {
      frame = 0;const values=parametersRef.current;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, 1 - pointer.y);
      gl.uniform1f(modeUniform, debugMode());
      gl.uniform4f(physicalA,values.pulpRoughness,values.sheetWaviness,values.pigmentDensity,values.absorption);
      gl.uniform4f(physicalB,values.markSoftness,values.repeatRadius,values.registrationDrift,values.missingCoverage);
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

  const canvas=<canvas ref={canvasRef} className={`paper-canvas ${className}`} role={label?'img':undefined} aria-label={label||undefined} aria-hidden={label?undefined:true}/>;if(bare)return canvas;

  return (
    <section className="paper-hero" aria-labelledby="paper-title">
      {canvas}
      <div className="paper-shade" aria-hidden="true" />
      <div className="paper-copy">
        <p>OBJECT 007 / MATERIAL ERROR</p>
        <h1 id="paper-title">Blue<br />Printed<br />Paper</h1>
        <span>A strict radial system becomes particular when every mark must pass through the same imperfect sheet.</span>
      </div>
      <div className="paper-legend"><b>LIGHT REVEALS THE SHEET</b><span>Move slowly. The print stays registered; only matte light crosses its shallow relief.</span></div>
      <a className="paper-back" href="/#library">Collection ↙</a>
    </section>
  );
}
