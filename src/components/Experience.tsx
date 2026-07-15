"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Scene from "./Scene";
import { palettes } from "@/config/project";
import { useDesign } from "@/state/useDesign";

function Swatches({ colors, value, onChange }: { colors: readonly string[], value:string, onChange:(v:string)=>void }) {
  return <div className="swatches">{colors.map((c)=><button key={c} className={value===c?"active":""} style={{"--swatch":c} as React.CSSProperties} onClick={()=>onChange(c)} aria-label={`Select ${c}`}/>)}</div>;
}

function Panel({ capture, save }: { capture:()=>void, save:()=>void }) {
  const state = useDesign();
  return <motion.aside className="panel" initial={{x:420}} animate={{x:0}} exit={{x:420}} transition={{type:"spring",damping:28,stiffness:250}}>
    <div className="panelHead"><div><small>DESIGN STUDIO</small><h2>Pool Terrace</h2></div><button className="icon" onClick={()=>state.set({panel:false})}>×</button></div>
    <section><label>Atmosphere</label><div className="segmented">{(["morning","golden","night"] as const).map(x=><button className={state.atmosphere===x?"selected":""} onClick={()=>state.set({atmosphere:x})} key={x}>{x}</button>)}</div></section>
    <section><label>Pool water</label><Swatches colors={palettes.water} value={state.water} onChange={(water)=>state.set({water})}/><input type="color" value={state.water} onChange={e=>state.set({water:e.target.value})}/></section>
    <section><label>Deck & coping</label><Swatches colors={palettes.stone} value={state.stone} onChange={(stone)=>state.set({stone})}/></section>
    <section><label>Outdoor upholstery</label><Swatches colors={palettes.fabric} value={state.fabric} onChange={(fabric)=>state.set({fabric})}/></section>
    <section><label>Furniture direction</label><div className="stack">{(["contemporary","mediterranean","minimal"] as const).map(x=><button className={state.collection===x?"choice selected":"choice"} onClick={()=>state.set({collection:x})} key={x}><span>{x}</span><b>↗</b></button>)}</div></section>
    <div className="panelActions"><button onClick={state.reset}>Reset</button><button onClick={save}>Save design</button><button className="primary" onClick={capture}>Create image</button></div>
  </motion.aside>;
}

function MobileWalk({enabled}:{enabled:boolean}){
  if(!enabled)return null;
  const press=(key:string,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?"keydown":"keyup",{key}));
  return <div className="mobileWalk" aria-label="Walk controls">
    {[["↑","w"],["←","a"],["↓","s"],["→","d"]].map(([label,key])=><button key={key} onPointerDown={()=>press(key,true)} onPointerUp={()=>press(key,false)} onPointerCancel={()=>press(key,false)} onPointerLeave={()=>press(key,false)} aria-label={`Move ${label}`}>{label}</button>)}
  </div>;
}

export default function Experience() {
  const state = useDesign();
  const [camera,setCamera] = useState("overview");
  const [toast,setToast] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const requestedView=params.get("view");
    if(requestedView&&["overview","pool","lounge"].includes(requestedView))setCamera(requestedView);
    if(params.has("design")) try { state.set(JSON.parse(atob(params.get("design")!))); } catch {}
    const saved = localStorage.getItem("lijbailat-design");
    if(saved && !params.has("design")) try { state.set(JSON.parse(saved)); } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const notify=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),2200)};
  const goCamera=(view:string)=>{setCamera(view);const u=new URL(location.href);u.searchParams.set("view",view);history.replaceState(null,"",u)};
  const save=()=>{ const d={water:state.water,stone:state.stone,fabric:state.fabric,atmosphere:state.atmosphere,collection:state.collection}; localStorage.setItem("lijbailat-design",JSON.stringify(d)); const u=new URL(location.href);u.searchParams.set("design",btoa(JSON.stringify(d))); history.replaceState(null,"",u); navigator.clipboard?.writeText(u.toString());notify("Design saved · share link copied"); };
  const capture=()=>{ const canvas=root.current?.querySelector("canvas"); if(!canvas)return; const a=document.createElement("a");a.download="lijbailat-pool-presentation.png";a.href=canvas.toDataURL("image/png");a.click();notify("Presentation image created"); };
  return <div className="experience" ref={root}>
    <Scene cameraTarget={camera}/>
    <header className="topbar"><div className="brand"><i>LH</i><div><b>LIJBAILAT VILLA</b><small>POOL TERRACE EXPERIENCE</small></div></div><div className="topActions"><button onClick={()=>state.set({intro:true})} title="Replay introduction">↻</button><button onClick={()=>document.documentElement.requestFullscreen?.()} title="Full screen">⛶</button><button className="design" onClick={()=>state.set({panel:true})}>Design Studio <span>＋</span></button></div></header>
    <nav className="views"><small>CURATED VIEWS</small>{[["overview","Aerial"],["pool","Human eye"],["lounge","Lounge"]].map(([id,label])=><button className={camera===id?"active":""} onClick={()=>goCamera(id)} key={id}><span>{label}</span></button>)}</nav>
    <button className="minimap" onClick={()=>goCamera("pool")} aria-label="Travel to pool viewpoint"><span className="poolMark"></span><i></i><b>POOL PLAN</b></button>
    <div className="status"><span></span> REAL-TIME EXPERIENCE <b>01</b></div>
    <button className="mobileDesign" onClick={()=>state.set({panel:true})}>Design Studio</button>
    <MobileWalk enabled={camera!=="overview"}/>
    <AnimatePresence>{state.panel&&<Panel capture={capture} save={save}/>}</AnimatePresence>
    <AnimatePresence>{state.intro&&<motion.div className="intro" exit={{opacity:0}} transition={{duration:1.2}}>
      <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.3,duration:1.3}}><small>AN INTERACTIVE ARCHITECTURAL PRESENTATION</small><h1>Lijbailat<br/><em>Pool Terrace</em></h1><p>Explore the proposed pool environment in real time.</p><button onClick={()=>state.set({intro:false})}>Enter the experience <span>→</span></button></motion.div>
      <button className="skip" onClick={()=>state.set({intro:false})}>SKIP INTRO</button>
    </motion.div>}</AnimatePresence>
    <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{toast}</motion.div>}</AnimatePresence>
  </div>;
}
