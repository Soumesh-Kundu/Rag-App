import { MessageCircle, User2 } from "lucide-react";
import { Button } from "../button";
import { Separator } from "../separator";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";

export default function Comments({ comments }: { comments: string[] }) {
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
                  <div className="h-8 w-8 flex items-center justify-center border-2 rounded-lg">
                    <User2 size={16} />
                  </div>
                  <span className="text-gray-900 font-medium  break-words max-w-md">
                    {item}
                  </span>
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
