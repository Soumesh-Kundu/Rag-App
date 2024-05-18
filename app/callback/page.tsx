"use client";

import { MongoRealm } from "@/lib/db/realm";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {

  useEffect(()=>{
    MongoRealm.handleAuthRedirect()
  },[])
  return (
    <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-10 items-center">
      <l-dot-wave size={60} color="rgb(139, 92, 246)" ></l-dot-wave>
      <p className="text-gray-500 font-semibold">
        Please wait...
      </p>
    </div>
  );
}
