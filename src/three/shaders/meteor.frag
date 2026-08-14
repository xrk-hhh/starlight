precision mediump float;

varying float vFade;

void main() {
  if (vFade < 0.02) discard;
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.05, d) * vFade * 0.9;
  gl_FragColor = vec4(vec3(0.55, 0.75, 1.0), alpha);
}
