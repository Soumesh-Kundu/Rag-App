"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "./Loader";
import { useEffect, useState } from "react";
import { realmConfirmUser } from "@/lib/db/realm";
import { CheckCircle2 } from "lucide-react";
import { UI_colors } from "@/color.config";
import { Button } from "./ui/button";

type Props = {
  verified: boolean;
  message: string;
};
export default function ConfirmEmail({ verified, message }: Props) {
  const [isConfirmed, setIsConfirmed] = useState(verified);
  const router=useRouter()
  return (
    <>
      {!isConfirmed ? (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-10 items-center">
          <Loader size={40} stroke={2.3} color={UI_colors[500]} />
          <p className="text-gray-500 font-semibold">{message}</p>
        </div>
      ) : (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-[calc(100%-16px)] sm:w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
          <CheckCircle2 size={40} strokeWidth={1.9} className="text-ui-500" />
          <p className="text-gray-500 font-semibold">
            Confirmation Successful.
          </p>
          <Button className="!bg-ui-500 text-white" onClick={()=>{router.replace('/login')}}>Login</Button>
        </div>
      )}
    </>
  );
}
