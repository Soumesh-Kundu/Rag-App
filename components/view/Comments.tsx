import { MessageCircle, Trash2, User2 } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useThreads } from "@/components/Wrapper";
import { customComments } from "@/components/view-section";
import { useEffect, useRef, useState } from "react";
import { deleteComment } from "@/app/_action/comments";
import Ring from "../Loaders/Ring";

const currentGetDate = new Date();
export default function Comments({
  comments,
  refreshComments
}: {
  comments: customComments[];
  refreshComments: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState<number[]>([]);
  const {currentUser}=useThreads()
  const boxCloseRef=useRef<HTMLButtonElement | null>(null)
  function getFormattedDate(createdAt: Date) {
    const date = createdAt;
    const now=new Date()
    const diffDays = now.getDate() - date.getDate();
    const diffMonths = now.getMonth() - date.getMonth();
    const diffYears = now.getFullYear() - date.getFullYear();
    const time = date.toTimeString();
    if (diffDays === 0 && diffMonths === 0 && diffYears === 0) {
      return "today • " + time.slice(0, 5);
    }
    if (diffDays === 1 && diffMonths === 0 && diffYears === 0) {
      return "yesterday";
    }
    if (diffDays > 1 && diffMonths === 0 && diffYears === 0) {
      return (
        date.toDateString().split(" ")[0] +
        ", " +
        date.toDateString().split(" ").slice(1, 3).join(" ") +
        " • " +
        time.slice(0, 5)
      );
    }

    if (diffYears > 0) {
      return (
        date.toDateString().split(" ")[0] +
        ", " +
        date.toDateString().split(" ").slice(1, 4).join(" ") +
        " • " +
        time.slice(0, 5)
      );
    }
  }

  async function deleteUserComment(id: number) {
    if(isDeleting.includes(id)) return
    setIsDeleting((prev)=>[...prev,id])
    try {
      await deleteComment(id)
      await refreshComments()
    } catch (error) {
      console.log(error)
    }
    setIsDeleting(prev=>prev.filter((item)=>item!==id))
  }

  useEffect(()=>{
    if(comments.length===0){
      boxCloseRef.current?.click()
    }
  },[comments])
  return (
    <Dialog>
      <DialogTrigger disabled={comments.length === 0} asChild>
        <Button size="icon" variant="outline" className="relative h-9 w-9">
          <span className="absolute -right-2 -top-2 rounded-full h-5 w-5 text-white bg-red-500">
            {comments.length}
          </span>
          <MessageCircle size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className=" p-4 rounded-lg max-w-xl pb-5 ">
        <span className="font-semibold ">Comments:</span>
        <DialogTitle className="hidden">Comments</DialogTitle>
        <Separator className="w-full mt-1 mb-2" />
        <div className="pl-3 flex flex-col max-h-[50vh] overflow-y-auto scrollbar">
          {comments.map((item, index) => (
              <div
                key={item.id}
                className=" divide-y divide-gray-200 list-disc  flex flex-col items-center"
              >
                <div className="flex items-start w-full gap-3">
                  <div className="h-8 w-8 flex items-center justify-center border-2 rounded-lg mt-3">
                    <User2 size={16} />
                  </div>
                  <div className="text-gray-900 font-medium  break-words max-w-md flex-grow">
                    <div>
                      <span className="font-bold">{item.user.name}</span>
                      <span className="text-gray-500 ml-2">
                        • {getFormattedDate(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <p>{item.text}</p>
                    </div>
                  </div>
                  {(currentUser && parseInt(currentUser.user.id)===item.user.id) && <Button variant="outline" disabled={isDeleting.includes(item.id)} onClick={()=>{deleteUserComment(item.id)}} className="self-end p-1.5">
                    {isDeleting.includes(item.id)?<Ring size={18} color="red" stroke={1.2}></Ring>: <Trash2 size={20} className="text-red-500" />}
                  </Button>}
                </div>
                {index + 1 !== comments.length && (
                  <Separator className="w-11/12 my-3" />
                )}
              </div>
          ))}
        </div>
        <DialogClose ref={boxCloseRef} className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
