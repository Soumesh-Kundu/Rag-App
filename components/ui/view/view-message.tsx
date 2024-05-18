
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import ChatAvatar from "../chat/chat-avatar";
import Markdown from "../chat/markdown";
import Addnote from "./add-note";
import Comments from "./Comments";
import { MessageBody } from "@/components/view-section";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type ChatMessageExtraData = { score: number; text: string };

// This component will parse message data and render the appropriate UI.
function ViewMessageData({
  messageData,
}: {
  messageData: ChatMessageExtraData;
}) {
  const { score, text } = messageData;
  const percentageScore = (score * 100).toString().slice(0, 5);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="py-0.5 px-2 bg-slate-200 rounded-full text-sm">
          matched {percentageScore}%
        </button>
      </DialogTrigger>
      <DialogOverlay className="bg-black/5">
        <DialogContent
          key={text.slice(0, 35)}
          className="w-[calc(100%-2*8px)] sm:mx-0 rounded-lg sm:max-w-xl max-h-[calc(100dvh-2*25px)] flex flex-col gap-2 py-9 px-5 md:px-8 md:py-12   !bg-slate-100"
        >
          <div className="max-h-[calc(100%-3rem)] pr-1  overflow-y-auto rounded-xl  scrollbar">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Score: </span> {percentageScore}%
            </div>
            <div className="break-words ">
              <span className="font-semibold">Context: </span>
              <div className="pl-3">
                {text
                  .split("\n")
                  .filter((item) => item.trim().length)
                  .map((item, index) => {
                    const [key, ...text] = item
                      .split(":")
                      .filter((item) => item.trim().length);
                    const content = text.join(":");
                    return (
                      <>
                        <div className="pb-3" key={index}>
                          <span className="font-medium">{key}</span>: {content}
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
  );
}

type ChatMessageProps = {
  chatMessage: MessageBody;
  messageIndex:number,
  deleteMessage:(index:number)=>Promise<void>
  refreshMessages:()=>void,
  currentUserRole:"Editor" | "Commenter" | "Read-Only" | "Admin"
};

export default function ViewMessage({currentUserRole, chatMessage,messageIndex,deleteMessage,refreshMessages }: ChatMessageProps) {
  const [isLoading,setLoading]=useState<boolean>(false)
  async function handleClick(){
    if(isLoading) return
    setLoading(true)
    try {
      await deleteMessage(messageIndex)
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex items-start gap-2.5 sm:gap-4  sm:pr-5 pt-5">
      <ChatAvatar role={chatMessage.role} />
      <div className="group flex flex-1 justify-between gap-2 items-start">
        <div className="flex-1 space-y-4 pt-1">
          <Markdown content={chatMessage.content} />
          {chatMessage.data && (
            <div className="flex gap-2 flex-wrap  w-full items-center">
              {
                chatMessage.data.map((item: ChatMessageExtraData, index: number) =>
                  <ViewMessageData key={item.text.slice(0, 35)+item.score} messageData={item} />
                )
              }
            </div>
          )}
        </div>
        {chatMessage.role.toLowerCase() !== "user" && (
          <div className="flex items-center gap-2.5 ">
            <Comments comments={chatMessage.comments} />
            <Addnote id={chatMessage.id} refreshMessages={refreshMessages}/>
            {currentUserRole!=="Commenter" && <Button onClick={handleClick} variant="outline" size="icon">
              {isLoading ? <l-ring size={18} color="red" stroke={1.2}></l-ring>:
              <Trash2 size={18} color="red" />}
            </Button>}
          </div>
        )}
      </div>
    </div>
  );
}
