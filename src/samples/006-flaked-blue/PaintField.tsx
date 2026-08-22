import { useEffect, useRef } from 'react';
import './paint-field.css';

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
    for (int i = 0; i < 5; i++) {
      value += noise(p) * amplitude;
      p = rotation * p * 2.03 + 13.7;
      amplitude *= .49;
    }
    return value;
  }

  vec4 strata(vec2 uv) {
    float aspect = resolution.x / max(resolution.y, 1.);
    vec2 p = vec2(uv.x * aspect, uv.y);
    vec2 warp = vec2(fbm(p * vec2(2.1, .72) + 7.4), fbm(p * vec2(1.5, 1.1) + 31.));
    vec2 q = p + (warp - .5) * vec2(.105, .035);

    float longWear = fbm(vec2(q.x * 1.75, q.y * .52) + vec2(4., 17.));
    float brokenMass = fbm(q * vec2(3.8, 1.42) + vec2(-9., 5.));
    float ageBand = sin(q.x * 5.6 + fbm(q * vec2(1.1, .45)) * 4.2) * .5 + .5;
    float concentration = smoothstep(.38, .88, ageBand) * (.35 + .65 * fbm(q * vec2(2.2, .68) + 81.));
    float erosion = longWear * .45 + brokenMass * .39 + concentration * .22;

    float lostPaint = smoothstep(.59, .625, erosion);
    float depthHistory = fbm(q * vec2(5.1, 1.85) + vec2(27., -8.));
    float rawWood = lostPaint * smoothstep(.61, .76, depthHistory + longWear * .13);
    float undercoat = lostPaint * (1. - rawWood);
    float paint = 1. - lostPaint;

    float edgeDistance = abs(erosion - .607);
    float liftedEdge = (1. - smoothstep(.008, .046, edgeDistance)) * paint;
    liftedEdge *= .55 + .45 * noise(q * vec2(28., 11.));

    float verticalCrack = abs(fract(q.x * 4.3 + fbm(vec2(q.y * 1.4, q.x * 2.7) + 43.) * 1.7) - .5);
    float branchCrack = abs(fract((q.x + q.y * .18) * 3.15 + fbm(q * vec2(1.2, 2.4) + 19.) * 1.45) - .5);
    float crack = (1. - smoothstep(.006, .019, min(verticalCrack, branchCrack))) * paint;
    crack *= smoothstep(.36, .68, fbm(q * vec2(3., 1.2) + 103.));

    float woodGrain = sin(q.y * 11. + fbm(vec2(q.x * 8., q.y * .42)) * 7.);
    float height = .11 + woodGrain * .012;
    height = mix(height, .35 + noise(q * 35.) * .018, undercoat);
    height = mix(height, .71 + fbm(q * vec2(8., 2.1)) * .028, paint);
    height += liftedEdge * .13;
    height -= crack * .105;
    return vec4(height, paint, undercoat, rawWood);
  }

  void main() {
    vec2 texel = 1. / resolution;
    vec4 data = strata(vUv);
    vec4 dataX1 = strata(vUv + vec2(texel.x * 1.6, 0.));
    vec4 dataX0 = strata(vUv - vec2(texel.x * 1.6, 0.));
    vec4 dataY1 = strata(vUv + vec2(0., texel.y * 1.6));
    vec4 dataY0 = strata(vUv - vec2(0., texel.y * 1.6));
    float hx = dataX1.x - dataX0.x;
    float hy = dataY1.x - dataY0.x;
    vec3 normal = normalize(vec3(-hx * 15., -hy * 15., 1.));

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
    vec3 light = normalize(vec3(-.5 + lightShift.x, .42 - lightShift.y, .9));
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

export default function PaintField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) {
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
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: .28, y: .24 };
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cap = window.innerWidth < 700 ? 1 : 1.3;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = () => {
      frame = 0;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, 1 - pointer.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const queueDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onPointer = (event: PointerEvent) => {
      if (motionQuery.matches) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      queueDraw();
    };
    const observer = new ResizeObserver(() => {
      resize();
      queueDraw();
    });
    canvas.addEventListener('pointermove', onPointer, { passive: true });
    observer.observe(canvas);
    resize();
    draw();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onPointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  return (
    <section className="paint-hero" aria-labelledby="paint-title">
      <canvas ref={canvasRef} className="paint-canvas" aria-label="Procedural macro study of flaking blue-grey paint above pale undercoat and wood" />
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
