"use client";

import { useChat } from "ai/react";
import { useEffect, useMemo, useState } from "react";
import { insertDataIntoMessages } from "./transform";
import { ChatInput, ChatMessages } from "./ui/chat";
import NewChat from "./new-chat-section";
import { Slider } from "./ui/slider";
import { Button, buttonVariants } from "./ui/button";
import { useParams, useRouter } from "next/navigation";
import { Switch } from "./ui/switch";
import { ShareIcon, TrashIcon } from "@heroicons/react/24/solid";
import ShareRepo from "./ui/chat/share-repo";
import { useThreads } from "./Wrapper";
import { app } from "@/lib/db/realm";
import { inboxConfig } from "@/lib/utils";
import { deleteNameSpace } from "@/app/_action";
import ChatMessagesAction from "./ui/chat/chat-messages-action";
import { DropdownMenu, DropdownMenuTrigger,DropdownMenuContent } from "./ui/dropdown-menu";
import { Ellipsis } from "lucide-react";

function isInbox(name: string) {
  return /gmail|hotmail|zoho/.test(name);
}
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
  const [currenUserRole, setCurrentUserRole] = useState<
    "Editor" | "Commenter" | "Read-Only" | "Admin"
  >("Admin");
  const { threads } = useThreads();
  const transformedMessages = useMemo(() => {
    return insertDataIntoMessages(messages, data, isAutoSaveOn);
  }, [messages, data]);
  const router = useRouter();
  const params = useParams();
  async function handleReset() {
    try {
      setPending(!isPending);
      await deleteNameSpace(params.id as string);
      router.push(`/${params.id}/add`);
    } catch (error) {
      console.log(error);
      setPending(false);
    }
  }
  async function uploadLastMessage() {
    try {
      const lastMessages = transformedMessages.slice(-2);
      const mongo = app.currentUser
        ?.mongoClient("mongodb-atlas")
        .db("private-gpt")
        .collection("messages");
      const message = lastMessages.map((item) => ({
        role: item?.role.toUpperCase() as string,
        content: item?.content,
        threadId: isInbox(params.id as string)
          ? (inboxConfig.get(params.id as string)?.threadID as string)
          : params.id,
        createdAt: item?.createdAt?.toISOString(),
        data: (item?.data as { result: { score: number; text: string }[] })
          ?.result,
        comment: [],
      }));
      const res = await fetch("/api/messages/add", {
        method: "POST",
        body: JSON.stringify({
          messages: message,
          threadID: params.id,
        }),
      });
      const insertedItems = await mongo?.insertMany(message);
      if (insertedItems?.insertedIds?.length ) {
        console.log("updated");
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    const thread = threads?.find((item) => item.id === params.id);
    if (thread?.userId === app.currentUser?.id || /gmail|hotmail|zoho/.test(params.id as string)) {
      setCurrentUserRole("Admin");
    } else {
      setCurrentUserRole(
        thread?.shared_access?.role as "Editor" | "Commenter" | "Read-Only"
      );
    }
  }, [threads,params.id]);
  useEffect(() => {
    if (
      isAutoSaveOn &&
      isStreamFinished &&
      transformedMessages?.at(-1)?.role === "assistant"
    ) {
      uploadLastMessage();
    }
  }, [transformedMessages, isStreamFinished]);
  return (
    <div className="space-y-4 max-w-6xl w-[calc(100%-1rem)] lg:w-[calc(100%-2rem)] mx-auto scrollbar px-2 lg:px-0">
      <div className="flex items-center justify-between  relative bg-slate-100/50 backdrop-blur-md rounded-full py-3 px-2 lg:p-1.5">
        <Slider
          defaultValue={[topK]}
          max={30}
          step={1}
          isHover={isHover}
          onMouseOver={() => {
            if (isHover) {
              return;
            }
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
          }}
          className="w-1/2 lg:w-[25%] ml-2"
          onValueChange={(value) => {
            setTopK(value[0]);
          }}
          topK={topK}
          onValueCommit={() => {
            console.log(topK);
          }}
        />
        <div className="items-center gap-3 hidden lg:flex">
         <ChatMessagesAction currenUserRole={currenUserRole} handleReset={handleReset} setAutoSaveOn={setAutoSaveOn} isAutoSaveOn={isAutoSaveOn} isInbox={isInbox}isPending= {isPending}/>
        </div>
        <div className="lg:hidden pr-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center">
              <Ellipsis className="h-6 w-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-1 !w-44 mr-3">
            <ChatMessagesAction currenUserRole={currenUserRole} handleReset={handleReset} setAutoSaveOn={setAutoSaveOn} isAutoSaveOn={isAutoSaveOn} isInbox={isInbox}isPending= {isPending}/>
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
