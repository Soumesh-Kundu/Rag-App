"use client";

import { Message, useChat } from "ai/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { insertDataIntoMessages } from "./transform";
import { ChatInput, ChatMessages } from "./chat";
import { Slider } from "./ui/slider";
import { useParams, useRouter } from "next/navigation";
import { useThreads } from "./Wrapper";
import ChatMessagesAction from "./chat/chat-messages-action";
import { DropdownMenu, DropdownMenuTrigger,DropdownMenuContent } from "./ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { Role } from "@prisma/client";
import { deleteNamespace } from "@/app/_action/pincone";
import { addMessage } from "@/app/_action/messages";
const messageReponses=[
  `**📄 DocGPT is ready to assist!**  

  Use **\`/doc\`** to fetch answers directly from your documents.`,
  `**🔍 Find what you need instantly!**  

  Use **\`/doc\`** to search your documents with ease.  `,
  `
  **🤖 Need help? DocGPT is here!**

  Ask with **\`/doc\`** and get insights from your documents.  
  `,
  `**⚡ Get answers fast with DocGPT!**  
  
  Use **\`/doc\`** to access document-based insights.  
  `,
  `
  **🚀 Supercharge your search with AI!**  

  Type **\`/doc\`** and get precise answers from your documents. 
  `
]

export default function ChatSection() {
  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    data,
  } = useChat({
    api: process.env.NEXT_PUBLIC_CHAT_API,
    headers: {
      "Content-Type": "application/json", // using JSON because of vercel/ai 2.2.26
    },
    onResponse() {
      setStreamFinished(false);
    },
    onFinish() {
      setStreamFinished(true);
    },
  });
  const [topK, setTopK] = useState<number>(5);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isPending, setPending] = useState<boolean>(false);
  const [isStreamFinished, setStreamFinished] = useState<boolean>(true);
  const [isAutoSaveOn, setAutoSaveOn] = useState<boolean>(false);
  const [initResponse, setInitResponse] = useState<Message>({id:"init",role:'assistant',content:''});
  const { currentThread } = useThreads();
  const transformedMessages = useMemo(() => {
    return insertDataIntoMessages(messages, data, isAutoSaveOn,initResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, data,initResponse]);
  const randomIndex=useRef<number>(Math.min(Math.floor(Math.random()*messageReponses.length),messageReponses.length-1))

  function* readInitMessage(initMessage:string) {
    for (let index=0;index<initMessage.length;index++){ 
      yield initMessage.slice(0,index+1) ;
    }
  }
  useEffect(()=>{
    const init = readInitMessage(messageReponses[randomIndex.current]);
    const streamInterval=setInterval(()=>{
      const char=init.next();
      if(char.done){
        clearInterval(streamInterval);
        return
      }
      setInitResponse((prev)=>({...prev,content:char.value}))
    },10)
  },[])
  const router = useRouter();
  const params = useParams();
  async function handleReset() {
    if(isPending){
      return;
    }
    try {
      setPending(!isPending);
      await deleteNamespace(params.id as string);
      router.push(`/${params.id}/add`);
    } catch (error) {
      console.log(error);
      setPending(false);
    }
  }
  async function uploadLastMessage() {
    if(!isAutoSaveOn) return
    try {
      const lastMessages = transformedMessages.slice(-2);
      const message = lastMessages.map((item) => ({
        role: item?.role,
        content: item?.content,
        threadId: params.id as string,
        data: (item?.data as { result: { score: number; text: string }[] })
          ?.result
      }));
      await addMessage(message);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (
      isStreamFinished &&
      transformedMessages?.at(-1)?.role === "assistant"
    ) {
      uploadLastMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedMessages, isStreamFinished]);
  return (
    <div className=" mt-8 md:my-0 space-y-4  max-w-6xl w-[calc(100%-0.5rem)] lg:w-[calc(90%)] mx-auto scrollbar px-2 lg:px-0">
      <div className="flex items-center justify-between  relative bg-slate-100/50 backdrop-blur-md rounded-full py-3 px-2 lg:p-1.5">
        <Slider
          defaultValue={[topK]}
          max={30}
          step={1}
          isHover={isHover}
          onMouseOver={() => {
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
          }}
          className="w-1/2 lg:w-[25%] ml-2"
          onValueChange={(value) => {
            setIsHover(true)
            setTopK(value[0]);
          }}
          topK={topK}
          onValueCommit={() => {
            setIsHover(false);
          }}
        />
        <div className="items-center gap-3 hidden lg:flex">
         <ChatMessagesAction currentUserRole={currentThread?.role} handleReset={handleReset} setAutoSaveOn={setAutoSaveOn} isAutoSaveOn={isAutoSaveOn} isPending= {isPending}/>
        </div>
        <div className="lg:hidden pr-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center">
              <Ellipsis className="h-6 w-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-1 !w-44 mr-3">
            <ChatMessagesAction currentUserRole={currentThread?.role} handleReset={handleReset} setAutoSaveOn={setAutoSaveOn} isAutoSaveOn={isAutoSaveOn} isPending= {isPending}/>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ChatMessages
        messages={transformedMessages}
        isLoading={isLoading}
        reload={reload}
        stop={stop}
      />
      <ChatInput
        input={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        topK={topK}
        multiModal={process.env.NEXT_PUBLIC_MODEL === "gpt-4-vision-preview"}
      />
    </div>
  );
}
