"use client"
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
    useEffect(()=>{
        (async ()=>{
            const {ring,dotWave}=await import("ldrs")
            ring.register()
            dotWave.register()
        })()
    })
    return <>
        <SessionProvider>
          
            {children}
        </SessionProvider>
    </>
}