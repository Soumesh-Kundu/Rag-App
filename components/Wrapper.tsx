"use client";
import { AccessUsers, Thread } from "@/lib/types";
import { Role } from "@prisma/client";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useEffect, createContext, useState, useContext } from "react";

type ContextProps = {
  currentThread: Thread | null;
  setCurrentThread: React.Dispatch<React.SetStateAction<Thread | null>>;
  currentUser: Session | null;
  clearUser: () => void;
  sharedUsers: AccessUsers;  
  setSharedUsers: React.Dispatch<React.SetStateAction<AccessUsers>>;
};
const ThreadsContext = createContext<ContextProps>({
  currentThread: { id: 0, name: "", role: Role.owner, nameSpace: "" },
  setCurrentThread: () => {},
  currentUser: null,
  clearUser: () => {},
  setSharedUsers:()=>{},
  sharedUsers:[]
});
export default function Wrapper({ children }: { children: React.ReactNode }) {
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const session = useSession();
  const [currentUser, setCurrentUser] = useState(session.data);
  const [sharedUsers, setSharedUsers] = useState<AccessUsers>({});

  function clearUser() {
    setCurrentUser(null);
  }

  
  useEffect(() => {
    setCurrentUser(session.data);
  }, [session.data]);

  return (
    <>
      <ThreadsContext.Provider
        value={{ currentUser, clearUser, currentThread, setCurrentThread,setSharedUsers,sharedUsers }}
      >
        {children}
      </ThreadsContext.Provider>
    </>
  );
}
export function useThreads() {
  return useContext(ThreadsContext);
}
