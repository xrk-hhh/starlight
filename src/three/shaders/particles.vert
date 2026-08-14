uniform float uTime;
uniform float uPixelRatio;
uniform vec3 uColorA;
uniform vec3 uColorB;

attribute float aSize;
attribute float aRadius;
attribute float aSpeed;
attribute float aDrift;
attribute float aColorMix;
attribute float aHover;

varying float vColorMix;
varying float vHover;

void main() {
  vec3 pos = position;
  float t = uTime * aSpeed + aDrift;
  pos.x += sin(t) * aRadius;
  pos.y += cos(t * 0.8) * aRadius * 0.6;
  pos.z += cos(t * 0.5) * aRadius;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vHover = aHover;
  gl_PointSize = aSize * uPixelRatio * (240.0 / -mvPosition.z) * (1.0 + vHover * 0.7);
  gl_Position = projectionMatrix * mvPosition;
  vColorMix = aColorMix;
}
