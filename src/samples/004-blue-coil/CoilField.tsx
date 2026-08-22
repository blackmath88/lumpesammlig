import { useEffect, useRef } from 'react';
import './coil-field.css';

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
    wobble += sin(a * 5. + r * 18.) * .0025;
    float spiral = r + wobble + a * .0018;
    float spacing = .049;
    float band = spiral / spacing;
    float ringId = floor(band);
    float local = fract(band);
    float d = abs(local - .5) * 2.;
    float crown = pow(max(0., 1. - d * d), .56);

    float arc = a * max(r, .025);
    float wrapPhase = arc * 530. + r * 38. + noise(vec2(a * 16., ringId)) * 3.2;
    float wrap = sin(wrapPhase);
    float wrapFine = sin(wrapPhase * 2.03 + 1.1);
    float handmade = noise(vec2(a * 26. + ringId, ringId * 1.7)) - .5;
    float height = crown * (1. + wrap * .034 + wrapFine * .012 + handmade * .038);

    float centerLift = smoothstep(.19, 0., r);
    float centerSpiral = sin((r + a * .018) * 150.);
    height += centerLift * (.33 + centerSpiral * .055);

    float blueSequence = step(5.15, mod(ringId + 1., 7.));
    blueSequence = max(blueSequence, step(.5, smoothstep(.305, .335, r) * (1. - smoothstep(.365, .395, r))));
    float blueBeat = smoothstep(.1, .5, sin(wrapPhase * .48 + ringId * .7));
    float blue = blueSequence * blueBeat * smoothstep(.08, .55, crown);
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
    lightShift += vec2(sin(time * .08), cos(time * .07)) * .012;
    vec3 light = normalize(vec3(-.42 + lightShift.x, .52 - lightShift.y, .86));
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

export default function CoilField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) {
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
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: .32, y: .25, tx: .32, ty: .25 };
    let reduced = motionQuery.matches;
    let frame = 0;
    let lastRender = 0;
    const started = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cap = window.innerWidth < 700 ? 1 : 1.35;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = (now = performance.now()) => {
      if (!reduced && now - lastRender < 33) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastRender = now;
      pointer.x += (pointer.tx - pointer.x) * .035;
      pointer.y += (pointer.ty - pointer.y) * .035;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, 1 - pointer.y);
      gl.uniform1f(timeUniform, (now - started) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.ty = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      if (reduced) draw();
    };
    const onLeave = () => {
      pointer.tx = .32;
      pointer.ty = .25;
    };
    const onMotion = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      cancelAnimationFrame(frame);
      draw();
    };
    canvas.addEventListener('pointermove', onPointer, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);
    motionQuery.addEventListener('change', onMotion);
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    observer.observe(canvas);
    resize();
    draw();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('pointerleave', onLeave);
      motionQuery.removeEventListener('change', onMotion);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  return (
    <section className="coil-hero" aria-labelledby="coil-title">
      <canvas ref={canvasRef} className="coil-canvas" aria-label="Procedural macro study of concentric natural-fibre coils with indigo bindings" />
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
