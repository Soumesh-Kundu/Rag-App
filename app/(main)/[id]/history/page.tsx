import { getMessages } from "@/app/_action/messages";
import ViewSection from "@/components/view-section";
import { getServerUser } from "@/lib/auth";
import { permanentRedirect } from "next/navigation";
export const dynamic='force-dynamic'

export default async function History({params}:{params:Promise<{id:string}>}) {
  const session= await getServerUser()
  if(!session){
    return permanentRedirect('/login')
  }
  const dyn_params=await params
  const {messages}=await getMessages(dyn_params.id)
  return (
    <main className="w-full grid place-items-center">
      <ViewSection messages={messages} />
    </main>
  );
}
