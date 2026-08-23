import { useEffect, useRef } from 'react';
import { DEFAULT_CORD_PARAMETERS, type CordParameters } from './material/parameters';
import './cord-field.css';

export type CordQuality = 'micro' | 'small' | 'full';
type CordFieldProps = { bare?: boolean; parameters?: CordParameters; quality?: CordQuality; interactive?: boolean; className?: string; label?: string };

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
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3. - 2. * f);
    return mix(mix(hash21(i), hash21(i + vec2(1., 0.)), f.x),
               mix(hash21(i + vec2(0., 1.)), hash21(i + 1.), f.x), f.y);
  }

  float cordCrown(float coordinate) {
    float d = abs(fract(coordinate) - .5) * 2.;
    return pow(max(0., 1. - d * d), .62);
  }

  float heightField(vec2 uv) {
    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 p = (uv - .5) * vec2(aspect, 1.);
    float angle = -.31;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 q = rotation * p;

    float broadWarp = (noise(q * vec2(1.8, 3.1) + 4.2) - .5) * .075;
    broadWarp += sin(q.x * 3.1 + noise(q * 1.3) * 2.) * .012;
    broadWarp *= mix(.4, 1.35, 1. - physicalB.y);
    float band = (q.y + broadWarp) / mix(.11, .06, physicalA.w);
    float row = floor(band);
    float crown = pow(cordCrown(band), mix(1.18, .72, physicalA.x));

    float across = (fract(band) - .5);
    float twistFrequency = mix(39., 72., physicalA.y);
    float helix = sin(q.x * twistFrequency + across * 15. + row * 2.27 + noise(vec2(q.x * 3., row)) * 1.8);
    helix += .38 * sin(q.x * twistFrequency * 2. + across * 29. - row * 1.71);
    float fine = sin(q.x * 430. + across * 52. + noise(q * 46.) * 4.2);
    fine += .42 * sin(q.x * 710. + across * 81.);
    float broken = noise(q * vec2(115., 42.)) - .5;
    float h = crown * (1. + helix * mix(.012,.036,physicalA.y) + fine * .011 + broken * .032);
    h *= mix(.82, 1.16, physicalA.z);

    float crossCenter = -.04 + sin(q.x * 1.8 + .7) * .055;
    float crossBand = (q.y - crossCenter) / .084;
    float crossMask = smoothstep(.86, .18, abs(q.x + .04));
    float crossCrown = cordCrown(crossBand) * crossMask;
    float crossHelix = sin(q.x * 54. + (fract(crossBand) - .5) * 16. + 1.4) * .028 + sin(q.x * 166.) * .011;
    h = max(h, crossCrown * (1.12 + crossHelix) + crossMask * .05);

    float fuzz = step(mix(.992,.94,physicalB.x), hash21(floor(q * vec2(330., 145.)))) * noise(q * 280.);
    return h + fuzz * mix(.008,.072,physicalB.x);
  }

  void main() {
    vec2 texel = 1. / resolution;
    float h = heightField(vUv);
    float hx = heightField(vUv + vec2(texel.x * 1.6, 0.)) - heightField(vUv - vec2(texel.x * 1.6, 0.));
    float hy = heightField(vUv + vec2(0., texel.y * 1.6)) - heightField(vUv - vec2(0., texel.y * 1.6));
    vec3 normal = normalize(vec3(-hx * 11., -hy * 11., 1.));

    vec2 lightMotion = (pointer - .5) * vec2(.34, .22);
    vec3 light = normalize(vec3(mix(-.72,.12,physicalB.z) + lightMotion.x, .46 - lightMotion.y, .82));
    float diffuse = max(dot(normal, light), 0.);
    float wrap = max(dot(normal, light) * .5 + .5, 0.);

    vec3 valley = vec3(.225, .243, .211);
    vec3 body = vec3(.455, .478, .421);
    vec3 ridge = vec3(.612, .628, .564);
    vec3 color = mix(valley, body, smoothstep(.02, .72, h));
    color = mix(color, ridge, pow(max(h, 0.), 2.6) * .34);

    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 materialP = (vUv - .5) * vec2(aspect, 1.);
    float materialAngle = -.31;
    mat2 materialRotation = mat2(cos(materialAngle), -sin(materialAngle), sin(materialAngle), cos(materialAngle));
    vec2 materialQ = materialRotation * materialP;
    float thread = sin(materialQ.y * 1180. + materialQ.x * 76. + noise(materialQ * 91.) * 4.5);
    float threadFine = sin(materialQ.y * 1930. - materialQ.x * 43.);
    float threadBreak = noise(materialQ * vec2(205., 74.));
    float threadTone = thread * .034 + threadFine * .014;
    color *= 1. + threadTone * (.55 + h * .45);
    color += vec3(.052, .055, .047) * smoothstep(.92, 1., thread) * step(.57, threadBreak) * h;

    float fiberBreak = noise(vUv * resolution * vec2(.16, .055));
    float matteLight = .48 + diffuse * .31 + wrap * .17;
    matteLight *= .93 + fiberBreak * .11;
    matteLight *= .78 + h * .24;
    color *= matteLight;

    float warmVariation = noise(vUv * vec2(3.2, 4.7));
    color += vec3(.027, .019, .008) * warmVariation;
    float vignette = 1. - smoothstep(.38, .9, length((vUv - .5) * vec2(.72, 1.)));
    color *= .78 + vignette * .24;
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

export default function CordField({ bare = false, parameters = DEFAULT_CORD_PARAMETERS, quality = 'full', interactive = true, className = '', label = 'Procedural macro study of densely wound soft green cotton cord' }: CordFieldProps) {
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
      canvas.classList.add('cord-canvas--fallback');
      canvas.closest('.cord-hero')?.classList.add('cord-hero--fallback');
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
    const pointer = { x: .68, y: .28, tx: .68, ty: .28 };
    let frame = 0;
    let visible = false;
    let pageVisible = document.visibilityState === 'visible';

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const cap = quality === 'micro' ? 1 : quality === 'small' ? 1.15 : window.innerWidth < 700 ? 1 : 1.35;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width === width && canvas.height === height) return false;
      canvas.width = width; canvas.height = height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      return true;
    };
    const draw = () => {
      frame = 0;
      const values = parametersRef.current;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, 1 - pointer.y);
      gl.uniform1f(timeUniform, 0);
      gl.uniform4f(physicalA, values.strandThickness, values.twist, values.compression, values.packingDensity);
      gl.uniform4f(physicalB, values.fuzz, values.tension, values.lightDirection, quality === 'full' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const queueDraw = () => { if (!frame && visible && pageVisible) frame = requestAnimationFrame(draw); };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.ty = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      pointer.x = pointer.tx; pointer.y = pointer.ty; queueDraw();
    };
    const onLeave = () => {
      pointer.tx = .68;
      pointer.ty = .28;
      pointer.x = pointer.tx; pointer.y = pointer.ty; queueDraw();
    };
    const onMotion = () => queueDraw();
    const onVisibility = () => { pageVisible = document.visibilityState === 'visible'; if (pageVisible) queueDraw(); else { cancelAnimationFrame(frame); frame = 0; } };
    const onContextLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) queueDraw(); else { cancelAnimationFrame(frame); frame = 0; } }, { rootMargin:'120px' });
    if (interactive) { canvas.addEventListener('pointermove', onPointer, { passive: true }); canvas.addEventListener('pointerleave', onLeave); }
    canvas.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotion);
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => { if (!resizeFrame) resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; if (resize()) queueDraw(); }); });
    observer.observe(canvas); intersection.observe(canvas);
    resize();
    requestDrawRef.current = queueDraw;

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      intersection.disconnect();
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('pointerleave', onLeave);
      motionQuery.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      requestDrawRef.current = () => {};
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [interactive, quality]);

  const canvas = <canvas ref={canvasRef} className={`cord-canvas ${className}`} role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true} />;
  if (bare) return canvas;

  return (
    <section className="cord-hero" aria-labelledby="cord-title">
      {canvas}
      <div className="cord-veil" aria-hidden="true" />
      <div className="cord-copy">
        <p className="cord-index">LUMPESAMMLIG / OBJECT 003</p>
        <h1 id="cord-title">Soft<br />Green</h1>
        <p className="cord-lede">A material field held together by thousands of weak fibres, turned strong through twist.</p>
      </div>
      <div className="cord-note">
        <span>3.5 MM / 100 M</span>
        <p>Move slowly. Only the light changes; the wound material stays under load.</p>
      </div>
      <a className="cord-back" href="/#library">Collection ↙</a>
    </section>
  );
}
