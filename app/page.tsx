import { Folders } from "lucide-react";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";
export default async function Home() {
  const cookieStore=await cookies()
  if(cookieStore.get('authToken')===undefined){
    permanentRedirect('/login')
  }
 return (
    <main className="w-full grid place-items-center">
      <div className="space-y-4 max-w-7xl w-full scrollbar px-2 lg:px-0 grid place-items-center">
        <div className="w-[calc(100%-16px)] md:w-1/3 lg:w-5/12 rounded-xl bg-white p-4 shadow-xl pb-0">
          <div className="flex p-10 scrollbar  flex-col items-center w-full  gap-10 overflow-y-auto  text-gray-500 justify-center">
            <Folders size={90} strokeWidth={0.9}/>
            <span className="font-medium ">Please Select a Repo to Continue.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
