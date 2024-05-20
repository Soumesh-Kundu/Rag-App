import { MessageCircle, User2 } from "lucide-react";
import { Button } from "../button";
import { Separator } from "../separator";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";

const currentGetDate = new Date();
export default function Comments({
  comments,
}: {
  comments: { text: string; name: string; createdAt: string }[];
}) {
  function getFormattedDate(createdAt: string) {
    const date = new Date(createdAt);
    const diffDays = new Date().getDate() - date.getDate();
    const diffMonths = new Date().getMonth() - date.getMonth();
    const diffYears = new Date().getFullYear() - date.getFullYear();
    const time=date.toTimeString();
    if (diffDays === 0 && diffMonths === 0 && diffYears === 0) {
      return "today • "+time.slice(0,5);
    }
    if(diffDays===1 && diffMonths===0 && diffYears===0){
      return "yesterday"
    }
    if(diffDays>1 && diffMonths===0 && diffYears===0){
      return date.toDateString().split(" ")[0]+', ' + date.toDateString().split(" ").slice(1,3).join(" ")+' • ' +time.slice(0,5)
    }

    if(diffYears>0){
      return date.toDateString().split(" ")[0]+', ' + date.toDateString().split(" ").slice(1,4).join(" ")+' • ' +time.slice(0,5)
    }
  }
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
        <Separator className="w-full mt-1 mb-2" />
        <div className="pl-3 flex flex-col max-h-[50vh] overflow-y-auto scrollbar">
          {comments.map((item, index) => (
            <>
              <div className=" divide-y divide-gray-200 list-disc  flex flex-col items-center">
                <div className="flex items-start w-full gap-3">
                  <div className="h-8 w-8 flex items-center justify-center border-2 rounded-lg mt-3">
                    <User2 size={16} />
                  </div>
                  <div className="text-gray-900 font-medium  break-words max-w-md">
                    <div>
                      <span className="font-bold">{item.name}</span>
                      <span className="text-gray-500 ml-2">• {getFormattedDate(item.createdAt)}</span>
                    </div>
                    <p>{item.text}</p>
                  </div>
                </div>
                {index + 1 !== comments.length && (
                  <Separator className="w-11/12 my-3" />
                )}
              </div>
            </>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
