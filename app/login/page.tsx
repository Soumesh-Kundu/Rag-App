import LoginForm from "@/components/LoginForm";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";
import React from "react";

export default async function page() {
  const cookieStore=cookies()
  if(cookieStore.get('authToken')!==undefined){
    permanentRedirect('/')
  }
  return (
    <main className="grid place-items-center h-screen w-screen ">
      <LoginForm />
    </main>
  );
}
