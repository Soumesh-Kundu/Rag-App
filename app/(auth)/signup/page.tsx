import SignInForm from "@/components/SignInForm";
import { getServerUser } from "@/lib/auth";
import { permanentRedirect } from "next/navigation";

export default async function page() {
  const session=await getServerUser()
  if(session!==null){
    permanentRedirect('/')
  }
  return (
    <main className='grid place-items-center h-screen w-screen '>
        <SignInForm />
    </main>
  )
}
