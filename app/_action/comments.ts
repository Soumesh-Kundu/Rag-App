"use server"

import { getServerUser } from '@/lib/auth'
import { db } from '@/lib/db'
import {Comments} from '@prisma/client'

export async function addComment(comment: Omit<Comments, 'id'|'createdAt'|'userId'>)
{   
    const session= await getServerUser()
    if(!session){
        return {success:false,message:'not authenticated'}
    }
    try {
        const userId=parseInt(session.user.id)
        await db.comments.create({
            data:{
                ...comment,
                userId
            }
        })
        return {success:true,message:'comment added'}
    } catch (error) {
        console.log(error)
        return {success:false,message:'error adding comment'}
    }
}

export async function getComments(id:number){
    const session = await getServerUser()
    if(!session){
        return {success:false,comments:[]}
    }
    try {
        const comments = await db.comments.findMany({
            where:{
                messageId:id
            },
            select:{
                id:true,
                text:true,
                createdAt:true,
                user:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            }
        })
        return {success:true,comments}
    } catch (error) {
        console.log(error)
        return {success:false,comments:[]}
    }
}

export async function deleteComment(commentId:number){
    const session = await getServerUser()
    if(!session){
        return {success:false,message:'not authenticated'}
    }
    try {
        const userId=parseInt(session.user.id)
        await db.comments.delete({
            where:{
                id:commentId,
                userId
            }
        })
        return {success:true,message:'comment deleted'}
    } catch (error) {
        console.log(error)
        return {success:false,message:'error deleting comment'}
    }
}