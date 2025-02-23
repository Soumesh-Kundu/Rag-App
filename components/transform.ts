import { JSONValue, Message } from "ai";

export interface TransformedMessage extends Message {
  data?: JSONValue;
  isSaved?:boolean
}

export const isValidMessageData = (rawData: JSONValue | undefined) => {
  if (!rawData || typeof rawData !== "object") return false;
  if (Object.keys(rawData).length === 0) return false;
  return true;
};

export const insertDataIntoMessages = (
  messages: (Message & {isSaved?:boolean})[],
  data: JSONValue[] | undefined,
  isSaved:boolean,
  initMessage:Message
):TransformedMessage[] => {
  if (messages.length<1) return [initMessage];
  if (!data) return messages;
  let index=0
  if(messages.length<1) return messages
  if(messages.at(-1)?.role==='assistant'){
    messages[messages.length-1].data=data.at(-1)
    messages[messages.length-1].isSaved=isSaved
  }
  else{
    messages[messages.length-1].data={result:[]}
    messages[messages.length-1].isSaved=isSaved
  }
  return messages;
};
