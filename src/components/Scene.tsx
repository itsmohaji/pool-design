"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useDesign } from "@/state/useDesign";
import { geometry, type PlanPoint } from "@/config/geometry";

const poolOuter = geometry.pool.outer;
const poolInner = geometry.pool.inner;

function shapeFrom(points: readonly PlanPoint[]) {
  const shape = new THREE.Shape();
  points.forEach(([x,z],i)=> i ? shape.lineTo(x,-z) : shape.moveTo(x,-z));
  shape.closePath();
  return shape;
}

function makeWaterNormal() {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 384;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#7f7f7f"; ctx.fillRect(0,0,384,384);
  for(let i=0;i<90;i++){
    const y=(i*37)%384, amplitude=2.5+(i%7)*.55, frequency=.018+(i%5)*.004;
    ctx.strokeStyle=`rgba(${i%2?210:38},${i%2?210:38},${i%2?210:38},.12)`;
    ctx.lineWidth=1.1;ctx.beginPath();
    for(let x=0;x<=384;x+=4){const py=y+Math.sin(x*frequency+i)*amplitude+(Math.sin(x*.055+i*.4)*1.2);x?ctx.lineTo(x,py):ctx.moveTo(x,py)}
    ctx.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3.2,4.2);texture.anisotropy=8;return texture;
}

function useMaterialTexture(kind:"stone"|"fabric"|"plaster"|"wood"){
  const index={stone:0,fabric:1,plaster:2,wood:3}[kind];
  const source=useTexture(`./textures/material-${index}.webp`);
  return useMemo(()=>{const texture=source.clone();texture.wrapS=texture.wrapT=THREE.RepeatWrapping;const repeat=kind==="fabric"?5:kind==="wood"?2.5:3.5;texture.repeat.set(repeat,repeat);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.needsUpdate=true;return texture},[source,kind]);
}

function Pool() {
  const waterColor = useDesign(s=>s.water); const stoneColor=useDesign(s=>s.stone);
  const stoneTex = useMaterialTexture("stone");
  const waterNormal = useMemo(()=>makeWaterNormal(),[]);
  const inner=useMemo(()=>shapeFrom(poolInner),[]);
  const floor = useMemo(()=>new THREE.ShapeGeometry(inner,18),[inner]);
  const waterMat=useRef<THREE.MeshPhysicalMaterial>(null);
  useFrame(({clock},dt)=>{waterNormal.offset.x=(waterNormal.offset.x+dt*.009)%1;waterNormal.offset.y=(waterNormal.offset.y+dt*.006)%1;if(waterMat.current){waterMat.current.roughness=.075+Math.sin(clock.elapsedTime*.8)*.012;waterMat.current.clearcoatRoughness=.035+Math.sin(clock.elapsedTime*1.2)*.008}});
  return <group>
    <mesh geometry={floor} rotation={[-Math.PI/2,0,0]} position={[0,-1.22,0]} receiveShadow><meshStandardMaterial color="#8db4b1" roughness={.52} map={stoneTex}/></mesh>
    {poolInner.map((p,i)=>{const q=poolInner[(i+1)%poolInner.length],dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz);return <mesh key={i} position={[(p[0]+q[0])/2,-.58,(p[1]+q[1])/2]} rotation={[0,-Math.atan2(dz,dx),0]} receiveShadow><boxGeometry args={[len,1.35,.13]}/><meshStandardMaterial color="#b8ccc8" roughness={.48} map={stoneTex}/></mesh>})}
    {poolOuter.map((p,i)=>{const q=poolOuter[(i+1)%poolOuter.length],dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz);return <mesh key={`coping-${i}`} position={[(p[0]+q[0])/2,.1,(p[1]+q[1])/2]} rotation={[0,-Math.atan2(dz,dx),0]} castShadow receiveShadow><boxGeometry args={[len,.18,.62]}/><meshStandardMaterial color={stoneColor} map={stoneTex} roughness={.58}/></mesh>})}
    <mesh geometry={floor} rotation={[-Math.PI/2,0,0]} position={[0,.035,0]} receiveShadow>
      <meshPhysicalMaterial ref={waterMat} color={waterColor} transparent opacity={.82} roughness={.075} metalness={.02} transmission={.34} thickness={1.8} ior={1.333} clearcoat={1} clearcoatRoughness={.035} envMapIntensity={2.35} bumpMap={waterNormal} bumpScale={.055}/>
    </mesh>
    {[0,1,2,3].map(i=><mesh key={i} position={[4.98-i*.34,-.08-i*.22,-3.95+i*.28]} castShadow receiveShadow><boxGeometry args={[2.15,.18,.66]}/><meshStandardMaterial color="#d4c8b4" roughness={.62} map={stoneTex}/></mesh>)}
    {[-3.3,0,3.3].map(z=><pointLight key={z} position={[6.25,-.52,z]} color="#81e6e7" intensity={2.2} distance={5}/>) }
  </group>
}

function Pillow({position,color,rotation=0,scale=1,pattern=false}:{position:[number,number,number],color:string,rotation?:number,scale?:number,pattern?:boolean}){
  const tex=useMaterialTexture("fabric");
  const chevron=useMemo(()=>{const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d")!;x.fillStyle="#ded8ce";x.fillRect(0,0,256,256);x.strokeStyle="#83796f";x.lineWidth=9;for(let y=-20;y<280;y+=38){x.beginPath();for(let i=-1;i<9;i++){x.lineTo(i*32,y+(i%2?18:0))}x.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.3,1.3);t.colorSpace=THREE.SRGBColorSpace;return t},[]);
  return <group position={position} rotation={[0,rotation,0]} scale={scale}>
    <RoundedBox args={[.86,.72,.24]} radius={.14} smoothness={8} castShadow><meshStandardMaterial color={pattern?"#ffffff":color} map={pattern?chevron:tex} bumpMap={pattern?undefined:tex} bumpScale={.025} roughness={.92}/></RoundedBox>
    {[[-.31,0,.012,.5],[.31,0,.012,.5],[0,.27,.6,.012],[0,-.27,.6,.012]].map((p,i)=><mesh key={i} position={[p[0],p[1],.126]}><boxGeometry args={[p[2],p[3],.012]}/><meshStandardMaterial color={pattern?"#8a8076":color} roughness={.95}/></mesh>)}
  </group>
}

function SofaModule({x,z,rotation=0,corner=false}:{x:number,z:number,rotation?:number,corner?:boolean}){
  const fabric=useDesign(s=>s.fabric), collection=useDesign(s=>s.collection), tex=useMaterialTexture("fabric");
  const mediterranean=collection==="mediterranean", minimal=collection==="minimal";
  return <group position={[x,.03,z]} rotation={[0,rotation,0]}>
    {mediterranean&&<><mesh position={[0,.25,0]} castShadow><boxGeometry args={[1.2,.08,1.04]}/><meshStandardMaterial color="#7a5d3e" roughness={.72}/></mesh>{[-.48,.48].map(a=><mesh key={a} position={[a,.34,0]}><boxGeometry args={[.055,.56,1.0]}/><meshStandardMaterial color="#75583b" roughness={.75}/></mesh>)}</>}
    <RoundedBox args={[1.18,minimal?.3:.38,1.04]} radius={minimal?.035:.1} smoothness={6} position={[0,.25,0]} castShadow receiveShadow><meshStandardMaterial color={fabric} map={tex} bumpMap={tex} bumpScale={.018} roughness={.94}/></RoundedBox>
    <RoundedBox args={[1.08,minimal?.14:.18,.88]} radius={minimal?.025:.08} smoothness={6} position={[0,.51,-.02]} castShadow><meshStandardMaterial color={minimal?fabric:"#948472"} map={tex} roughness={.94}/></RoundedBox>
    <RoundedBox args={[1.12,minimal?.54:.62,.18]} radius={minimal?.025:.07} smoothness={6} position={[0,.68,-.46]} castShadow><meshStandardMaterial color={fabric} map={tex} bumpMap={tex} bumpScale={.018} roughness={.95}/></RoundedBox>
    {corner&&<RoundedBox args={[.18,.62,1.02]} radius={.07} smoothness={6} position={[-.52,.69,0]} castShadow><meshStandardMaterial color={fabric} map={tex} roughness={.95}/></RoundedBox>}
  </group>
}

function PedestalTable({position}:{position:[number,number,number]}){return <group position={position}><mesh castShadow position={[0,.34,0]}><cylinderGeometry args={[.15,.28,.68,48]}/><meshStandardMaterial color="#eeeae1" roughness={.35}/></mesh><mesh castShadow position={[0,.7,0]}><cylinderGeometry args={[.34,.34,.07,48]}/><meshStandardMaterial color="#f5f2eb" roughness={.28}/></mesh></group>}

function Lounge() {
  const plaster=useMaterialTexture("plaster"),wood=useMaterialTexture("wood");
  return <group position={[1.3,0,9.15]}>
    <mesh position={[2.35,1.65,1.52]} castShadow receiveShadow><boxGeometry args={[7.4,3.3,.18]}/><meshStandardMaterial color="#ded9cf" map={plaster} bumpMap={plaster} bumpScale={.035} roughness={.96}/></mesh>
    <mesh position={[-1.25,1.65,.05]} rotation={[0,Math.PI/2,0]} castShadow receiveShadow><boxGeometry args={[3.1,3.3,.18]}/><meshStandardMaterial color="#ded9cf" map={plaster} bumpMap={plaster} bumpScale={.035} roughness={.96}/></mesh>
    <mesh position={[2.25,3.27,.05]} rotation={[Math.PI/2,0,0]} receiveShadow><planeGeometry args={[7.2,3.0]}/><meshStandardMaterial color="#f0ede6" roughness={.9} side={THREE.FrontSide}/></mesh>
    {[-.85,.35,1.55,2.75,3.95,5.15].map(x=><mesh key={x} position={[x,3.18,.05]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.055,.055,.035,32]}/><meshStandardMaterial color="#a89f91" metalness={.55} roughness={.25}/></mesh>)}
    {[0,1,2,3,4].map(i=><SofaModule key={i} x={-.5+i*1.14} z={.82} rotation={Math.PI} corner={i===4}/>) }
    {[0,1].map(i=><SofaModule key={`s${i}`} x={-1.02} z={-.25-i*1.1} rotation={Math.PI/2} corner={i===1}/>) }
    <Pillow position={[-.48,.92,1.03]} color="#d4c6a7" rotation={-.1}/><Pillow position={[.7,.92,1.02]} color="#c6c1b7" rotation={.08} pattern/><Pillow position={[2.95,.92,1.02]} color="#b3a58f" rotation={-.08} pattern/><Pillow position={[4.05,.92,1.03]} color="#ded5c5" rotation={.1}/>
    <PedestalTable position={[.15,0,-.45]}/><PedestalTable position={[3.55,0,-.35]}/>
    <mesh position={[1.75,.2,-1.15]} castShadow receiveShadow><boxGeometry args={[2.8,.36,1.55]}/><meshStandardMaterial color="#704725" map={wood} roughness={.66}/></mesh>
    <group position={[1.6,1.82,1.39]}><mesh castShadow><boxGeometry args={[1.42,2.02,.07]}/><meshStandardMaterial color="#786b5d" metalness={.72} roughness={.2}/></mesh><mesh position={[0,0,-.041]}><boxGeometry args={[1.25,1.84,.022]}/><meshPhysicalMaterial color="#cad2d1" metalness={.65} roughness={.06} envMapIntensity={3}/></mesh>{[-.5,-.25,0,.25,.5].map((x,i)=><mesh key={i} position={[x,1.08,-.02]} scale={[.11,.11,.06]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#75685b" metalness={.62} roughness={.25}/></mesh>)}</group>
  </group>
}

function Tree({position,scale=1}:{position:[number,number,number],scale?:number}){
  const branches=useMemo(()=>Array.from({length:7},(_,i)=>({a:i/7*Math.PI*2,len:.75+(i%3)*.15,y:1.4+(i%2)*.35})),[]);
  const leaves=useMemo(()=>Array.from({length:72},(_,i)=>{const a=(i*.618)%1*Math.PI*2,r=.35+(i%9)/9*1.1,y=1.5+((i*7)%23)/23*1.75;return [Math.cos(a)*r,y,Math.sin(a)*r,(i%5)*.25] as const}),[]);
  return <group position={position} scale={scale}>
    <mesh castShadow position={[0,.85,0]}><cylinderGeometry args={[.12,.22,1.7,18]}/><meshStandardMaterial color="#5c402d" roughness={.98}/></mesh>
    {branches.map((b,i)=><mesh key={i} castShadow position={[Math.cos(b.a)*b.len*.32,b.y,Math.sin(b.a)*b.len*.32]} rotation={[0,-b.a,Math.PI/2.7]}><cylinderGeometry args={[.035,.07,b.len,10]}/><meshStandardMaterial color="#62442e" roughness={.96}/></mesh>)}
    {leaves.map((p,i)=><mesh key={i} castShadow position={[p[0],p[1],p[2]]} rotation={[p[3],p[3]*2,p[3]]} scale={[.18,.08,.34]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={i%4===0?"#718061":i%3===0?"#56694f":"#65765a"} roughness={.9}/></mesh>)}
  </group>
}

function SunLounger({position,rotation=0}:{position:[number,number,number],rotation?:number}){
  const tex=useMaterialTexture("fabric");
  return <group position={position} rotation={[0,rotation,0]}>
    <RoundedBox args={[.82,.14,2.05]} radius={.07} smoothness={6} position={[0,.34,0]} castShadow><meshStandardMaterial color="#ded7cb" map={tex} bumpMap={tex} bumpScale={.018} roughness={.9}/></RoundedBox>
    <RoundedBox args={[.82,.15,.92]} radius={.07} smoothness={6} position={[0,.72,-.73]} rotation={[.62,0,0]} castShadow><meshStandardMaterial color="#ded7cb" map={tex} bumpMap={tex} bumpScale={.018} roughness={.9}/></RoundedBox>
    {[[-.32,-.7],[.32,-.7],[-.32,.7],[.32,.7]].map((p,i)=><mesh key={i} position={[p[0],.17,p[1]]}><cylinderGeometry args={[.025,.025,.34,10]}/><meshStandardMaterial color="#7a746c" metalness={.45} roughness={.3}/></mesh>)}
    <Pillow position={[0,.92,-.84]} color="#c4b597" scale={.58}/>
  </group>
}

function DiningChair({position,rotation}:{position:[number,number,number],rotation:number}){
  const tex=useMaterialTexture("fabric");
  return <group position={position} rotation={[0,rotation,0]}>
    {[[-.28,-.28],[.28,-.28],[-.28,.28],[.28,.28]].map((p,i)=><mesh key={i} position={[p[0],.34,p[1]]} rotation={[0,0,i<2?.045:-.045]} castShadow><cylinderGeometry args={[.025,.032,.68,10]}/><meshStandardMaterial color="#514d47" metalness={.42} roughness={.3}/></mesh>)}
    <RoundedBox args={[.68,.14,.66]} radius={.08} smoothness={6} position={[0,.69,0]} castShadow><meshStandardMaterial color="#d7d0c5" map={tex} roughness={.92}/></RoundedBox>
    <RoundedBox args={[.7,.72,.14]} radius={.09} smoothness={6} position={[0,1.02,-.29]} rotation={[-.08,0,0]} castShadow><meshStandardMaterial color="#d7d0c5" map={tex} roughness={.92}/></RoundedBox>
  </group>
}

function Umbrella({position}:{position:[number,number,number]}){
  const tex=useMaterialTexture("fabric");
  return <group position={position}>
    <mesh castShadow position={[0,1.62,0]}><cylinderGeometry args={[.045,.065,3.24,18]}/><meshStandardMaterial color="#5a3f2a" roughness={.62}/></mesh>
    <mesh castShadow position={[0,3.1,0]} rotation={[0,Math.PI/8,0]}><coneGeometry args={[1.72,.5,32,1,true]}/><meshStandardMaterial color="#65503e" map={tex} bumpMap={tex} bumpScale={.018} roughness={.94} side={THREE.DoubleSide}/></mesh>
    {Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return <group key={i} position={[Math.cos(a)*1.58,2.91,Math.sin(a)*1.58]}><mesh position={[0,-.12,0]}><cylinderGeometry args={[.012,.016,.24,8]}/><meshStandardMaterial color="#8a6c4d" roughness={.9}/></mesh><mesh position={[0,-.27,0]}><sphereGeometry args={[.045,10,8]}/><meshStandardMaterial color="#9b7b59" roughness={.86}/></mesh></group>})}
    <mesh position={[0,3.4,0]} castShadow><sphereGeometry args={[.095,20,14]}/><meshStandardMaterial color="#5c412d" roughness={.55}/></mesh>
    <mesh position={[0,.08,0]} castShadow><cylinderGeometry args={[.38,.45,.16,32]}/><meshStandardMaterial color="#796a58" roughness={.68}/></mesh>
  </group>
}

function LuxuryDaybed({position}:{position:[number,number,number]}){
  const fabric=useDesign(s=>s.fabric),fabricTex=useMaterialTexture("fabric"),wood=useMaterialTexture("wood");
  return <group position={position} rotation={[0,-.04,0]}>
    <mesh castShadow position={[0,.22,0]}><boxGeometry args={[2.08,.22,2.12]}/><meshStandardMaterial color="#563923" map={wood} roughness={.72}/></mesh>
    <mesh castShadow position={[0,.37,0]}><boxGeometry args={[2.2,.08,2.22]}/><meshStandardMaterial color="#6b472d" map={wood} roughness={.68}/></mesh>
    {[-.52,.52].map(x=><RoundedBox key={x} args={[.98,.24,1.82]} radius={.09} smoothness={8} position={[x,.55,.14]} castShadow><meshStandardMaterial color={fabric} map={fabricTex} bumpMap={fabricTex} bumpScale={.028} roughness={.93}/></RoundedBox>)}
    {[-.52,.52].map(x=><RoundedBox key={`back-${x}`} args={[.98,.2,.98]} radius={.09} smoothness={8} position={[x,.91,-.67]} rotation={[.64,0,0]} castShadow><meshStandardMaterial color={fabric} map={fabricTex} bumpMap={fabricTex} bumpScale={.028} roughness={.93}/></RoundedBox>)}
    {[-.52,.52].map(x=><group key={`bolster-${x}`} position={[x,.79,-.05]} rotation={[0,0,Math.PI/2]}><mesh castShadow><cylinderGeometry args={[.13,.13,.78,28]}/><meshStandardMaterial color="#917d68" map={fabricTex} bumpMap={fabricTex} bumpScale={.02} roughness={.94}/></mesh><mesh position={[0,.4,0]}><cylinderGeometry args={[.08,.08,.012,24]}/><meshStandardMaterial color="#766451" roughness={.9}/></mesh><mesh position={[0,-.4,0]}><cylinderGeometry args={[.08,.08,.012,24]}/><meshStandardMaterial color="#766451" roughness={.9}/></mesh></group>)}
    <Pillow position={[-.52,1.03,-.55]} color="#d5c6ad" scale={.55}/><Pillow position={[.52,1.03,-.55]} color="#d5c6ad" scale={.55}/>
    {Array.from({length:13},(_,i)=>{const x=-.96+i*.16;return <group key={i} position={[x,.16,1.12]}><mesh><cylinderGeometry args={[.014,.018,.2,7]}/><meshStandardMaterial color="#896844" roughness={.9}/></mesh><mesh position={[0,-.12,0]}><sphereGeometry args={[.032,8,6]}/><meshStandardMaterial color="#9c7951" roughness={.88}/></mesh></group>})}
  </group>
}

function PlanterBed(){
  return <group position={[-8.95,0,6.5]}>
    <mesh position={[0,.04,0]} receiveShadow><boxGeometry args={[1.05,.12,5.1]}/><meshStandardMaterial color="#5a493b" roughness={1}/></mesh>
    {Array.from({length:18},(_,i)=>{const z=-2.25+i*.27,side=i%2?-.18:.18;return <group key={i} position={[side,.08,z]} rotation={[0,i*.9,0]}>
      {[-.42,-.18,.18,.42].map((r,j)=><mesh key={j} castShadow position={[Math.sin(r)*.18,.32,Math.cos(r)*.08]} rotation={[r,0,r*.8]} scale={[.08,.42,.12]}><sphereGeometry args={[1,7,5]}/><meshStandardMaterial color={j%2?"#70806b":"#879078"} roughness={.96}/></mesh>)}
    </group>})}
  </group>
}

function OutdoorFurniture(){const stone=useMaterialTexture("stone");return <group>
  <LuxuryDaybed position={[-8.45,0,.45]}/><PedestalTable position={[-8.38,0,2.0]}/><Umbrella position={[-8.42,0,-.62]}/>
  <group position={[1.2,0,-7.65]}>
    <mesh position={[0,.74,0]} castShadow><cylinderGeometry args={[1.25,1.25,.12,56]}/><meshStandardMaterial color="#d9d1c3" map={stone} roughness={.52}/></mesh>
    <mesh position={[0,.37,0]} castShadow><cylinderGeometry args={[.16,.36,.72,32]}/><meshStandardMaterial color="#706c65" metalness={.26} roughness={.38}/></mesh>
    {[0,1,2,3].map(i=>{const a=i*Math.PI/2;return <DiningChair key={i} position={[Math.cos(a)*1.82,0,Math.sin(a)*1.82]} rotation={-a+Math.PI/2}/>})}
  </group>
 </group>}

function VillaFacade(){const plaster=useMaterialTexture("plaster");return <group position={[9.35,0,.3]}>
    <mesh position={[.35,2.05,0]} castShadow receiveShadow><boxGeometry args={[.55,4.1,18.6]}/><meshStandardMaterial color="#e1dcd2" map={plaster} bumpMap={plaster} bumpScale={.03} roughness={.94}/></mesh>
    <mesh position={[-.18,4.06,0]} castShadow><boxGeometry args={[1.25,.18,18.85]}/><meshStandardMaterial color="#e8e4dc" map={plaster} roughness={.92}/></mesh>
    {[-6,-1.8,2.4,6.6].map(z=><group key={z} position={[-.03,1.8,z]}>
      <mesh position={[-.12,0,0]} castShadow><boxGeometry args={[.16,3.04,3.54]}/><meshStandardMaterial color="#454a48" metalness={.52} roughness={.24}/></mesh>
      <mesh position={[-.225,0,0]}><boxGeometry args={[.045,2.82,3.3]}/><meshPhysicalMaterial color="#8ca5a7" transparent opacity={.48} transmission={.36} thickness={.12} roughness={.055} metalness={.04} envMapIntensity={2.5}/></mesh>
      <mesh position={[-.255,0,0]}><boxGeometry args={[.035,2.9,.055]}/><meshStandardMaterial color="#282d2c" metalness={.68} roughness={.2}/></mesh>
      <mesh position={[-.255,0,0]}><boxGeometry args={[.035,.055,3.38]}/><meshStandardMaterial color="#282d2c" metalness={.68} roughness={.2}/></mesh>
    </group>)}
    {[-8.1,-4.0,.2,4.4,8.2].map(z=><group key={`sconce-${z}`} position={[-.34,2.18,z]}><mesh castShadow><boxGeometry args={[.14,.55,.22]}/><meshStandardMaterial color="#665a4b" metalness={.72} roughness={.25}/></mesh><pointLight position={[-.12,-.25,0]} color="#ffd5a0" intensity={1.45} distance={3.2}/></group>)}
    {[[-.1,2.7,-7.7],[-.1,2.7,7.7]].map((p,i)=><pointLight key={i} position={p as [number,number,number]} color="#ffd2a1" intensity={3.2} distance={6}/>) }
  </group>}

function EnvironmentScene(){const stone=useDesign(s=>s.stone),tex=useMaterialTexture("stone");return <>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.08,geometry.site.centreZ]} receiveShadow><planeGeometry args={[geometry.site.width,geometry.site.depth]}/><meshStandardMaterial color={stone} map={tex} bumpMap={tex} bumpScale={.035} roughness={.84}/></mesh>
    <Pool/><VillaFacade/><Lounge/><OutdoorFurniture/>
    <Tree position={[-8.3,0,-6.3]} scale={.86}/><Tree position={[-8.65,0,5.2]} scale={.98}/><Tree position={[-6.5,0,8.3]} scale={.82}/><Tree position={[8.4,0,-7.7]} scale={.88}/><PlanterBed/>
    <mesh position={[-9.65,1.35,1.2]} rotation={[0,0,0]} receiveShadow><boxGeometry args={[.22,2.7,18.7]}/><meshStandardMaterial color="#d5cec2" roughness={.96}/></mesh>
    <mesh position={[0,1.35,-9.83]} receiveShadow><boxGeometry args={[19.5,2.7,.22]}/><meshStandardMaterial color="#d5cec2" roughness={.96}/></mesh>
  </>}

const presets:Record<string,{position:[number,number,number],target:[number,number,number]}>= {
  overview:{position:[.5,18.5,-24],target:[0,0,1.4]}, pool:{position:[-5.4,1.65,-7.25],target:[.4,.8,.2]}, lounge:{position:[5.7,1.65,6.55],target:[2.8,1.0,9.5]}
};

function insidePlanPolygon(x:number,z:number,polygon:readonly PlanPoint[]){
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const [xi,zi]=polygon[i],[xj,zj]=polygon[j];
    if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))inside=!inside;
  }
  return inside;
}

function CameraController({preset}:{preset:string}){
  const {camera}=useThree(); const controls=useRef<OrbitControlsImpl>(null); const goal=useRef(presets[preset]||presets.overview); const moving=useRef(true); const keys=useRef(new Set<string>());
  useEffect(()=>{goal.current=presets[preset]||presets.overview;moving.current=true},[preset]);
  useEffect(()=>{const d=(e:KeyboardEvent)=>keys.current.add(e.key.toLowerCase()),u=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());addEventListener("keydown",d);addEventListener("keyup",u);return()=>{removeEventListener("keydown",d);removeEventListener("keyup",u)}},[]);
  useFrame((_,dt)=>{
    if(moving.current&&controls.current){camera.position.lerp(new THREE.Vector3(...goal.current.position),1-Math.exp(-dt*3.6));controls.current.target.lerp(new THREE.Vector3(...goal.current.target),1-Math.exp(-dt*3.6));if(camera.position.distanceTo(new THREE.Vector3(...goal.current.position))<.05)moving.current=false;controls.current.update();return}
    if(preset==="overview"||!controls.current)return;const f=Number(keys.current.has("w")||keys.current.has("arrowup"))-Number(keys.current.has("s")||keys.current.has("arrowdown")),s=Number(keys.current.has("d")||keys.current.has("arrowright"))-Number(keys.current.has("a")||keys.current.has("arrowleft"));if(!f&&!s)return;const dir=new THREE.Vector3();camera.getWorldDirection(dir);dir.y=0;dir.normalize();const right=new THREE.Vector3().crossVectors(dir,camera.up).normalize();const move=dir.multiplyScalar(f*dt*2.6).add(right.multiplyScalar(s*dt*2.6));const next=camera.position.clone().add(move);next.x=THREE.MathUtils.clamp(next.x,-9.15,8.82);next.z=THREE.MathUtils.clamp(next.z,-9.25,10.45);if(insidePlanPolygon(next.x,next.z,poolOuter))return;camera.position.copy(next);controls.current.target.add(move);camera.position.y=1.65;controls.current.update()
  });
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.065} minDistance={preset==="overview"?8:1.5} maxDistance={34} maxPolarAngle={Math.PI/2.03} target={presets.overview.target}/>;
}

function Lighting(){const atmosphere=useDesign(s=>s.atmosphere);const values=atmosphere==="night"?{bg:"#101820",amb:.28,sun:"#87a2c5",i:.85,pos:[-6,9,-5] as [number,number,number]}:atmosphere==="morning"?{bg:"#c8dcdf",amb:1.15,sun:"#fff1d4",i:3.2,pos:[-8,13,-4] as [number,number,number]}:{bg:"#c6a98e",amb:.82,sun:"#ffd0a0",i:3.6,pos:[-10,8,6] as [number,number,number]};const{scene}=useThree();useEffect(()=>{scene.background=new THREE.Color(values.bg);scene.fog=new THREE.Fog(values.bg,30,60)},[scene,values.bg]);return <><hemisphereLight args={[values.sun,"#6e716a",values.amb]}/><ambientLight intensity={atmosphere==="night"?.12:.22}/><directionalLight castShadow color={values.sun} intensity={values.i} position={values.pos} shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-bias={-.00015}/></>}

export default function Scene({cameraTarget}:{cameraTarget:string}){return <Canvas shadows dpr={[1,1.65]} camera={{position:presets.overview.position,fov:46,near:.08,far:100}} gl={{antialias:true,powerPreference:"high-performance",preserveDrawingBuffer:true}} onCreated={({gl})=>{gl.toneMappingExposure=1.18}}>
  <Lighting/><Environment resolution={192}><Lightformer form="rect" intensity={4} color="#fff4df" position={[-8,10,-10]} rotation={[Math.PI/3,0,0]} scale={[12,12,1]}/><Lightformer form="rect" intensity={2} color="#b7d9df" position={[10,5,5]} rotation={[0,-Math.PI/2,0]} scale={[10,8,1]}/></Environment><EnvironmentScene/><CameraController preset={cameraTarget}/>
  <EffectComposer multisampling={0}><Bloom intensity={.08} luminanceThreshold={1.2}/><ToneMapping mode={THREE.ACESFilmicToneMapping}/></EffectComposer>
 </Canvas>}
