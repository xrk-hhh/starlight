precision mediump float;

uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vColorMix;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.05, d);
  vec3 color = mix(uColorA, uColorB, vColorMix);
  gl_FragColor = vec4(color, alpha * 0.8);
}
