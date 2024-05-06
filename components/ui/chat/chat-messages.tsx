import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import ChatActions from "./chat-actions";
import ChatMessage from "./chat-message";
import { ChatHandler } from "./chat.interface";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useParams } from "next/navigation";

export default function ChatMessages(
  props: Pick<ChatHandler, "messages" | "isLoading" | "reload" | "stop">
) {
  const scrollableChatContainerRef = useRef<HTMLDivElement>(null);
  const messageLength = props.messages.length;
  const lastMessage = props.messages[messageLength - 1];
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const scrollToBottom = () => {
    if (scrollableChatContainerRef.current) {
      scrollableChatContainerRef.current.scrollTop =
        scrollableChatContainerRef.current.scrollHeight;
    }
  };
  const messages=useMemo(()=>{
    return props.messages
  },[props.messages,isUpdated])
  const isLastMessageFromAssistant =
    messageLength > 0 && lastMessage?.role !== "user";
  const showReload =
    props.reload && !props.isLoading && isLastMessageFromAssistant;
  const showStop = props.stop && props.isLoading;

  // `isPending` indicate
  // that stream response is not yet received from the server,
  // so we show a loading indicator to give a better UX.
  const isPending = props.isLoading && !isLastMessageFromAssistant;
  const params=useParams()
  useEffect(() => {
    scrollToBottom();
  }, [messageLength, lastMessage]);
  async function saveCurrentRepsponse(index:number){
    if(props.messages[index].isSaved) return
    const currentMessages=props.messages.slice(index-1,index+1)
    props.messages[index].isSaved=true
    const message = currentMessages.map((item) => ({
      role: item?.role.toUpperCase() as string,
      content: item?.content,
      createdAt: item?.createdAt,
      data: (item?.data as { result: { score: number; text: string }[] })
        ?.result,
    }));
    console.log(message);
    const res = await fetch("/api/messages/add", {
      method: "POST",
      body: JSON.stringify({
        messages: message,
        threadID: params.id,
      }),
    });
    if (res.ok) {
      props.messages[index].isSaved=true
      setIsUpdated(prev=>!prev)
      console.log("updated");
    }
  }
  return (
      <div className="w-full rounded-xl bg-white p-4 shadow-xl pb-0">
        <div
          className="flex h-[50vh] scrollbar pr-1 flex-col gap-5 divide-y overflow-y-auto pb-4"
          ref={scrollableChatContainerRef}
        >
          {messages.map((m,index) => (
            <ChatMessage key={m.id} chatMessage={m} messageIndex={index} saveResponse={saveCurrentRepsponse} />
          ))}
          {isPending && (
            <div className="flex justify-center items-center pt-10">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex justify-end py-4">
          <ChatActions
            reload={props.reload}
            stop={props.stop}
            showReload={showReload}
            showStop={showStop}
          />
        </div>
      </div>
  );
}
