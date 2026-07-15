"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bounds, ContactShadows, Environment, Float, MeshReflectorMaterial, OrbitControls, RoundedBox, Text, useCursor } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { geometry } from "@/config/project";
import { useDesign } from "@/state/useDesign";

function WalkKeys() {
  const { camera } = useThree();
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    addEventListener("keydown", down); addEventListener("keyup", up);
    return () => { removeEventListener("keydown", down); removeEventListener("keyup", up); };
  }, []);
  useFrame((_, delta) => {
    const forward = Number(keys.current.has("w") || keys.current.has("arrowup")) - Number(keys.current.has("s") || keys.current.has("arrowdown"));
    const side = Number(keys.current.has("d") || keys.current.has("arrowright")) - Number(keys.current.has("a") || keys.current.has("arrowleft"));
    if (!forward && !side) return;
    const direction = new THREE.Vector3(); camera.getWorldDirection(direction); direction.y = 0; direction.normalize();
    const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
    camera.position.addScaledVector(direction, forward * delta * 3.2).addScaledVector(right, side * delta * 3.2);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -9.4, 9.4);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -7.7, 10.1);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.55, 13);
  });
  return null;
}

function polygonShape(points: readonly [number, number][], inset = 0) {
  const shape = new THREE.Shape();
  const adjusted = points.map(([x, y]) => [x + (x < 0 ? inset : -inset), y + (y < 0 ? inset : -inset)] as const);
  adjusted.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  return shape;
}

function Water() {
  const water = useDesign((s) => s.water);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const shape = useMemo(() => polygonShape(geometry.assumptions.poolPoints, .38), []);
  const geo = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);
  useFrame(({ clock }) => {
    if (material.current) {
      material.current.roughness = .12 + Math.sin(clock.elapsedTime * .7) * .025;
      material.current.normalScale.setScalar(.18 + Math.sin(clock.elapsedTime) * .03);
    }
  });
  return <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, .055, 0]} receiveShadow>
    <meshPhysicalMaterial ref={material} color={water} roughness={.12} metalness={.08} transmission={.32} thickness={1.8} transparent opacity={.88} clearcoat={1} clearcoatRoughness={.08} envMapIntensity={1.5} />
  </mesh>;
}

function Pool() {
  const stone = useDesign((s) => s.stone);
  const outer = useMemo(() => polygonShape(geometry.assumptions.poolPoints), []);
  const inner = useMemo(() => polygonShape(geometry.assumptions.poolPoints, .38), []);
  const coping = useMemo(() => {
    const s = outer.clone();
    s.holes.push(new THREE.Path(inner.getPoints()));
    return new THREE.ExtrudeGeometry(s, { depth: .12, bevelEnabled: true, bevelSize: .025, bevelThickness: .025 });
  }, [outer, inner]);
  return <group>
    <mesh geometry={coping} rotation={[-Math.PI / 2, 0, 0]} position={[0, .06, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={stone} roughness={.58} metalness={.02} />
    </mesh>
    <mesh position={[0, -.72, .2]} scale={[14.1, 1.45, 12.2]}>
      <boxGeometry />
      <meshStandardMaterial color="#355c61" roughness={.72} side={THREE.BackSide} />
    </mesh>
    <Water />
    {[0,1,2].map((n) => <mesh key={n} position={[4.9 - n*.42, -.05 - n*.13, -4.42 + n*.26]} receiveShadow>
      <boxGeometry args={[2.1, .18, .55]} />
      <meshStandardMaterial color="#d7d0c4" roughness={.7} />
    </mesh>)}
  </group>;
}

function Cushion({ position, color, rotation = 0 }: { position: [number,number,number], color: string, rotation?: number }) {
  return <RoundedBox args={[1.02,.22,.84]} radius={.1} smoothness={4} position={position} rotation={[-.18,rotation,0]} castShadow>
    <meshStandardMaterial color={color} roughness={.92} />
  </RoundedBox>;
}

function ModularSofa() {
  const fabric = useDesign((s) => s.fabric);
  const collection = useDesign((s) => s.collection);
  const seatDepth = collection === "minimal" ? .88 : 1.02;
  const pieces: [number, number, number][] = [[0,0,0],[1.12,0,0],[2.24,0,0],[3.36,0,0],[4.48,0,0]];
  return <group position={[.5,.18,10.1]} rotation={[0,Math.PI,0]}>
    {pieces.map((p,i) => <group key={i} position={p}>
      <RoundedBox args={[1.08,.45,seatDepth]} radius={.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={fabric} roughness={.9} />
      </RoundedBox>
      <RoundedBox args={[1.08,.56,.18]} radius={.06} smoothness={4} position={[0,.43,-seatDepth/2+.05]} castShadow>
        <meshStandardMaterial color={fabric} roughness={.92} />
      </RoundedBox>
      <Cushion position={[0,.47,-.22]} color={i%2 ? "#d8d0c2" : "#ae9f8d"} />
    </group>)}
    {[0,1,2].map((i) => <group key={`side-${i}`} position={[-.92,0, i*1.12]} rotation={[0,Math.PI/2,0]}>
      <RoundedBox args={[1.08,.45,seatDepth]} radius={.08} smoothness={4} castShadow><meshStandardMaterial color={fabric} roughness={.9}/></RoundedBox>
      <RoundedBox args={[1.08,.56,.18]} radius={.06} smoothness={4} position={[0,.43,-seatDepth/2+.05]} castShadow><meshStandardMaterial color={fabric} roughness={.92}/></RoundedBox>
      <Cushion position={[0,.47,-.22]} color={i===1 ? "#c7b48f" : "#ded7cb"}/>
    </group>)}
  </group>;
}

function SideTable({ position }: { position:[number,number,number] }) {
  return <group position={position}>
    <mesh castShadow position={[0,.34,0]}><cylinderGeometry args={[.2,.32,.66,32]}/><meshStandardMaterial color="#e9e5dc" roughness={.38}/></mesh>
    <mesh castShadow position={[0,.7,0]}><cylinderGeometry args={[.36,.36,.08,32]}/><meshStandardMaterial color="#f5f2eb" roughness={.32}/></mesh>
  </group>;
}

function SeatingArea() {
  return <group>
    <mesh position={[2.1,1.62,10.75]} receiveShadow><boxGeometry args={[8.8,3.25,.18]}/><meshStandardMaterial color="#ddd8ce" roughness={.96}/></mesh>
    <mesh position={[-1.85,1.62,8.35]} rotation={[0,Math.PI/2,0]} receiveShadow><boxGeometry args={[4.8,3.25,.18]}/><meshStandardMaterial color="#ddd8ce" roughness={.96}/></mesh>
    <mesh position={[2.0,3.27,8.4]}><boxGeometry args={[8,4.6,.15]}/><meshStandardMaterial color="#f1eee7" roughness={.9}/></mesh>
    <ModularSofa />
    <SideTable position={[1.4,0,8.7]}/><SideTable position={[4.5,0,8.7]}/>
    <mesh position={[2.2,.22,7.1]} castShadow receiveShadow><boxGeometry args={[2.9,.34,1.75]}/><meshStandardMaterial color="#6d4526" roughness={.62}/></mesh>
    <mesh position={[2.05,1.8,10.62]} castShadow><boxGeometry args={[1.45,1.95,.07]}/><meshStandardMaterial color="#aaa19a" metalness={.65} roughness={.24}/></mesh>
  </group>;
}

function Terrace() {
  const stone = useDesign((s) => s.stone);
  return <>
    <mesh rotation={[-Math.PI/2,0,0]} position={[1.5,-.08,1.7]} receiveShadow>
      <planeGeometry args={[22,23]}/><meshStandardMaterial color={stone} roughness={.86}/>
    </mesh>
    <Pool />
    <SeatingArea />
    {[[8.7,6.4],[8.7,1],[8.7,-4.4],[-8.2,-6.8]].map(([x,z],i)=><group key={i} position={[x,0,z]}>
      <mesh castShadow position={[0,.35,0]}><cylinderGeometry args={[.48,.56,.7,24]}/><meshStandardMaterial color="#777064" roughness={.75}/></mesh>
      <mesh castShadow position={[0,1.55,0]}><cylinderGeometry args={[.09,.13,2.4,14]}/><meshStandardMaterial color="#705442" roughness={.86}/></mesh>
      <Float speed={.8} rotationIntensity={.05} floatIntensity={.08}><mesh castShadow position={[0,2.7,0]}><sphereGeometry args={[1.05,22,16]}/><meshStandardMaterial color="#65715a" roughness={.92}/></mesh></Float>
    </group>)}
  </>;
}

function Lighting() {
  const atmosphere = useDesign((s) => s.atmosphere);
  const settings = atmosphere === "night" ? { bg:"#111923", ambient:.18, sun:"#87a8d2", intensity:1.1, pos:[-7,8,-4] as [number,number,number] } : atmosphere === "morning" ? { bg:"#dbe5e4", ambient:.65, sun:"#fff2d6", intensity:2.3, pos:[-6,10,-2] as [number,number,number] } : { bg:"#c9b39b", ambient:.48, sun:"#ffd0a0", intensity:2.8, pos:[-8,6,5] as [number,number,number] };
  const { scene } = useThree();
  useEffect(()=>{ scene.background = new THREE.Color(settings.bg); },[scene, settings.bg]);
  return <>
    <ambientLight intensity={settings.ambient}/>
    <directionalLight castShadow color={settings.sun} intensity={settings.intensity} position={settings.pos} shadow-mapSize={[2048,2048]} shadow-bias={-.00015}/>
    {atmosphere === "night" && <><pointLight color="#78d7df" intensity={10} distance={9} position={[2,-.2,-1]}/><pointLight color="#ffc58b" intensity={5} distance={7} position={[2.2,2.6,9.4]}/></>}
  </>;
}

export default function Scene({ cameraTarget }: { cameraTarget: string }) {
  return <Canvas shadows dpr={[1,1.8]} camera={{ position:[14,13,18], fov:43, near:.1, far:120 }} gl={{ antialias:true, powerPreference:"high-performance", preserveDrawingBuffer:true }}>
    <Lighting />
    <Terrace />
    <WalkKeys />
    <ContactShadows position={[0,.01,0]} opacity={.32} scale={35} blur={2.4} far={8}/>
    <OrbitControls key={cameraTarget} makeDefault enableDamping dampingFactor={.06} maxPolarAngle={Math.PI/2.04} minDistance={4} maxDistance={34} target={cameraTarget === "lounge" ? [2,1,8.7] : cameraTarget === "pool" ? [0,0,0] : [1,0,2]} />
    <EffectComposer multisampling={0}><N8AO aoRadius={.8} intensity={.65}/><Bloom intensity={.14} luminanceThreshold={1.05}/><ToneMapping mode={THREE.ACESFilmicToneMapping}/></EffectComposer>
  </Canvas>;
}
