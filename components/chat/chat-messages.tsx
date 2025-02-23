import { Loader2, MessageSquare, MessagesSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import ChatActions from "./chat-actions";
import ChatMessage from "./chat-message";
import { ChatHandler } from "./chat.interface";
import { useParams } from "next/navigation";
import { addMessage } from "@/app/_action/messages";
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
  const messages = useMemo(() => {
    return props.messages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.messages, isUpdated]);
  const isLastMessageFromAssistant =
    messageLength > 0 && lastMessage?.role !== "user";
  const showReload =
    props.reload && !props.isLoading && isLastMessageFromAssistant;
  const showStop = props.stop && props.isLoading;

  // `isPending` indicate
  // that stream response is not yet received from the server,
  // so we show a loading indicator to give a better UX.
  const isPending = props.isLoading && !isLastMessageFromAssistant;
  const params = useParams();
  useEffect(() => {
    scrollToBottom();
  }, [messageLength, lastMessage]);
  async function saveCurrentRepsponse(index: number) {
    try {
      if (props.messages[index].isSaved) return;
      const currentMessages = props.messages.slice(index - 1, index + 1);
      props.messages[index].isSaved = true;
      const message = currentMessages.map((item) => ({
        role: item?.role,
        content: item?.content,
        threadId: params.id as string,
        data: (item?.data as { result: { score: number; text: string }[] })
          ?.result,
      }));
      const { success } = await addMessage(message);
      if (success) {
        props.messages[index].isSaved = true;
      }
    } catch (error) {
      console.log(error);
    }
    setIsUpdated((prev) => !prev);
  }
  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-xl pb-0">
      <div
        className="flex h-[55dvh] scrollbar pr-1 flex-col gap-5 divide-y overflow-y-auto pb-4"
        ref={scrollableChatContainerRef}
      >
        {messages.length > 0 ? (
          <>
            {messages.map((m, index) => (
              <ChatMessage
                key={m.id}
                chatMessage={m}
                messageIndex={index}
                saveResponse={saveCurrentRepsponse}
              />
            ))}
            {isPending && (
              <div className="flex justify-center items-center pt-10">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center items-center h-full text-gray-400 flex-col">
              <MessagesSquare size={84} strokeWidth={1}/>
              <p className="">DocGPT is here to assist you.</p>
              <p>Ask with <strong><code>/doc</code></strong> to get answers from your documents!</p>
            </div>
          </>
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
