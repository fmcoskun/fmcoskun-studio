import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, Float32BufferAttribute, QuadraticBezierCurve3, Vector3 } from 'three';
import { sceneConfig } from '../config/sceneConfig';
import { createDotTexture } from '../utils/geometry';

const { streams, colors } = sceneConfig;
const tmp = new Vector3();

interface SignalStreamsProps {
  pulsesPerStream: number;
  animate: boolean;
}

/**
 * Faint curved paths from the core outward, with a few pulses travelling along
 * them. All paths share one LineSegments draw call; all pulses share one Points.
 */
export function SignalStreams({ pulsesPerStream, animate }: SignalStreamsProps) {
  const elapsed = useRef(0);

  const curves = useMemo(
    () =>
      streams.paths.map(({ from, to, bend }) => {
        const a = new Vector3(...from);
        const b = new Vector3(...to);
        const control = a.clone().add(b).multiplyScalar(0.5).add(new Vector3(...bend));
        return new QuadraticBezierCurve3(a, control, b);
      }),
    [],
  );

  const pathPositions = useMemo(() => {
    const out: number[] = [];
    for (const curve of curves) {
      const pts = curve.getPoints(streams.curveSegments);
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i]!;
        const q = pts[i + 1]!;
        out.push(p.x, p.y, p.z, q.x, q.y, q.z);
      }
    }
    return new Float32BufferAttribute(out, 3);
  }, [curves]);

  const pulseCount = curves.length * pulsesPerStream;
  // Owned attribute object, attached as-is so updates hit the GPU buffer we render.
  const pulsePositions = useMemo(
    () => new BufferAttribute(new Float32Array(Math.max(pulseCount, 1) * 3), 3),
    [pulseCount],
  );
  const dot = useMemo(() => createDotTexture(), []);
  useEffect(() => () => dot.dispose(), [dot]);

  const update = (time: number) => {
    let k = 0;
    curves.forEach((curve, ci) => {
      for (let p = 0; p < pulsesPerStream; p++) {
        // Offset each pulse so streams never fire in sync.
        const t = (time * streams.pulseSpeed + p / pulsesPerStream + ci * 0.27) % 1;
        curve.getPointAt(t, tmp);
        pulsePositions.setXYZ(k++, tmp.x, tmp.y, tmp.z);
      }
    });
    pulsePositions.needsUpdate = true;
  };

  // Seed a non-zero frame so the static (reduced-motion) render is not a pile at the origin.
  useEffect(() => update(0.35), [pulsePositions]);

  useFrame((_, delta) => {
    if (!animate || pulseCount === 0) return;
    elapsed.current += Math.min(delta, 0.1);
    update(elapsed.current);
  });

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pathPositions.array, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={colors.accent}
          transparent
          opacity={streams.opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {pulseCount > 0 && (
        <points frustumCulled={false}>
          <bufferGeometry>
            <primitive object={pulsePositions} attach="attributes-position" />
          </bufferGeometry>
          <pointsMaterial
            map={dot}
            color={colors.accent}
            size={streams.pulseSize}
            sizeAttenuation
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </points>
      )}
    </group>
  );
}
