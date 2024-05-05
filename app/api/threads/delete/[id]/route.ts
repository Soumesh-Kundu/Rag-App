import db from "@/lib/db/prismaDB";
import { deleteDocIndex } from "@/lib/db/vectorDB";
import { NextRequest, NextResponse } from "next/server";
type APIParams={
    params:{
        id:string
    }
}
export async function DELETE(request:NextRequest,{params}:APIParams){
    const id=params.id
    try {
        const PrismaTranscation=db.$transaction([
            db.threads.delete({
                where:{
                    id:id
                }
            }),
            db.messages.deleteMany({
                where:{
                    threadID:id
                }
            })
        ])
        const indexDeletePromise=deleteDocIndex(id,true)
        await Promise.all([PrismaTranscation,indexDeletePromise])
        return NextResponse.json({message:"thread deleted"},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"internal Server Error"},{status:500})
    }
}