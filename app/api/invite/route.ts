import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { serverUser as server_user } from "@/lib/db/realm";
import { sendMail } from "@/lib/db/mailer";
export async function POST(request: NextRequest) {
  try {
    const serverUser = await server_user();

    const { email, userId, repoName, repoId, role } = await request.json();
    const token = sign(
      {
        userId,
        repoId,
      },
      process.env.JWT_SECRET as string
    );
    const { insertedId } = await serverUser
      .mongoClient("mongodb-atlas")
      .db("private-gpt")
      .collection("tokens")
      .insertOne({ userId, repoId, role });
    const tokenId = insertedId.toString();
    const mailObject = {
      to: email,
      from:"Share Invite <iamsoumo26@gmail.com>",
      subject: "Invite to Repositry",
      body: `
        <p>You are invited to ${repoName} Repositry as a ${role} <a href="${request.nextUrl.origin}/accept-invite?token=${token}&tokenId=${tokenId}">Click here</a> to accept invite</p>
        `,
    };
    await sendMail(mailObject);
    return NextResponse.json({message:"Invite sent"});
  } catch (error) {
    return NextResponse.json({message:"error"},{status:500});
  }
}
