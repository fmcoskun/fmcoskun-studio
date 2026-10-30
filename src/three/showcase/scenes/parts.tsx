import { useEffect, useMemo } from 'react';
import { BackSide, BufferGeometry, EdgesGeometry, EllipseCurve, IcosahedronGeometry, LineBasicMaterial, LineLoop, Vector3 } from 'three';
import { showcaseConfig } from '../../config/showcaseConfig';
import { createDotTexture } from '../../utils/geometry';

const { colors, floor, bodyMaterial } = showcaseConfig;

/** Soft blob shadow on the stage floor — no shadow maps. */
export function SceneFloor({ radius, y }: { radius: number; y: number }) {
  const blob = useMemo(() => createDotTexture(64), []);
  useEffect(() => () => blob.dispose(), [blob]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} scale={[radius * 2, radius * 0.9, 1]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={blob} color={colors.shadow} transparent opacity={floor.opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Olive ellipse outline built imperatively (JSX <line> collides with SVG); caller places it. */
export function EllipseLine({ radiusX, radiusY, segments, opacity }: { radiusX: number; radiusY: number; segments: number; opacity: number }) {
  const loop = useMemo(() => {
    const curve = new EllipseCurve(0, 0, radiusX, radiusY, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(segments - 1).map((p) => new Vector3(p.x, p.y, 0));
    const material = new LineBasicMaterial({ color: colors.line, transparent: true, opacity, depthWrite: false, toneMapped: false });
    return new LineLoop(new BufferGeometry().setFromPoints(points), material);
  }, [radiusX, radiusY, segments, opacity]);

  // <primitive> objects are not disposed by R3F.
  useEffect(
    () => () => {
      loop.geometry.dispose();
      (loop.material as LineBasicMaterial).dispose();
    },
    [loop],
  );

  return <primitive object={loop} />;
}

/** Dark faceted body with olive edges — the shared "core" look. */
export function FacetedCore({ radius, detail = 0 }: { radius: number; detail?: number }) {
  const edges = useMemo(() => {
    const source = new IcosahedronGeometry(radius * 1.003, detail);
    const result = new EdgesGeometry(source, 1);
    source.dispose();
    return result;
  }, [radius, detail]);
  useEffect(() => () => edges.dispose(), [edges]);

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[radius, detail]} />
        <BodyMaterial />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={colors.accent} transparent opacity={0.55} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

export function BodyMaterial() {
  return <meshStandardMaterial color={colors.body} metalness={bodyMaterial.metalness} roughness={bodyMaterial.roughness} flatShading />;
}

/** Lime node with an olive rim, readable on the light stage. */
export function AccentNode({ size }: { size: number }) {
  return (
    <group scale={size}>
      <mesh>
        <sphereGeometry args={[1, 20, 14]} />
        <meshBasicMaterial color={colors.accent} toneMapped={false} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshBasicMaterial color={colors.line} side={BackSide} toneMapped={false} />
      </mesh>
    </group>
  );
}
