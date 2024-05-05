"use client"
import React, { useEffect } from "react";
// import { dotWave } from "ldrs";
// dotWave.register()

export default function Wrapper({ children }: { children: React.ReactNode }) {
  useEffect(()=>{
    async function registerLoaders(){
      const {dotWave,ring}=await import('ldrs')
      dotWave.register()
      ring.register()
      console.log("ldrs loaded")
    }
    registerLoaders()
    console.log("loading loader")
  },[])
  return <div className="gap-10 grid place-items-center w-full h-[100dvh] scrollbar">{children}</div>;
}
