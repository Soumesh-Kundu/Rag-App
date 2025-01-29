import { verifyUser } from '@/app/_action/auth';
import ConfirmEmail from '@/components/ConfirmEmail'
import { permanentRedirect } from 'next/navigation'
import React from 'react'

export default async function page(
  props: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  if(searchParams?.token === undefined || searchParams?.tokenId === undefined){
    permanentRedirect("/login")
  }
  
  console.log(searchParams)
  // const res={verified:false,message:""}
  const  res=await verifyUser(searchParams.tokenId as string,searchParams.token as string)
  return (
    <ConfirmEmail verified={res.verified} message={res.message}/>
  )
}
