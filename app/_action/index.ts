"use server";

import { serverUser as server_user } from "@/lib/db/realm";
import { sign } from "jsonwebtoken";
import { sendMail } from "@/lib/db/mailer";
import { cookies, headers } from "next/headers";
import { config, pcRepo } from "@/lib/db/vectorDB";
type InviteBody = {
  email: string;
  origin: string;
  repoName: string;
  repoId: string;
  role: string;
};

export async function sendInvite(body: InviteBody) {
  const serverUser = await server_user();
  const db = serverUser.mongoClient("mongodb-atlas").db("private-gpt");
  console.log(body)
  try {
    const { email, repoName, repoId, role,origin } = body;
    const user = await db.collection("users").findOne({ email: email });
    if (!user) {
      return null;
    }
    const userId = user?.user_id as string;
    const token = sign(
      {
        userId,
        repoId,
      },
      (process.env.JWT_SECRET as string) ?? "secret"
    );
    const { insertedId } = await serverUser
      .mongoClient("mongodb-atlas")
      .db("private-gpt")
      .collection("tokens")
      .insertOne({ userId, repoId, role });
    const tokenId = insertedId.toString();
    const mailObject = {
      from:"Share invite <iamsoumo26@gmail.com>",
      to: email,  
      subject: "Invite to Repositry",
      body: `
        <p>You are invited to <strong>${repoName}</strong> Repositry as a ${role} <a href="${origin}/accept-invite?token=${token}&tokenId=${tokenId}">Click here</a> to accept invite</p>
        `,
    };
    await sendMail(mailObject);
    return true;
  } catch (error) {
    console.log(error)
    return null;
  }
}

export async function addUser(email: string, name: string) {
  const serverUser = await server_user();
  const collection = serverUser
    .mongoClient("mongodb-atlas")
    .db("private-gpt")
    .collection("users");
  await collection.insertOne({
    email,
    name,
  });
  console.log("user created");
}

export async function setCookie(token: string){
  const cookieStore=cookies()
  cookieStore.set('authToken',token)
}
export async function removeCookie(){
  const cookieStore=cookies()
  cookieStore.delete('authToken')
}

export async function deleteNameSpace(repoId:string){
  try {
    
    const index=pcRepo.index(config.indexName)
    const indexStats=await index.describeIndexStats()
    if(indexStats?.namespaces !== undefined  &&  indexStats?.namespaces[repoId]?.recordCount>0){
      await index.namespace(repoId).deleteAll()
      console.log(repoId + " namespace deleted")
      return
    }
    console.log("namspace not existed")
  } catch (error) {
    console.log(error)
  }
}