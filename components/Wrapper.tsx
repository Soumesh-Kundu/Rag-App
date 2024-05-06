"use client";
import React, { useEffect, createContext, useState, useContext } from "react";
// import { dotWave } from "ldrs";
// dotWave.register()
type Thread = {
  id: string;
  name: string;
};

type ContextProps = {
  threads: Thread[];
  setRepos: (threads: Thread[]) => void;
};
const ThreadsContext = createContext<ContextProps>({
  threads: [],
  setRepos: (threads: Thread[]) => {},
});
export default function Wrapper({
  children,
  Sidebar,
}: {
  children: React.ReactNode;
  Sidebar: React.ReactNode;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  function setRepos(repos: Thread[]) {
    console.log(repos);
    console.log("hello");
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
        {Sidebar}
        <div className="gap-10 grid place-items-center w-full h-[100dvh] scrollbar">
          {children}
        </div>
      </ThreadsContext.Provider>
    </>
  );
}
export function useThreads() {
  return useContext(ThreadsContext);
}
