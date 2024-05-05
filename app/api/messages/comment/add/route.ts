import db from "@/lib/db/prismaDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        const {id,comment}=await request.json()
        await db.messages.update({
            where:{
                id
            },
            data:{
                comments:{
                    push:comment
                }
            }
        })
        return NextResponse.json({message:"success"})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message:"error"},{status:500})
    }
}