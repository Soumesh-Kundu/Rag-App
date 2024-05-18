import SignInForm from "@/components/SignInForm";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";

export default async function page() {
  const cookieStore=cookies()
  if(cookieStore.get('authToken')!==undefined){
    permanentRedirect('/')
  }
  return (
    <main className='grid place-items-center h-screen w-screen '>
        <SignInForm />
    </main>
  )
}
