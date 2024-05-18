import ConfirmEmail from '@/components/ConfirmEmail'
import { permanentRedirect } from 'next/navigation'
import React from 'react'

export default function page({
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  if(searchParams?.token === undefined || searchParams?.tokenId === undefined){
    permanentRedirect("/login")
  }
  return (
    <ConfirmEmail />
  )
}
