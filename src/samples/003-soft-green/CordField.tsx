import { useEffect, useRef } from 'react';
import './cord-field.css';

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
    float band = (q.y + broadWarp) / .074;
    float row = floor(band);
    float crown = cordCrown(band);

    float across = (fract(band) - .5);
    float helix = sin(q.x * 58. + across * 15. + row * 2.27 + noise(vec2(q.x * 3., row)) * 1.8);
    helix += .38 * sin(q.x * 116. + across * 29. - row * 1.71);
    float fine = sin(q.x * 430. + across * 52. + noise(q * 46.) * 4.2);
    fine += .42 * sin(q.x * 710. + across * 81.);
    float broken = noise(q * vec2(115., 42.)) - .5;
    float h = crown * (1. + helix * .024 + fine * .011 + broken * .032);

    float crossCenter = -.04 + sin(q.x * 1.8 + .7) * .055;
    float crossBand = (q.y - crossCenter) / .084;
    float crossMask = smoothstep(.86, .18, abs(q.x + .04));
    float crossCrown = cordCrown(crossBand) * crossMask;
    float crossHelix = sin(q.x * 54. + (fract(crossBand) - .5) * 16. + 1.4) * .028 + sin(q.x * 166.) * .011;
    h = max(h, crossCrown * (1.12 + crossHelix) + crossMask * .05);

    float fuzz = step(.975, hash21(floor(q * vec2(330., 145.)))) * noise(q * 280.);
    return h + fuzz * .045;
  }

  void main() {
    vec2 texel = 1. / resolution;
    float h = heightField(vUv);
    float hx = heightField(vUv + vec2(texel.x * 1.6, 0.)) - heightField(vUv - vec2(texel.x * 1.6, 0.));
    float hy = heightField(vUv + vec2(0., texel.y * 1.6)) - heightField(vUv - vec2(0., texel.y * 1.6));
    vec3 normal = normalize(vec3(-hx * 11., -hy * 11., 1.));

    vec2 lightMotion = (pointer - .5) * vec2(.34, .22);
    lightMotion += vec2(sin(time * .11), cos(time * .09)) * .018;
    vec3 light = normalize(vec3(-.38 + lightMotion.x, .46 - lightMotion.y, .82));
    float diffuse = max(dot(normal, light), 0.);
    float wrap = max(dot(normal, light) * .5 + .5, 0.);

    vec3 valley = vec3(.225, .243, .211);
    vec3 body = vec3(.455, .478, .421);
    vec3 ridge = vec3(.612, .628, .564);
    vec3 color = mix(valley, body, smoothstep(.02, .72, h));
    color = mix(color, ridge, pow(max(h, 0.), 2.6) * .34);

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

export default function CordField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) {
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
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: .68, y: .28, tx: .68, ty: .28 };
    let reduced = motionQuery.matches;
    let frame = 0;
    const started = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cap = window.innerWidth < 700 ? 1.15 : 1.5;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      pointer.x += (pointer.tx - pointer.x) * .035;
      pointer.y += (pointer.ty - pointer.y) * .035;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, 1 - pointer.y);
      gl.uniform1f(timeUniform, (performance.now() - started) / 1000);
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
      pointer.tx = .68;
      pointer.ty = .28;
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
    <section className="cord-hero" aria-labelledby="cord-title">
      <canvas ref={canvasRef} className="cord-canvas" aria-label="Procedural macro study of densely wound soft green cotton cord" />
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
