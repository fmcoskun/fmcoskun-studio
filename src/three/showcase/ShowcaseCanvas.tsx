import { useEffect, useMemo, useRef, useState, type ComponentType, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, PerspectiveCamera, View } from '@react-three/drei';
import { showcaseStore, type ShowcaseSlotEntry } from '../../features/showcase/showcaseStore';
import { useShowcaseSlots } from '../../features/showcase/useShowcase';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import type { ShowcaseSceneId } from '../../types';
import { showcaseConfig, type ShowcaseCamera } from '../config/showcaseConfig';
import type { PerformanceTier } from '../config/sceneConfig';
import { useScenePerformance } from '../hooks/useScenePerformance';
import { ContactOrbitScene } from './scenes/ContactOrbitScene';
import { InboxFlowScene } from './scenes/InboxFlowScene';
import { MotionKitScene } from './scenes/MotionKitScene';
import { SignalBoardScene } from './scenes/SignalBoardScene';
import { StudioOrbitScene } from './scenes/StudioOrbitScene';
import styles from './ShowcaseCanvas.module.css';

export interface ShowcaseSceneProps {
  animate: boolean;
  /** Mouse hover over the owning card; read inside useFrame. */
  hover: Readonly<{ current: boolean }>;
  tier: PerformanceTier;
  /** Initial scene clock, seconds. */
  startTime?: number;
}

interface SceneDef {
  component: ComponentType<ShowcaseSceneProps>;
  camera: ShowcaseCamera;
}

const SCENES: Partial<Record<ShowcaseSceneId, SceneDef>> = {
  'studio-orbit': { component: StudioOrbitScene, camera: showcaseConfig.studio.camera },
  'signal-board': { component: SignalBoardScene, camera: showcaseConfig.signal.camera },
  'inbox-flow': { component: InboxFlowScene, camera: showcaseConfig.inbox.camera },
  'motion-kit': { component: MotionKitScene, camera: showcaseConfig.motion.camera },
  'contact-orbit': { component: ContactOrbitScene, camera: showcaseConfig.contact.camera },
};
const RENDERED = Object.keys(SCENES) as ShowcaseSceneId[];
const { lights, tiers } = showcaseConfig;
const ORIGIN = [0, 0, 0] as const;

/** DEV-only `?showcaseTime=<s>` freezes every scene at that moment (stable screenshots). */
function readDebugTime(): number | null {
  if (!import.meta.env.DEV) return null;
  const raw = new URLSearchParams(window.location.search).get('showcaseTime');
  const value = raw === null ? Number.NaN : Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** True while at least one slot intersects the viewport. */
function useAnySlotVisible(slots: readonly ShowcaseSlotEntry[]) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const inView = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        setVisible(inView.size > 0);
      },
      { rootMargin: '80px 0px' },
    );
    slots.forEach((slot) => observer.observe(slot.element));
    return () => observer.disconnect();
  }, [slots]);
  return visible;
}

/** Lazy-loaded entry point (default export for React.lazy). */
export default function ShowcaseCanvas() {
  const slots = useShowcaseSlots();
  const reduced = useReducedMotion();
  const { tier, degrade, lowest } = useScenePerformance();
  const visible = useAnySlotVisible(slots);
  const debugTime = useMemo(readDebugTime, []);
  const detach = useRef<(() => void) | null>(null);
  const profile = tiers[tier];
  const animate = !reduced && debugTime === null;

  useEffect(() => {
    showcaseStore.setRendered(RENDERED);
    return () => {
      showcaseStore.setRendered([]);
      detach.current?.();
    };
  }, []);

  const frameloop = !visible ? 'never' : animate ? 'always' : 'demand';

  return (
    <div className={styles.layer} aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, profile.maxDpr]}
        gl={{ antialias: profile.antialias, alpha: true, stencil: false, powerPreference: 'high-performance' }}
        // R3F writes pointer-events:auto inline; the overlay must never take clicks.
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          const canvas = gl.domElement;
          canvas.setAttribute('role', 'presentation');
          const onLost = (event: Event) => {
            event.preventDefault();
            showcaseStore.setStatus('failed');
          };
          canvas.addEventListener('webglcontextlost', onLost, false);
          detach.current = () => canvas.removeEventListener('webglcontextlost', onLost, false);
        }}
      >
        <PerformanceMonitor onDecline={degrade} onFallback={lowest} flipflops={3} />
        <ClearPass />
        <ReadySignal />
        {!animate && <InvalidateOnChange frameloop={frameloop} slots={slots} />}
        {slots.map((slot) => {
          const def = SCENES[slot.scene];
          return def ? (
            <SlotView key={slot.id} slot={slot} def={def} animate={animate} tier={tier} startTime={debugTime ?? 0} />
          ) : null;
        })}
      </Canvas>
    </div>
  );
}

function SlotView({ slot, def, animate, tier, startTime }: { slot: ShowcaseSlotEntry; def: SceneDef; animate: boolean; tier: PerformanceTier; startTime: number }) {
  const track = useMemo<RefObject<HTMLElement>>(() => ({ current: slot.element }), [slot.element]);
  const Scene = def.component;
  const [x, y, z] = def.camera.position;
  return (
    <View track={track} visible={slot.revealed}>
      <PerspectiveCamera
        makeDefault
        fov={def.camera.fov}
        position={[x, y, z]}
        onUpdate={(camera) => camera.lookAt(...(def.camera.target ?? ORIGIN))}
      />
      <ambientLight intensity={lights.ambient} />
      <directionalLight intensity={lights.key.intensity} position={[lights.key.position[0], lights.key.position[1], lights.key.position[2]]} />
      <Scene animate={animate} hover={slot.hover} tier={tier} startTime={startTime} />
      <Precompile />
    </View>
  );
}

/**
 * Views render with autoClear off and take over R3F's render, so nothing clears
 * the fixed canvas: without this pass, scrolling leaves ghost frames behind.
 * Priority 0.5 sorts strictly before the Views (index ≥ 1) and after scene updates (0).
 */
function ClearPass() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, false);
  }, 0.5);
  return null;
}

/**
 * Compiles this View's programs while the main thread is idle. Otherwise each
 * scene compiles on its first draw — mid-scroll, as 100–290 ms long tasks on a
 * throttled phone. Runs inside the View, so it sees the portal scene + lights.
 */
function Precompile() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const run = () => void gl.compileAsync(scene, camera).catch(() => {});
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 200);
    return () => window.clearTimeout(id);
  }, [gl, scene, camera]);
  return null;
}

/** First rendered frame → slots fade their SVG sketches out. */
function ReadySignal() {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    showcaseStore.setStatus('ready');
  });
  return null;
}

/**
 * frameloop="demand" only draws on invalidate(). Scrolling moves the slots under
 * the fixed canvas, and switching never→demand or revealing a slot changes what
 * must be drawn — none of which R3F notices by itself.
 */
function InvalidateOnChange({ frameloop, slots }: { frameloop: string; slots: readonly ShowcaseSlotEntry[] }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [frameloop, slots, invalidate]);
  useEffect(() => {
    const onChange = () => invalidate();
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    return () => {
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [invalidate]);
  return null;
}
