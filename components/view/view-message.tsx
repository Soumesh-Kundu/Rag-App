import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import ChatAvatar from "../chat/chat-avatar";
import Markdown from "../chat/markdown";
import Addnote from "./add-note";
import Comments from "./Comments";
import { Trash2 } from "lucide-react";
import { Messages, Role } from "@prisma/client";
import { customComments } from "@/components/view-section";
import { getComments } from "@/app/_action/comments";
import Ring from "../Loaders/Ring";

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
      <DialogTitle className="hidden">Something</DialogTitle>
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
                      <div className="pb-3" key={index}>
                        <span className="font-medium">{key}</span>: {content}
                      </div>
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
  chatMessage: Messages & { comments: customComments[] };
  prevMessageId: number;
  deleteMessage: (id: number[]) => Promise<void>;
  refreshMessages: () => void;
  currentUserRole: Role | undefined;
};

export default function ViewMessage({
  currentUserRole,
  chatMessage,
  prevMessageId,
  deleteMessage,
}: ChatMessageProps) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState(chatMessage.comments);
  async function handleClick() {
    if (isLoading) return;
    setLoading(true);
    try {
      await deleteMessage([chatMessage.id, prevMessageId]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  async function refreshComments() {
    await getMessageComments();
  }
  async function getMessageComments() {
    try {
      const { comments } = await getComments(chatMessage.id);
      setComments(comments);
    } catch (error) {
      console.log(error);
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
              {(chatMessage.data as ChatMessageExtraData[]).map(
                (item: ChatMessageExtraData, index: number) => (
                  <ViewMessageData
                    key={item.text.slice(0, 35) + index * 200}
                    messageData={item}
                  />
                )
              )}
            </div>
          )}
        </div>
        {chatMessage.role.toLowerCase() !== "user" && (
          <div className="flex flex-col sm:flex-row items-center gap-2.5 ">
            <Comments comments={comments} refreshComments={refreshComments} />
            <Addnote id={chatMessage.id} refreshComments={refreshComments} />
            {currentUserRole !== Role.commentor && (
              <Button onClick={handleClick} variant="outline" size="icon">
                {isLoading ? (
                  <Ring size={18} color="red" stroke={1.2}></Ring>
                ) : (
                  <Trash2 size={18} color="red" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
