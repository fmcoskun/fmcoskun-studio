import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EdgesGeometry, IcosahedronGeometry, type Group, type LineSegments } from 'three';
import { sceneConfig } from '../config/sceneConfig';
import { createLatLongGrid } from '../utils/geometry';

const { core, colors } = sceneConfig;

interface CentralCoreProps {
  animate: boolean;
  showGrid: boolean;
}

/** Dark faceted body + green edge lines, wrapped in a slow counter-rotating globe grid. */
export function CentralCore({ animate, showGrid }: CentralCoreProps) {
  const body = useRef<Group>(null);
  const grid = useRef<LineSegments>(null);

  const edges = useMemo(() => {
    const source = new IcosahedronGeometry(core.radius * 1.002, core.detail);
    const result = new EdgesGeometry(source, 1);
    source.dispose();
    return result;
  }, []);

  const gridGeometry = useMemo(
    () => createLatLongGrid(core.gridRadius, core.latitudeLines, core.longitudeLines, core.gridSegments),
    [],
  );

  // Geometries passed via the `geometry` prop are created by us, so we free them.
  useEffect(
    () => () => {
      edges.dispose();
      gridGeometry.dispose();
    },
    [edges, gridGeometry],
  );

  useFrame((_, delta) => {
    if (!animate) return;
    const d = Math.min(delta, 0.1); // clamp after tab switches
    if (body.current) {
      body.current.rotation.y += d * core.rotationSpeed;
      body.current.rotation.x += d * core.rotationSpeed * 0.35;
    }
    if (grid.current) grid.current.rotation.y += d * core.gridRotationSpeed;
  });

  return (
    <group>
      <group ref={body}>
        <mesh>
          <icosahedronGeometry args={[core.radius, core.detail]} />
          <meshStandardMaterial
            color={colors.coreBody}
            metalness={core.metalness}
            roughness={core.roughness}
            emissive={colors.accent}
            emissiveIntensity={core.emissiveIntensity}
            flatShading
          />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={colors.accent} transparent opacity={core.edgeOpacity} toneMapped={false} />
        </lineSegments>
      </group>

      {showGrid && (
        <lineSegments ref={grid} geometry={gridGeometry} rotation={[0.18, 0, -0.12]}>
          <lineBasicMaterial
            color={colors.coreGrid}
            transparent
            opacity={core.gridOpacity}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      )}
    </group>
  );
}
