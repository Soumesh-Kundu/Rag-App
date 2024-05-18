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
      const res = await fetch("/api/reset", {
        method: "DELETE",
        body: JSON.stringify({ indexName: params.id }),
      });
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
    console.log(thread);
    if (thread?.userId === app.currentUser?.id || /gmail|hotmail|zoho/.test(params.id as string)) {
      setCurrentUserRole("Admin");
    } else {
      console.log(
        !isInbox(params.id as string),
        /Admin|Editor/.test(currenUserRole)
      );
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
    <div className="space-y-4 max-w-6xl w-[calc(100%-2rem)] scrollbar px-2 lg:px-0">
      <div className="flex items-center justify-between bg-slate-100/50 backdrop-blur-md rounded-full p-1.5">
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
          className="w-[25%] ml-2"
          onValueChange={(value) => {
            setTopK(value[0]);
          }}
          topK={topK}
          onValueCommit={() => {
            console.log(topK);
          }}
        />
        <div className="flex items-center gap-3">
          {!isInbox(params.id as string) &&
            /Admin|Editor/.test(currenUserRole) && <NewChat />}
          {!isInbox(params.id as string) &&
            /Admin|Editor/.test(currenUserRole) && (
              <Button
                onClick={handleReset}
                variant="destructive-rfull"
                className={`flex items-center gap-2 justify-center  ${
                  isPending && "!bg-red-500"
                }`}
              >
                {isPending ? (
                  <span className="px-2.5">
                    <l-dot-wave
                      size={40}
                      speed={1.6}
                      color="white"
                    ></l-dot-wave>
                  </span>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Reset
                  </>
                )}
              </Button>
            )}
          <ShareRepo Role={currenUserRole}>
            <Button
              onClick={() => {}}
              variant={"blue-rfull"}
              className="flex items-center gap-2"
            >
              <ShareIcon className="w-4 h-4" />
              Share
            </Button>
          </ShareRepo>
          <div
            className={`${buttonVariants({
              variant: "pale-rfull",
            })} flex items-center gap-3 bg-white rounded-lg py-2 px-4`}
          >
            <Switch
              checked={isAutoSaveOn}
              onCheckedChange={() => setAutoSaveOn(!isAutoSaveOn)}
            />
            <p className="text-nowrap">Autosave</p>
          </div>
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
