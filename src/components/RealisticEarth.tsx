import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import { Zap, Droplet, Recycle, Wind } from 'lucide-react';
import * as THREE from 'three';

/* ─── Visible Dashed Orbit Ring ───────────────────────────────────── */
const OrbitRing = ({ radius, tiltX = 0, tiltZ = 0 }: {
  radius: number; tiltX?: number; tiltZ?: number;
}) => {
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: 0x4499dd, transparent: true, opacity: 0.35,
      dashSize: 0.14, gapSize: 0.09,
    });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    l.rotation.x = tiltX;
    l.rotation.z = tiltZ;
    return l;
  }, [radius, tiltX, tiltZ]);

  return <primitive object={line} />;
};

/* ─── Glowing Dot on orbit path ───────────────────────────────────── */
const GlowDot = ({ color }: { color: string }) => (
  <group>
    <mesh>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.18} />
    </mesh>
    <pointLight color={color} intensity={1.2} distance={1.5} />
  </group>
);

/* ─── Indicator config type ───────────────────────────────────────── */
interface IndicatorProps {
  radius: number;
  speed: number;
  startAngle: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  dotColor: string;
  iconColor: string;
  iconBgHex: string;
  borderColorHex: string;
  cardBg: string;
}

/* ─── Single orbiting indicator ───────────────────────────────────── */
const Indicator = ({ cfg, earthRef }: {
  cfg: IndicatorProps;
  earthRef: React.RefObject<THREE.Mesh | null>;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * cfg.speed + cfg.startAngle;
    groupRef.current.position.set(
      Math.cos(t) * cfg.radius,
      0,
      Math.sin(t) * cfg.radius,
    );
  });

  const Icon = cfg.icon;

  return (
    <group ref={groupRef}>
      <GlowDot color={cfg.dotColor} />
      <Html
        center
        occlude={[earthRef as any]}
        distanceFactor={7.5}
        zIndexRange={[10, 0]}
        className="pointer-events-none select-none"
      >
        <div
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl whitespace-nowrap ${cfg.cardBg}`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: cfg.borderColorHex,
            minWidth: '185px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${cfg.borderColorHex}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          {/* Colored icon bubble */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: cfg.iconBgHex }}
          >
            <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
          </div>
          {/* Text */}
          <div>
            <div className="text-[10px] text-gray-400 font-semibold leading-none tracking-wide uppercase">{cfg.label}</div>
            <div className="text-sm font-bold leading-tight mt-1.5" style={{ color: cfg.dotColor }}>{cfg.value}</div>
          </div>
        </div>
      </Html>
    </group>
  );
};

/* ─── Orbit group (ring + 2 indicators sharing same tilt plane) ───── */
const OrbitGroup = ({
  tiltX, tiltZ, radius, speed, indicators, earthRef,
}: {
  tiltX: number; tiltZ: number; radius: number; speed: number;
  indicators: [IndicatorProps, IndicatorProps];
  earthRef: React.RefObject<THREE.Mesh | null>;
}) => (
  <group rotation={[tiltX, 0, tiltZ]}>
    <OrbitRing radius={radius} />
    {indicators.map((cfg, i) => (
      <Indicator key={i} cfg={{ ...cfg, radius, speed }} earthRef={earthRef} />
    ))}
  </group>
);

/* ─── Earth + Clouds + Atmosphere ────────────────────────────────── */
const EarthGlobe = ({ earthRef }: { earthRef: React.RefObject<THREE.Mesh | null> }) => {
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [colorMap, nightMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/earth-blue-marble.jpg',
    '/earth-night.jpg',
    '/earth-clouds.png',
  ]);

  colorMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.colorSpace = THREE.SRGBColorSpace;

  /* Fresnel atmosphere shader – bright cyan rim */
  const atmMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float rim = pow(max(0.0, 0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.8);
        gl_FragColor = vec4(0.05, 0.55, 1.0, 1.0) * rim * 2.5;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.038;
    if (cloudsRef.current) cloudsRef.current.rotation.y = t * 0.050;
  });

  return (
    <group>
      {/* Base Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.5, 128, 128]} />
        <meshStandardMaterial
          map={colorMap}
          roughness={0.55}
          metalness={0.05}
          emissiveMap={nightMap}
          emissive={new THREE.Color('#ffbb33')}
          emissiveIntensity={2.2}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.535, 64, 64]} />
        <meshStandardMaterial
          alphaMap={cloudsMap}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner thin blue atmosphere */}
      <mesh>
        <sphereGeometry args={[2.56, 64, 64]} />
        <meshBasicMaterial
          color={new THREE.Color(0x1166ff)}
          transparent opacity={0.06}
          side={THREE.BackSide} depthWrite={false}
        />
      </mesh>

      {/* Outer Fresnel glow */}
      <mesh>
        <sphereGeometry args={[2.95, 64, 64]} />
        <primitive object={atmMat} attach="material" />
      </mesh>
    </group>
  );
};

/* ─── Fallback while textures load ───────────────────────────────── */
const Fallback = () => {
  const r = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (r.current) r.current.rotation.y = clock.getElapsedTime() * 0.04; });
  return (
    <group>
      <mesh ref={r}>
        <sphereGeometry args={[2.5, 48, 48]} />
        <meshStandardMaterial color="#0d2845" emissive="#103c5e" emissiveIntensity={0.6} roughness={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.75, 48, 48]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 4, 4]} intensity={2} />
    </group>
  );
};

/* ─── Scene (Earth + lights + orbit systems) ──────────────────────── */
const Scene = ({ showIndicators }: { showIndicators: boolean }) => {
  const earthRef = useRef<THREE.Mesh>(null);

  const orbit1: [IndicatorProps, IndicatorProps] = [
    {
      radius: 3.9, speed: 0.28, startAngle: 0.4,
      icon: Zap,
      label: 'Energy Efficiency', value: '98.2% Optimal',
      dotColor: '#22c55e',
      iconColor: 'text-yellow-300',
      iconBgHex: '#14291a',
      borderColorHex: '#22c55e',
      cardBg: 'bg-[#0d1f0d]/90',
    },
    {
      radius: 3.9, speed: 0.28, startAngle: 0.4 + Math.PI,
      icon: Recycle,
      label: 'Waste Reduction', value: '18.4% Reduced',
      dotColor: '#a855f7',
      iconColor: 'text-purple-300',
      iconBgHex: '#22103a',
      borderColorHex: '#a855f7',
      cardBg: 'bg-[#160d22]/90',
    },
  ];

  const orbit2: [IndicatorProps, IndicatorProps] = [
    {
      radius: 4.2, speed: 0.22, startAngle: 1.8,
      icon: Droplet,
      label: 'Water Efficiency', value: '87.6% Efficient',
      dotColor: '#06b6d4',
      iconColor: 'text-cyan-300',
      iconBgHex: '#0a2030',
      borderColorHex: '#06b6d4',
      cardBg: 'bg-[#071820]/90',
    },
    {
      radius: 4.2, speed: 0.22, startAngle: 1.8 + Math.PI,
      icon: Wind,
      label: 'Carbon Reduction', value: '24.7% Reduced',
      dotColor: '#22c55e',
      iconColor: 'text-green-300',
      iconBgHex: '#0f2a14',
      borderColorHex: '#22c55e',
      cardBg: 'bg-[#0a1a0a]/90',
    },
  ];

  return (
    <>
      {/* Stars – deep space */}
      <Stars radius={180} depth={60} count={7000} factor={4.5} saturation={0.15} fade speed={0.4} />

      {/* Lighting matching reference: strong sun from upper-left front */}
      <ambientLight intensity={0.22} />
      <directionalLight position={[-5, 6, 5]} intensity={3.2} color="#fffef5" castShadow />
      {/* Faint blue fill on the dark side */}
      <pointLight position={[7, -4, -7]} intensity={0.25} color="#2255bb" />

      <Suspense fallback={<Fallback />}>
        <EarthGlobe earthRef={earthRef} />

        {showIndicators && (
          <>
            {/* Ring 1: Energy (top-right) + Waste (bottom-left) */}
            <OrbitGroup
              tiltX={0.32} tiltZ={0.12}
              radius={3.9} speed={0.28}
              indicators={orbit1}
              earthRef={earthRef}
            />
            {/* Ring 2: Water (left) + Carbon (right) */}
            <OrbitGroup
              tiltX={-0.18} tiltZ={0.38}
              radius={4.2} speed={0.22}
              indicators={orbit2}
              earthRef={earthRef}
            />
          </>
        )}
      </Suspense>
    </>
  );
};

/* ─── Public export ───────────────────────────────────────────────── */
export interface RealisticEarthProps {
  showIndicators?: boolean;
  cameraPosition?: [number, number, number];
  fov?: number;
}

export const RealisticEarth = ({
  showIndicators = true,
  cameraPosition = [0, 1.5, 9],
  fov = 42,
}: RealisticEarthProps) => (
  <div className="w-full h-full">
    <Canvas camera={{ position: cameraPosition, fov }}>
      <Scene showIndicators={showIndicators} />
    </Canvas>
  </div>
);

export default RealisticEarth;
