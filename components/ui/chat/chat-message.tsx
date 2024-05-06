import { Check, Copy, FilePlus2, FileCheck2 } from "lucide-react";
import { JSONValue, Message } from "ai";
import { Button } from "../button";
import ChatAvatar from "./chat-avatar";
import Markdown from "./markdown";
import { useCopyToClipboard } from "./use-copy-to-clipboard";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

type ChatMessageExtraData = {
  result: { score: number; text: string }[];
};

// This component will parse message data and render the appropriate UI.
function ChatMessageData({ messageData }: { messageData: JSONValue }) {
  const { result } = messageData as unknown as ChatMessageExtraData;
  if (result.length > 0) {
    return (
      <div className="flex gap-2 flex-wrap  w-full items-center">
        {result.map(({ score, text }) => {
          const percentageScore = (score * 100).toString().slice(0, 5);
          return (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="py-0.5 px-2 bg-slate-200 rounded-full text-sm">
                    matched {percentageScore}%
                  </button>
                </DialogTrigger>
                <DialogOverlay className="bg-black/5">
                  <DialogContent className="w-[calc(100%-2*8px)] sm:mx-0 rounded-lg sm:max-w-xl max-h-[calc(100dvh-2*25px)] flex flex-col gap-2 py-9 px-5 md:px-8 md:py-12   !bg-slate-100">
                    <div className="max-h-[calc(100%-3rem)] pr-1  overflow-y-auto rounded-xl  scrollbar">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Score: </span>{" "}
                        {percentageScore}%
                      </div>
                      <div className="break-words ">
                        <span className="font-semibold">Context: </span>
                        <div className="pl-3">
                          {text
                            .split("\n")
                            .filter((item) => item.trim().length)
                            .map((item) => {
                              const [key, ...text] = item
                                .split(":")
                                .filter((item) => item.trim().length);
                              const content = text.join(":");
                              return (
                                <>
                                  <div className="pb-3">
                                    <span className="font-medium">{key}</span>:{" "}
                                    {content}
                                  </div>
                                </>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </DialogOverlay>
              </Dialog>
            </>
          );
        })}
      </div>
    );
  }
  return null;
}

type ChatMessageProps = {
  chatMessage: Message & {isSaved?:boolean};
  messageIndex: number;
  saveResponse: (messageIndex: number) => Promise<void>;
};

export default function ChatMessage({chatMessage,messageIndex,saveResponse}:ChatMessageProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const [isLoading,setLoading]=useState<boolean>(false)
  async function uploadThisMessage(){
    if(chatMessage.isSaved)return
    try{
      setLoading(true)
      await saveResponse(messageIndex)
      setLoading(false)
    }
    catch(e){
      console.log(e)
    }
  }
  return (
    <div className="flex items-start gap-2.5 sm:gap-4  sm:pr-5 pt-5">
      <ChatAvatar role={chatMessage.role} />
      <div className="group flex flex-1 justify-between gap-2 items-start">
        <div className="flex-1 space-y-4 pt-1">
          <Markdown content={chatMessage.content} />
          {chatMessage.data && (
            <ChatMessageData messageData={chatMessage.data} />
          )}
        </div>
        <div className="flex items-center  ">
          {chatMessage.role !== "user" && <Button onClick={() => uploadThisMessage()} variant="ghost" size="icon" > 
          {isLoading?<l-ring size={20} color="black" speed={1.6} stroke={1}></l-ring>:
          !chatMessage?.isSaved?
            <FilePlus2 size={20} />:<FileCheck2 size={20} />
          }
          </Button>}
          <Button
            onClick={() => copyToClipboard(chatMessage.content)}
            variant="ghost"
            size="icon"
            className=""
          >
            {isCopied ? <Check size={18} /> : <Copy size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
