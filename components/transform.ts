import { JSONValue, Message } from "ai";

export const isValidMessageData = (rawData: JSONValue | undefined) => {
  if (!rawData || typeof rawData !== "object") return false;
  if (Object.keys(rawData).length === 0) return false;
  return true;
};

export const insertDataIntoMessages = (
  messages: (Message & {isSaved?:boolean})[],
  data: JSONValue[] | undefined,
  isSaved:boolean
) => {
  if (!data) return messages;
  let index=0
  // messages.forEach((message, i) => {
  //   const rawData = data[index];
  //   if (isValidMessageData(rawData) && message.role!=='user'){
  //     message.data = rawData;
  //     index++
  //   } 
  //   else{
  //     message.data={result:[]}
  //   }
  // });
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
