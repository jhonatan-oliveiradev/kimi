export const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Blue monochrome artwork -> lilac/violet monochrome.
// Luminance is preserved and mapped onto a fixed violet palette ramp,
// so whites stay white, darks stay dark, and every blue tone becomes
// the corresponding lilac tone.
export const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uRes;       // canvas size in px
uniform vec2 uVideoRes;  // video size in px
uniform vec2 uMouse;     // uv space
uniform float uMouseStr; // 0..1 pointer activity
uniform float uVel;      // smoothed scroll velocity, roughly -1..1
uniform float uTime;
uniform float uGrain;    // grain amount
uniform float uReduced;  // 1.0 = reduced motion, disables distortion
uniform vec2 uFocus;     // focal point for cover-crop on narrow screens

// object-fit: cover mapping, centered on uFocus
vec2 coverUv(vec2 uv) {
  float ca = uRes.x / uRes.y;
  float va = uVideoRes.x / uVideoRes.y;
  if (ca > va) {
    float f = va / ca;
    float fy = clamp(uFocus.y, f * 0.5, 1.0 - f * 0.5);
    uv.y = fy + (uv.y - 0.5) * f;
  } else {
    float f = ca / va;
    float fx = clamp(uFocus.x, f * 0.5, 1.0 - f * 0.5);
    uv.x = fx + (uv.x - 0.5) * f;
  }
  return uv;
}

float lumAt(vec2 uv) {
  vec3 c = texture2D(uTex, coverUv(uv)).rgb;
  return dot(c, vec3(0.299, 0.587, 0.114));
}

// lilac/violet palette ramp, t: 0 = white ... 1 = near-black violet
vec3 palette(float t) {
  vec3 c0 = vec3(0.9922, 0.9882, 1.0000); // #FDFCFF
  vec3 c1 = vec3(0.9490, 0.9255, 0.9804); // #F2ECFA
  vec3 c2 = vec3(0.8471, 0.7804, 0.9255); // #D8C7EC
  vec3 c3 = vec3(0.7255, 0.6039, 0.8471); // #B99AD8
  vec3 c4 = vec3(0.5451, 0.3882, 0.7098); // #8B63B5
  vec3 c5 = vec3(0.3569, 0.2118, 0.4941); // #5B367E
  vec3 c6 = vec3(0.1569, 0.1020, 0.2078); // #281A35

  vec3 col = mix(c0, c1, smoothstep(0.00, 0.16, t));
  col = mix(col, c2, smoothstep(0.16, 0.36, t));
  col = mix(col, c3, smoothstep(0.36, 0.54, t));
  col = mix(col, c4, smoothstep(0.54, 0.71, t));
  col = mix(col, c5, smoothstep(0.71, 0.87, t));
  col = mix(col, c6, smoothstep(0.87, 1.00, t));
  return col;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float motion = 1.0 - uReduced;

  // -- pointer: as if seen through gently moving water ---------------------
  vec2 pa = vec2((uv.x - uMouse.x) * aspect, uv.y - uMouse.y);
  float d = length(pa);
  float fall = exp(-d * 4.5);
  float ripple = sin(d * 30.0 - uTime * 2.4) * fall * uMouseStr;
  uv += (pa / max(d, 1e-4)) * ripple * 0.010 * motion;
  uv += vec2(pa.y, -pa.x) * fall * uMouseStr * 0.006 * motion;

  // -- scroll velocity: slight organic stretch, settles when scroll stops -
  uv.y += uVel * 0.014 * sin(uv.x * 3.14159) * motion;
  uv.x += uVel * 0.006 * sin(uv.y * 6.2831 + uTime * 0.6) * motion;

  // -- subtle lilac chromatic separation ----------------------------------
  float ca = (0.0014 + uMouseStr * 0.002 + abs(uVel) * 0.002) * motion;
  float l  = lumAt(uv);
  float lr = lumAt(uv + vec2(ca, 0.0));
  float lb = lumAt(uv - vec2(ca, 0.0));

  // blue depth -> violet depth (whites stay white)
  float t  = clamp(1.0 - l,  0.0, 1.0);
  float tr = clamp(1.0 - lr, 0.0, 1.0);
  float tb = clamp(1.0 - lb, 0.0, 1.0);

  // gentle contrast curve keeps the linework crisp
  t  = pow(t,  1.04);
  tr = pow(tr, 1.04);
  tb = pow(tb, 1.04);

  // chromatic separation kept inside the violet family (print-like
  // misregistration, never red/cyan fringes)
  vec3 base = palette(t);
  vec3 fringe = (palette(tr) - palette(tb)) * vec3(0.55, 0.18, 0.65);
  vec3 col = base + fringe * 0.5;

  // -- extremely subtle grain ----------------------------------------------
  float g = hash(gl_FragCoord.xy + fract(uTime) * 61.7) - 0.5;
  col += g * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
`;
