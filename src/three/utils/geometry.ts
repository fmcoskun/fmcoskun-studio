import { BufferGeometry, CanvasTexture, Float32BufferAttribute, SRGBColorSpace } from 'three';

/**
 * Latitude/longitude wireframe sphere (the "globe" lines from the reference),
 * emitted as LineSegments pairs — no triangle diagonals like WireframeGeometry.
 */
export function createLatLongGrid(radius: number, latitudes: number, longitudes: number, segments: number) {
  const positions: number[] = [];
  const push = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) =>
    positions.push(ax, ay, az, bx, by, bz);

  for (let i = 1; i <= latitudes; i++) {
    const phi = (i / (latitudes + 1)) * Math.PI;
    const y = Math.cos(phi) * radius;
    const r = Math.sin(phi) * radius;
    for (let s = 0; s < segments; s++) {
      const a0 = (s / segments) * Math.PI * 2;
      const a1 = ((s + 1) / segments) * Math.PI * 2;
      push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r);
    }
  }

  const half = Math.max(2, Math.floor(segments / 2));
  for (let j = 0; j < longitudes; j++) {
    const theta = (j / longitudes) * Math.PI * 2;
    const cx = Math.cos(theta);
    const cz = Math.sin(theta);
    for (let s = 0; s < half; s++) {
      const p0 = (s / half) * Math.PI;
      const p1 = ((s + 1) / half) * Math.PI;
      push(
        Math.sin(p0) * cx * radius,
        Math.cos(p0) * radius,
        Math.sin(p0) * cz * radius,
        Math.sin(p1) * cx * radius,
        Math.cos(p1) * radius,
        Math.sin(p1) * cz * radius,
      );
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

/** Soft round sprite so PointsMaterial renders dots instead of squares. Caller disposes. */
export function createDotTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
