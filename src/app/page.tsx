"use client";

import dynamic from "next/dynamic";

const Experience = dynamic(() => import("@/components/Experience"), { ssr: false });

export default function Home() {
  return <main><Experience /></main>;
}
