import { useEffect, useRef } from 'react';
import { DEFAULT_COIL_PARAMETERS, type CoilParameters } from './material/parameters';
import './coil-field.css';

export type CoilQuality = 'micro' | 'small' | 'full';
type CoilFieldProps = { bare?:boolean; parameters?:CoilParameters; quality?:CoilQuality; interactive?:boolean; className?:string; label?:string };

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
  uniform float time;
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

  vec3 fieldData(vec2 uv) {
    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 p = (uv - vec2(.53, .49)) * vec2(aspect, 1.);
    float r = length(p);
    float a = atan(p.y, p.x);
    float wobble = (noise(vec2(a * 1.4 + 8., r * 5.)) - .5) * .012;
    wobble = wobble * mix(.2,1.7,physicalA.w) + sin(a * 5. + r * 18.) * .0025;
    float spiral = r + wobble + a * .0018;
    float spacing = mix(.035,.066,physicalA.x);
    float band = spiral / spacing;
    float ringId = floor(band);
    float local = fract(band);
    float d = abs(local - .5) * 2.;
    float crown = pow(max(0., 1. - d * d), mix(.88,.42,physicalA.y));

    float arc = a * max(r, .025);
    float wrapPhase = arc * 530. + r * 38. + noise(vec2(a * 16., ringId)) * 3.2;
    float wrap = sin(wrapPhase);
    float wrapFine = sin(wrapPhase * 2.03 + 1.1);
    float handmade = noise(vec2(a * 26. + ringId, ringId * 1.7)) - .5;
    float height = crown * (1. + wrap * .034 + wrapFine * .012 + handmade * .038) * mix(.86,1.15,physicalB.z);

    float centerLift = smoothstep(.19, 0., r);
    float centerSpiral = sin((r + a * .018) * 150.);
    height += centerLift * mix(.08,.48,physicalA.z) * (1. + centerSpiral * .16);

    float blueSequence = step(mix(6.5,2.2,physicalB.x), mod(ringId + 1., 7.));
    blueSequence = max(blueSequence, step(.5, smoothstep(.305, .335, r) * (1. - smoothstep(.365, .395, r))));
    float blueBeat = smoothstep(.1, .5, sin(wrapPhase * .48 + ringId * .7));
    float blue = blueSequence * blueBeat * smoothstep(.08, .55, crown) * mix(.15,1.25,physicalB.y);
    blue *= 1. - centerLift * .82;
    return vec3(height, blue, crown);
  }

  void main() {
    vec2 texel = 1. / resolution;
    vec3 data = fieldData(vUv);
    float hx = fieldData(vUv + vec2(texel.x * 1.7, 0.)).x - fieldData(vUv - vec2(texel.x * 1.7, 0.)).x;
    float hy = fieldData(vUv + vec2(0., texel.y * 1.7)).x - fieldData(vUv - vec2(0., texel.y * 1.7)).x;
    vec3 normal = normalize(vec3(-hx * 12., -hy * 12., 1.));

    vec2 lightShift = (pointer - .5) * vec2(.28, .2);
    vec3 light = normalize(vec3(mix(-.72,.12,physicalB.w) + lightShift.x, .52 - lightShift.y, .86));
    float diffuse = max(dot(normal, light), 0.);
    float wrapLight = max(dot(normal, light) * .5 + .5, 0.);

    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 p = (vUv - vec2(.53, .49)) * vec2(aspect, 1.);
    float r = length(p);
    float a = atan(p.y, p.x);
    float arc = a * max(r, .025);
    float fibre = sin(arc * 1080. + r * 95. + noise(vec2(a * 71., r * 260.)) * 4.);
    float fibreBreak = noise(vec2(arc * 340., r * 420.));

    vec3 valley = vec3(.205, .151, .101);
    vec3 straw = vec3(.56, .405, .245);
    vec3 ridge = vec3(.76, .61, .40);
    vec3 indigo = vec3(.055, .12, .205);
    vec3 color = mix(valley, straw, smoothstep(.04, .72, data.x));
    color = mix(color, ridge, pow(max(data.x, 0.), 2.5) * .24);
    color = mix(color, indigo, data.y * .9);
    color *= .48 + diffuse * .34 + wrapLight * .19;
    color *= .94 + fibre * .045 * data.z;
    color += vec3(.07, .052, .029) * smoothstep(.92, 1., fibre) * step(.6, fibreBreak) * data.z;
    color *= .9 + noise(vUv * vec2(7., 9.)) * .12;

    float vignette = 1. - smoothstep(.4, .98, length((vUv - .5) * vec2(.72, 1.)));
    color *= .8 + vignette * .23;
    color = pow(color, vec3(.9));
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

export default function CoilField({ bare=false, parameters=DEFAULT_COIL_PARAMETERS, quality='full', interactive=true, className='', label='Procedural macro study of concentric natural-fibre coils with indigo bindings' }: CoilFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parametersRef = useRef(parameters);
  const requestDrawRef = useRef<() => void>(() => {});
  parametersRef.current = parameters;
  useEffect(() => requestDrawRef.current(), [parameters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) {
      canvas.classList.add('coil-canvas--fallback');
      canvas.closest('.coil-hero')?.classList.add('coil-hero--fallback');
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
    const timeUniform = gl.getUniformLocation(program, 'time');
    const physicalA = gl.getUniformLocation(program, 'physicalA');
    const physicalB = gl.getUniformLocation(program, 'physicalB');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: .32, y: .25, tx: .32, ty: .25 };
    let frame = 0;
    let visible = false;
    let pageVisible = document.visibilityState === 'visible';

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const cap = quality === 'micro' ? 1 : quality === 'small' ? 1.15 : window.innerWidth < 700 ? 1 : 1.35;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      const width=Math.max(1,Math.floor(rect.width*dpr)); const height=Math.max(1,Math.floor(rect.height*dpr));
      if(canvas.width===width&&canvas.height===height)return false;
      canvas.width=width; canvas.height=height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      return true;
    };
    const draw = () => {
      frame=0; const values=parametersRef.current;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, 1 - pointer.y);
      gl.uniform1f(timeUniform, 0);
      gl.uniform4f(physicalA,values.coilSpacing,values.coilThickness,values.centerLift,values.radialDrift);
      gl.uniform4f(physicalB,values.bindingFrequency,values.indigoDensity,values.compression,values.lightDirection);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const queueDraw=()=>{if(!frame&&visible&&pageVisible)frame=requestAnimationFrame(draw)};
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.ty = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      pointer.x=pointer.tx; pointer.y=pointer.ty; queueDraw();
    };
    const onLeave = () => {
      pointer.tx = .32;
      pointer.ty = .25;
      pointer.x=pointer.tx; pointer.y=pointer.ty; queueDraw();
    };
    const onMotion=()=>queueDraw();
    const onVisibility=()=>{pageVisible=document.visibilityState==='visible';if(pageVisible)queueDraw();else{cancelAnimationFrame(frame);frame=0}};
    const onContextLost=(event:Event)=>{event.preventDefault();cancelAnimationFrame(frame);frame=0};
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)queueDraw();else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'120px'});
    if(interactive){canvas.addEventListener('pointermove', onPointer, { passive: true });canvas.addEventListener('pointerleave', onLeave);}
    canvas.addEventListener('webglcontextlost',onContextLost);document.addEventListener('visibilitychange',onVisibility);
    motionQuery.addEventListener('change', onMotion);
    let resizeFrame=0; const observer=new ResizeObserver(()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;if(resize())queueDraw()})});
    observer.observe(canvas);intersection.observe(canvas);
    resize();
    requestDrawRef.current=queueDraw;
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame); observer.disconnect(); intersection.disconnect();
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('pointerleave', onLeave);
      motionQuery.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange',onVisibility);canvas.removeEventListener('webglcontextlost',onContextLost);requestDrawRef.current=()=>{};
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [interactive,quality]);

  const canvas=<canvas ref={canvasRef} className={`coil-canvas ${className}`} role={label?'img':undefined} aria-label={label||undefined} aria-hidden={label?undefined:true}/>;
  if(bare)return canvas;

  return (
    <section className="coil-hero" aria-labelledby="coil-title">
      {canvas}
      <div className="coil-shade" aria-hidden="true" />
      <div className="coil-copy">
        <p>OBJECT 004 / COIL STUDY</p>
        <h1 id="coil-title">Blue<br />Coil</h1>
        <span>Wrapped fibre accumulates around a centre. Indigo interrupts the repetition.</span>
      </div>
      <div className="coil-note"><b>MOVE SLOWLY</b><span>The material stays still. Only its broad light direction changes.</span></div>
      <a className="coil-back" href="/#library">Collection ↙</a>
    </section>
  );
}
