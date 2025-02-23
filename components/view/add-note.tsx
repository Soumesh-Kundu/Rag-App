"use client"
import React, { useState,useRef } from 'react'
import { Button } from '../ui/button'
import { PencilLine } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Textarea } from '../ui/textarea'
import { PopoverClose } from '@radix-ui/react-popover'
import { addComment } from '@/app/_action/comments'
import Ring from '../Loaders/Ring'

export default function Addnote({id,refreshComments}:{id:number,refreshComments:()=>void}) {
  const closeButtonRef=useRef<HTMLButtonElement>(null)
  const [comment,setComment]=useState<string>("")
  const [isLoading,setLoading]=useState<boolean>(false)
  async function uploadComment(){
    if(isLoading) return
    try {
      setLoading(true)
      await addComment({
        text:comment,
        messageId:id
      })
      refreshComments()
      setComment("")
    } catch (error) {
      console.log(error)
    }
    closeButtonRef.current?.click()
    setLoading(false)
  }
  return (
    <Popover  >
        <PopoverTrigger asChild>
            <Button variant="outline" size="icon"> 
                <PencilLine size={18}/>
            </Button>
        </PopoverTrigger>
        <PopoverContent side='bottom' className=' sm:w-96 rounded-lg p-4 flex flex-col gap-2 mr-2'>
            <Textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Add a note..."/>
            <Button onClick={()=>uploadComment()} className="!bg-ui-600">
              {isLoading?<Ring size={20} stroke={1.3} speed={1.6} color="white"></Ring>:"Add"}
            </Button>
            <PopoverClose className='hidden' ref={closeButtonRef}></PopoverClose>
        </PopoverContent>
    </Popover>
  )
}
