"use client"
import React, { useEffect } from "react";
// import { dotWave } from "ldrs";
// dotWave.register()

export default function Wrapper({ children }: { children: React.ReactNode }) {
  useEffect(()=>{
    async function registerLoaders(){
      const {dotWave}=await import('ldrs')
      dotWave.register()
      console.log("ldrs loaded")
    }
    registerLoaders()
    console.log("loading loader")
  },[])
  return <>{children}</>;
}
