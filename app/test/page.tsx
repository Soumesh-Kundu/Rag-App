import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export default async function page(){
    const sessions=await getServerSession(authOptions)
    console.log(sessions)
    return <>
    <div className="flex items-center content-center">
        hello world
    </div>
    </>
}