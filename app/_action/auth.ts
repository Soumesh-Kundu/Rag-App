"use server";
import { headers } from "next/headers";
import { users,tokens } from "@/lib/db/schema";
import { db } from "@/lib/db";
import {sign,verify} from "jsonwebtoken"
import { sendMail } from "@/lib/mailer";
import { eq } from "drizzle-orm";

type Usercreds=Omit<typeof users.$inferInsert, "id" | "verified" |"image">
type Token=typeof tokens.$inferInsert

export async function registerUser(creds:Usercreds) {
    try {
        const hostname=(await headers()).get("host")
        const [res]=await db.insert(users).values({...creds}).returning({id:users.id,email:users.email})
        const token: Token ={
            userid:res.id,
            expiresIn:Date.now()+1000*60*15,
            type:"verfiy"
        }
        const [newToken]=await db.insert(tokens).values(token).returning({id:tokens.id,userid:tokens.userid})
        const tokenId=sign(newToken.id.toString(),process.env.JWT_SECRET!)
        const tokenObj=sign(newToken,process.env.JWT_SECRET!)
        const mailObj={
            to:creds.email,
            from:"Account Verfication <imsoumo26@gmail.com>",
            subject:"Account Verification for New User at Rag APP",
            body:`<p>Click <a href="${hostname}/verify?tokenId=${tokenId}&token=${tokenObj}">here</a> to verify your account at Rag App</p>`
        }
        await sendMail(mailObj)
    }
    catch(error){
        console.log(error)
        throw new Error("Error in registering user")
    }
}

export async function verifyUser(TokenId:string,tokenHash:string){
    try{
        const tokenObj=verify(tokenHash,process.env.JWT_SECRET!) as {id:number,userid:number}
        const tokenId=parseInt(verify(TokenId,process.env.JWT_SECRET!) as string)
        const token=await db.query.tokens.findFirst({where:eq(tokens.id,tokenId)})
        if(!token || token.id!==tokenObj.id || token.id!==tokenId || token.type!=="verfiy"){
            throw new Error("Invalid Token")
        }
        if(token.expiresIn<Date.now()){
            throw new Error("Token Expired")
        }
        await db.transaction(async (tx)=>{
            await tx.update(users).set({verified:true}).where(eq(users.id,token.userid))
            await tx.delete(tokens).where(eq(tokens.id,token.id))
        })
        return true
    }
    catch(error){
        console.log(error)
        throw new Error("Error in verifying user")
    }
}