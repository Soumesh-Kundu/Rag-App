"use client";
import { Message } from "ai/react";
import ViewMessage from "./ui/view/view-message";
import { TooltipProvider } from "./ui/tooltip";
import { PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { app } from "@/lib/db/realm";
import { useThreads } from "./Wrapper";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
export type MessageBody = {
  id: string;
  threadID: string;
  content: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  createdAt: Date;
  comments: {
    text: string;
    name: string;
    createdAt: string;
  }[];
  data: {
    score: number;
    text: string;
  }[];
};
export default function ViewSection() {
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState<{
    messages: MessageBody[];
    isLoaded: boolean;
  }>({ messages: [], isLoaded: false });
  const { threads } = useThreads();
  const [currenUserRole, setCurrentUserRole] = useState<
    "Editor" | "Commenter" | "Read-Only" | "Admin"
  >("Admin");
  async function deleteMessage(index: number) {
    const collection = app.currentUser
      ?.mongoClient("mongodb-atlas")
      .db("private-gpt")
      .collection("messages");
    try {
      const ids = messages.messages
        .slice(index - 1, index + 1)
        .map((m) => m.id);
      const res = await collection?.deleteMany({
        _id: { $in: ids.map((id) => ({ $oid: id })) },
      });
      if (res?.deletedCount === 2) {
        getMessages();
      }
    } catch (error) {
      console.log(error);
    }
  }
  function refreshMessages() {
    getMessages();
  }
  async function getMessages() {
    const collection = app.currentUser
      ?.mongoClient("mongodb-atlas")
      .db("private-gpt")
      .collection("messages");
    const messages = (await collection?.find(
      { threadId: params.id },
      {
        projection: {
          id: { $toString: "$_id" },
          threadId: 1,
          content: 1,
          role: 1,
          createdAt: 1,
          comments: 1,
          data: 1,
        },
      }
    )) as MessageBody[];
    console.log(messages);
    setMessages({ messages, isLoaded: true });
  }
  useEffect(() => {
    getMessages();
  }, []);
  useEffect(() => {
    const thread = threads?.find((item) => item.id === params.id);
    console.log(thread);
    if (thread?.userId === app.currentUser?.id) {
      setCurrentUserRole("Admin");
    } else {
      setCurrentUserRole(
        thread?.shared_access?.role as "Editor" | "Commenter" | "Read-Only"
      );
    }
  }, [threads, params.id]);
  return (
    <TooltipProvider>
      <div className="space-y-4 max-w-6xl w-[calc(100%-2rem)] scrollbar px-2 lg:px-0">
        <div className="w-full rounded-xl bg-white p-4 shadow-xl pb-0">
          <div className="flex max-h-[85dvh] scrollbar pr-1 flex-col gap-5 divide-y overflow-y-auto pb-4 duration-300">
            {messages.isLoaded ? (
              <>
                {messages?.messages?.length > 0 ? (
                  messages.messages.map((m, index) => (
                    <ViewMessage
                      key={m.id}
                      chatMessage={m}
                      messageIndex={index}
                      deleteMessage={deleteMessage}
                      refreshMessages={refreshMessages}
                      currentUserRole={currenUserRole}
                    />
                  ))
                ) : (
                  <div className="w-full h-[85dvh] flex flex-col justify-center items-center font-bold text-2xl text-gray-400 ">
                    <PackageOpen strokeWidth={0.8} size={90} />
                    No message history...
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-full">
                  <div className="flex items-center gap-5 mb-4">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-3/5 h-3 rounded-full" />
                  </div>
                  <Separator />
                  <div className="flex gap-5 mt-4 w-full">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <div className="flex flex-col gap-2  flex-grow">
                      <Skeleton className="w-9/12 h-3 rounded-full" />
                      <Skeleton className="w-7/12 h-2 rounded-full" />
                      <Skeleton className="w-5/12 h-2 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    </div>
                  </div>
                </div>
                <div className="w-full mt-4">
                  <div className="flex items-center gap-5 my-4">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-4/12 h-3 rounded-full" />
                  </div>
                  <Separator />
                  <div className="flex gap-5 mt-4 w-full">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <div className="flex flex-col gap-2  flex-grow">
                      <Skeleton className="w-7/12 h-3 rounded-full" />
                      <Skeleton className="w-9/12 h-2 rounded-full" />
                      <Skeleton className="w-5/12 h-2 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end py-4"></div>
        </div>
      </div>
    </TooltipProvider>
  );
}
