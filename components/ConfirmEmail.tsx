"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "./Loader";
import { useEffect, useState } from "react";
import { realmConfirmUser } from "@/lib/db/realm";
import { CheckCircle2 } from "lucide-react";
import { UI_colors } from "@/color.config";

export default function ConfirmEmail() {
  const searchParams = useSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(true);
  const router=useRouter()
  async function confirmUser(){
      const token=searchParams.get("token") as string;
      const tokenId=searchParams.get("tokenId") as string;
      try {
        const user=await realmConfirmUser({token,tokenId});
        if(!user){
          console.log("error")
          return
        }
        setIsConfirmed(true);
        setTimeout(()=>{
          router.replace('/login')
        },3000)
      } catch (error) {
        console.log(error)
      }
  }
  useEffect(() => {
    confirmUser();
  }, []);
  return (
    <>
      {!isConfirmed?<div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-10 items-center">
        <Loader size={40} stroke={2.3} color={UI_colors[500]} />
        <p className="text-gray-500 font-semibold">
          Confirming Email please wait...
        </p>
      </div>:
     <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-[calc(100%-16px)] sm:w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
     <CheckCircle2
       size={40}
       strokeWidth={1.9}
       className="text-ui-500"
     />
     <p className="text-gray-500 font-semibold">
       Confirmation Successful. Redirecting to Login...
     </p>
   </div>
      }
    </>
  );
}
