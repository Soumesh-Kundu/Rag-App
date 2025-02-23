"use server";
import { ChatRole, Messages, Prisma } from "@prisma/client";
import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { JsonValue } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

interface CMessages {
  role: "data" | "system" | "user" | "assistant";
  content: string;
  data?: JsonValue;
  threadId: string;
}
const ChatRoleMap = new Map(Object.entries(ChatRole));
export async function addMessage(messages: CMessages[]) {
  // add message to the database
  // return the message
  const session = await getServerUser();
  if (!session) {
    return { success: false, message: "not authenticated" };
  }
  try {
    const repo = await db.repos.findFirst({
      where: {
        nameSpace: messages[0].threadId,
      },
      select: {
        id: true,
      },
    });
    if (!repo) return { success: false, message: "repo not found" };
    const threadId = repo.id;
    await db.messages.createMany({
      data: messages.map((message) => ({
        role: ChatRoleMap.get(message.role) as ChatRole,
        content: message.content,
        data: message.data ? message.data : undefined,
        threadId: threadId,
      })),
    });
    return { success: true, message: "message added" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "error adding message" };
  }
}

export async function getMessages(id: string) {
  const session = await getServerUser();
  if (!session) {
    return { success: false, messages: [] };
  }
  try {
    const messages = await db.messages.findMany({
      where: {
        repo: {
          nameSpace: id,
        },
      },
      include:{comments:{select:{id:true,text:true,createdAt:true,user:{select:{id:true,name:true}}}}}
    });
    return { success: true, messages };
  } catch (error) {
    console.log(error);
    return { success: false, messages: [] };
  }
}

export async function deleteMessage(ids:number[]){
  const session = await getServerUser();
  if (!session) {
    return { success: false, message: "not authenticated" };
  }
  try {
    await db.messages.deleteMany({
      where:{
        id:{
          in:ids
        }
      }
    })
    revalidatePath("/[id]/history",'page')
    return { success: true, message: "message deleted" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "error deleting message" };
  }

}