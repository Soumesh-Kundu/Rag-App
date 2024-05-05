"use client";
import { Message } from "ai/react";
import ViewMessage from "./ui/view/view-message";
import { TooltipProvider } from "./ui/tooltip";
import { PackageOpen } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export type MessageBody={
    id: string;
    threadID: string,
    content: string,
    role: 'USER'|'ASSISTANT'|'SYSTEM',
    createdAt: Date,
    comments: string[],
    data: {
        score: number,
        text: string,
    }[];

}
export default function ViewSection({ messages }:{messages: MessageBody[]}) {
  const router=useRouter()
  async function deleteMessage(index:number) {
    const ids= messages.slice(index-1,index+1).map((m)=>m.id);
    const res=await fetch('/api/messages/delete',{
      method: 'DELETE',
      body: JSON.stringify({ids}),
  
    })
    return res
    console.log(res)
  };
  useEffect(()=>{
    router.refresh()
  },[])
  return (
    <TooltipProvider>
      <div className="space-y-4 max-w-6xl w-[calc(100%-2rem)] scrollbar px-2 lg:px-0">
        <div className="w-full rounded-xl bg-white p-4 shadow-xl pb-0">
          <div className="flex max-h-[85dvh] scrollbar pr-1 flex-col gap-5 divide-y overflow-y-auto pb-4">
            {messages.length > 0 ?messages.map((m, index) => (
              <ViewMessage key={m.id} chatMessage={m} messageIndex={index} deleteMessage={deleteMessage} />)):
              <div className="w-full h-[85dvh] flex flex-col justify-center items-center font-bold text-2xl text-gray-400 ">
                <PackageOpen strokeWidth={0.8} size={90} />
                No message history...
              </div>
            }
          </div>
          <div className="flex justify-end py-4"></div>
        </div>
      </div>
    </TooltipProvider>
  );
}
