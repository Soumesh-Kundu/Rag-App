import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prismaDB";
export async function DELETE(request:NextRequest) {
    try {
        const {ids }:{ids:string[]}=await request.json()
        const data=await db.messages.deleteMany({
            where:{
                id:{
                    in:ids
                }
            }
        })
        return NextResponse.json({messages:"messages upserted"},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"internal Server Error"},{status:500})
    }
}