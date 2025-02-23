"use client"
import { AccessUsers, SharedUser, Thread } from "@/lib/types";
import { useEffect } from "react";
import { useThreads } from "./Wrapper";

export default function SetInitComponent({initThread,users}:{initThread:Thread,users:AccessUsers}) {
  const {currentThread,setCurrentThread,setSharedUsers}=useThreads()
  useEffect(() => {
    setSharedUsers((prev)=>users);
    if(!currentThread){
      setCurrentThread((prev)=>initThread);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
    </>
  );
}
