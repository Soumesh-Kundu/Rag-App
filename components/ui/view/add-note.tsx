"use client"
import React, { useState,useRef } from 'react'
import { Button } from '../button'
import { PencilLine } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Textarea } from '../textarea'
import { useRouter } from 'next/navigation'
import { PopoverClose } from '@radix-ui/react-popover'

export default function Addnote({id}:{id:string}) {
  const router=useRouter()
  const closeButtonRef=useRef<HTMLButtonElement>(null)
  const [comment,setComment]=useState<string>("")
  const [isLoading,setLoading]=useState<boolean>(false)
  async function addComment(){
    if(isLoading) return
    try {
      setLoading(true)
      const res=await fetch('/api/messages/comment/add',{
        method:"POST",
        body:JSON.stringify({
          comment,
          id
        })
      })
      if(res.ok){
        closeButtonRef?.current?.click()
        setComment("")
        router.refresh()
        setLoading(false)
        console.log('done')
      }
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }
  return (
    <Popover  >
        <PopoverTrigger asChild>
            <Button variant="outline" size="icon"> 
                <PencilLine size={18}/>
            </Button>
        </PopoverTrigger>
        <PopoverContent side='bottom' className='w-96 rounded-lg p-4 flex flex-col gap-2'>
            <Textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Add a note..."/>
            <Button onClick={()=>addComment()}>
              {isLoading?<l-ring size={20} stroke={1.3} speed={1.6} color="white"></l-ring>:"Add"}
            </Button>
            <PopoverClose className='hidden' ref={closeButtonRef}></PopoverClose>
        </PopoverContent>
    </Popover>
  )
}
