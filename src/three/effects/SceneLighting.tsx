import { sceneConfig } from '../config/sceneConfig';

const { lights, colors } = sceneConfig;

/** Three lights total, no shadows: a key for facet definition and a green rim behind the core. */
export function SceneLighting() {
  const [kx, ky, kz] = lights.key.position;
  const [rx, ry, rz] = lights.rim.position;
  return (
    <>
      <ambientLight intensity={lights.ambient} />
      <directionalLight color={colors.light} intensity={lights.key.intensity} position={[kx, ky, kz]} />
      <pointLight
        color={colors.accent}
        intensity={lights.rim.intensity}
        distance={lights.rim.distance}
        decay={2}
        position={[rx, ry, rz]}
      />
    </>
  );
}
