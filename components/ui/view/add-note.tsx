"use client"
import React, { useState,useRef } from 'react'
import { Button } from '../button'
import { PencilLine } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Textarea } from '../textarea'
import { useRouter } from 'next/navigation'
import { PopoverClose } from '@radix-ui/react-popover'
import { app } from '@/lib/db/realm'

export default function Addnote({id,refreshMessages}:{id:string,refreshMessages:()=>void}) {
  const closeButtonRef=useRef<HTMLButtonElement>(null)
  const [comment,setComment]=useState<string>("")
  const [isLoading,setLoading]=useState<boolean>(false)
  async function addComment(){
    if(isLoading) return
    const collection=app.currentUser?.mongoClient('mongodb-atlas').db('private-gpt').collection('messages')
    try {
      setLoading(true)
      await collection?.updateOne({
        _id:{$oid:id}
      },{
        $push:{
          comments:{
            text:comment,
            name:app.currentUser?.customData?.name,
            createdAt:new Date().toISOString()
          }
        }
      })
        closeButtonRef?.current?.click()
        refreshMessages()
        setComment("")
        console.log('done')
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
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
