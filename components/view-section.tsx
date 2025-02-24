"use client";

import ViewMessage from "./view/view-message";
import { TooltipProvider } from "./ui/tooltip";
import { PackageOpen } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useThreads } from "./Wrapper";
import { revalidatePath } from "next/cache";
import {  Messages } from "@prisma/client";
import { deleteMessage } from "@/app/_action/messages";
import { useToast } from "@/hooks/use-toast";
export type customComments = {id:number,text:string,createdAt:Date,user:{id:number,name:string}}
export default function ViewSection({messages}:{messages:(Messages & {comments:customComments[]})[]}) {
  const pathname = usePathname()
  const {currentThread} = useThreads();
  const { toast } = useToast();
  async function deleteThreadMessage(id:number[]) {
    try{
      const {success}=await deleteMessage(id);
      if(!success){
        toast({variant:"destructive",title:"Oops!!",description:"Please try again later"})
      }
    }
    catch(error){
      console.log(error)
    }
  }
  function refreshMessages() {
    revalidatePath(pathname);
  }
  return (
    <TooltipProvider>
      <div className="space-y-4 max-w-6xl flex flex-col justify-center items-center flex-grow min-h-0  w-[calc(100%-0.5rem)] lg:w-[calc(90%)] scrollbar mx-auto px-1 lg:px-0  overflow-y-auto  ">
        <div className={`w-full  ${messages.length<1 ? '!h-[60dvh]':'flex-grow '} overflow-y-auto flex-col flex bg-white px-3 pb-4 md:px-4 shadow-xl  rounded-lg `}>
          {/* <div className="flex max-h-full scrollbar pr-1  flex-col gap-5 divide-y  pb-4 duration-300"> */}
            {messages?.length > 0 ? (
              messages.map((m, index) => (
                <ViewMessage
                  key={m.id}
                  chatMessage={m}
                  prevMessageId={messages[index-1]?.id || NaN}
                  deleteMessage={deleteThreadMessage}
                  refreshMessages={refreshMessages}
                  currentUserRole={currentThread?.role}
                />
              ))
            ) : (
              <div className="w-full flex-grow  h-full flex flex-col justify-center items-center font-bold text-2xl text-gray-400 ">
                <PackageOpen strokeWidth={0.8} size={90} />
                No message history...
              </div>
            )}
          {/* </div> */}
        </div>
      </div>
    </TooltipProvider>
  );
}
