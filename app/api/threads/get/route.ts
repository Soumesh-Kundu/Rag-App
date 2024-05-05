import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prismaDB";
export async function GET(request:NextRequest) {
    try {
        const data=await db.threads.findMany()
        return NextResponse.json({threads:data,success:true},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"internal Server Error"},{status:500})
    }
}