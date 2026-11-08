"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

/**
 * Хромированная сцена. Среда собирается из Lightformer'ов (без загрузки внешних HDR),
 * поэтому работает офлайн и не тянет лишних мегабайт.
 * `mobile` снижает число полигонов и DPR; на слабых устройствах сцену вообще не монтируют (см. Hero).
 */
function Knot({ mobile }: { mobile: boolean }) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);

  useFrame((state, dt) => {
    if (!group.current || !mesh.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y += (x * 0.6 - group.current.rotation.y) * Math.min(1, dt * 3);
    group.current.rotation.x += (-y * 0.4 - group.current.rotation.x) * Math.min(1, dt * 3);
    mesh.current.rotation.z += dt * 0.15;
    mesh.current.rotation.y += dt * 0.2;
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh ref={mesh} scale={mobile ? 0.95 : 1.15}>
          <torusKnotGeometry args={[1, 0.34, mobile ? 120 : 260, mobile ? 18 : 36]} />
          <meshStandardMaterial color="#d8dbe0" metalness={1} roughness={0.12} envMapIntensity={1.4} />
        </mesh>
      </Float>
    </group>
  );
}

function Orbiters({ mobile }: { mobile: boolean }) {
  const items = useMemo(
    () =>
      Array.from({ length: mobile ? 4 : 8 }, (_, i) => ({
        a: (i / (mobile ? 4 : 8)) * Math.PI * 2,
        r: 2.6 + (i % 3) * 0.35,
        s: 0.1 + (i % 4) * 0.05,
        y: ((i % 5) - 2) * 0.45,
        shape: i % 2,
      })),
    [mobile],
  );
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });
  return (
    <group ref={ref}>
      {items.map((o, i) => (
        <Float key={i} speed={1 + (i % 3) * 0.4} floatIntensity={1.2}>
          <mesh position={[Math.cos(o.a) * o.r, o.y, Math.sin(o.a) * o.r]} scale={o.s * 2.2}>
            {o.shape ? <icosahedronGeometry args={[1, 0]} /> : <octahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial color="#c9cdd2" metalness={1} roughness={0.2} envMapIntensity={1.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function HeroScene({ mobile }: { mobile: boolean }) {
  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6.5], fov: 38 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      frameloop="always"
      aria-hidden
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#cfe0ff" />
      <Knot mobile={mobile} />
      <Orbiters mobile={mobile} />
      <Environment resolution={mobile ? 128 : 256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -3]} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.4} position={[-5, 1, 2]} scale={[2, 6, 1]} color="#8fb8ff" />
        <Lightformer form="rect" intensity={2} position={[5, -1, 2]} scale={[2, 6, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={2} position={[0, 0, -6]} scale={6} color="#c9cdd2" />
      </Environment>
    </Canvas>
  );
}
