import LoginForm from "@/components/LoginForm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
export const dynamic = 'auto'
async function insertData(){
  try{
    // const res=await db.select().from(users).limit(1).where(eq(users.email,"test12@gmail.com"))
    const res=await db.query.users.findFirst({where:eq(users.email,"test@gmail.com")})
    console.log("data inserted",res)
  }
  catch(error){
    console.log("data not inserted",error)
  }
}

// insertData()
export default async function page() {
  return (
    <main className="grid place-items-center h-screen w-screen ">
      <LoginForm />
    </main>
  );
}
