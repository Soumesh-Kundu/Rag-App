"use server";
import { headers } from "next/headers";
import {db }from "@/lib/db";
import { TokenType } from "@prisma/client";
import { sign, verify } from "jsonwebtoken";
import { sendMail } from "@/lib/mailer";
import { hash } from "bcrypt";

type Usercreds = {
  name: string;
  email: string;
  password?: string;
};
type Token ={
  userid:number,
  expiresIn:string,
  type:TokenType
};

export async function registerUser(creds: Usercreds) {
  try {
    const hostname = (await headers()).get("host");
    const user = {
      name: creds.name,
      email: creds.email,
      password: "",
    };
    const hashPashword = await hash(creds.password!, 10);
    user.password = hashPashword;
    const res = await db.users.create({ data: user,select:{id:true,email:true} });
    const token: Token = {
      userid: res.id,
      expiresIn: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      type: TokenType.verify,
    };
    console.log(token,new Date(token.expiresIn).toLocaleString())
    const newToken = await db.tokens.create({data:token,select:{id:true,userid:true}});
    const tokenId = sign(newToken.id.toString(), process.env.NEXT_JWT_SECRET!);
    const tokenObj = sign(newToken, process.env.NEXT_JWT_SECRET!);
    const mailObj = {
      to: creds.email,
      from: "Account Verfication <noreply.geemble@gmail.com>",
      subject: "Account Verification for New User at Rag APP",
      body: `<p>Click <a href="${process.env.NEXT_ORIGIN}/verify?tokenId=${tokenId}&token=${tokenObj}">here</a> to verify your account at Rag App</p>`,
    };
    console.log(mailObj);
    sendMail(mailObj).then((res) => {
      console.log(res);
    });
    return true;
  } catch (error) {
    console.log(error);
    throw new Error("Error in registering user");
  }
}

export async function verifyUser(TokenId: string, tokenHash: string) {
  const response = { verified: false, message: "" };
  try {
    const tokenObj = verify(tokenHash, process.env.NEXT_JWT_SECRET!) as {
      id: number;
      userid: number;
    };
    const tokenId = parseInt(
      verify(TokenId, process.env.NEXT_JWT_SECRET!) as string
    );
    const token = await db.tokens.findFirst({ where: { id: tokenId } });
    console.log({token,tokenId,tokenObj})
    if (
      !token ||
      token.id !== tokenObj.id ||
      token.id !== tokenId ||
      token.type !== TokenType.verify
    ) {
        response.message = "Invalid Token";
        return response
    }
    const expiresIn = token.expiresIn.getTime();
    console.log(expiresIn, Date.now());
    console.log(new Date(token.expiresIn).toLocaleString())
    if (expiresIn < Date.now()) {
      console.log("expired")
      await db.$transaction([
        db.tokens.delete({where:{id:token.id}}),
        db.users.delete({where:{id:tokenObj.userid}})
      ])
      response.message = "Token Expired 2";
      return response;
    }
    console.log("transaction started");
    await db.$transaction([
      db.tokens.delete({where:{id:token.id}}),
      db.users.update({where:{id:tokenObj.userid},data:{verified:true}})
    ])
    console.log("transaction done");
    response.verified = true;
    response.message = "Verification Successful";
  } catch (error) {
    if(error instanceof Error){
      console.log(error.stack);
    }
    else{
      console.log(error)
    }
    response.message = "Error in verifying user";
  }
  return response;
}
