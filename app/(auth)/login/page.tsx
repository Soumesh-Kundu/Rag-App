import LoginForm from "@/components/LoginForm";
import { getServerUser } from "@/lib/auth";
import { permanentRedirect } from "next/navigation";
export const dynamic = 'auto'
// insertData()
export default async function page() {
  const session=await getServerUser()
  if(session!==null){
    permanentRedirect('/')
  }
  return (
    <main className="grid place-items-center h-screen w-screen ">
      <LoginForm />
    </main>
  );
}
