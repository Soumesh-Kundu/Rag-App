"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, createContext, useState, useContext } from "react";
// import { dotWave } from "ldrs";
// dotWave.register()
type Thread = {
  id: string;
  userId?:string,
  name: string;
  createdAt?:string;
  shared_access?:{
    userId:string,
    role:"Editor"|"Commenter"|"Read-Only"
  }
};

type ContextProps = {
  threads: Thread[];
  setRepos: (threads: Thread[]) => void;
};
const ThreadsContext = createContext<ContextProps>({
  threads: [],
  setRepos: (threads: Thread[]) => {},
});
const unAuthorizedRoutes=[
  'login',
  'signup',
  'confirm-email',
  'reset-password',
  'forgot-password',
  'callback',
  'accept-invite'
]
export default function Wrapper({
  children,
  Sidebar,
}: {
  children: React.ReactNode;
  Sidebar: React.ReactNode;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const pathname=usePathname()
  function setRepos(repos: Thread[]) {
    setThreads(repos);
  }
  useEffect(() => {
    async function registerLoaders() {
      const { dotWave, ring } = await import("ldrs");
      dotWave.register();
      ring.register();
    }
    registerLoaders();
  }, []);
  return (
    <>
      <ThreadsContext.Provider value={{ threads, setRepos }}>
        {!new RegExp(unAuthorizedRoutes.join("|")).test(pathname) && Sidebar}
        <div className="gap-10 grid place-items-center w-full h-screen overflow-hidden  scrollbar">
          {children}
        </div>
      </ThreadsContext.Provider>
    </>
  );
}
export function useThreads() {
  return useContext(ThreadsContext);
}
