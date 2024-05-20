import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const inboxConfig = new Map([
  [
    "gmail",
    {
      indexName: process.env.NEXT_PUBLIC_PINECONE_GMAIL_INDEX_NAME as string,
      namespace: process.env.NEXT_PUBLIC_PINECONE_GMAIL_NAMESPACE,
      threadID: "663657d1e96fbf822661f17e",
    },
  ],
  [
    "hotmail",
    {
      indexName: process.env.NEXT_PUBLIC_PINECONE_HOTMAIL_INDEX_NAME as string,
      namespace: process.env.NEXT_PUBLIC_PINECONE_HOTMAIL_NAMESPACE,
      threadID: "663657d1e96fbf822661f17f",
    },
  ],
  [
    "zoho",
    {
      indexName: process.env.NEXT_PUBLIC_PINECONE_ZOHO_INDEX_NAME as string,
      namespace: process.env.NEXT_PUBLIC_PINECONE_ZOHO_NAMESPACE,
      threadID: "66326e94b1c1156c4c78992b",
    },
  ],
]);