import React from "react";
import ShareRepo from "./share-repo";
import { Button, buttonVariants } from "../button";
import { ShareIcon, TrashIcon } from "lucide-react";
import { useParams } from "next/navigation";
import NewChat from "@/components/new-chat-section";
import { Switch } from "../switch";

type ActionProps={
    currenUserRole:"Editor" | "Commenter" | "Read-Only" | "Admin"
    isPending:boolean
    isInbox:(str:string)=>boolean,
    isAutoSaveOn:boolean
    setAutoSaveOn:(bool:boolean)=>void
    handleReset:()=>void
}
export default function ChatMessagesAction({currenUserRole,isPending,isInbox,isAutoSaveOn,setAutoSaveOn,handleReset}:ActionProps) {
    const params=useParams()
  return (
    <>
      {!isInbox(params.id as string) && /Admin|Editor/.test(currenUserRole) && (
        <NewChat />
      )}
      {!isInbox(params.id as string) && /Admin|Editor/.test(currenUserRole) && (
        <Button
          onClick={handleReset}
          variant="destructive-rfull"
          className={`flex items-center gap-2 justify-center  ${
            isPending && "!bg-red-500"
          }`}
        >
          {isPending ? (
            <span className="px-2.5">
              <l-dot-wave size={40} speed={1.6} color="white"></l-dot-wave>
            </span>
          ) : (
            <>
              <TrashIcon className="w-4 h-4" />
              Reset
            </>
          )}
        </Button>
      )}
      <ShareRepo Role={currenUserRole}>
        <Button
          onClick={() => {}}
          variant={"blue-rfull"}
          className="flex items-center gap-2"
        >
          <ShareIcon className="w-4 h-4" />
          Share
        </Button>
      </ShareRepo>
      <div
        className={`${buttonVariants({
          variant: "pale-rfull",
        })} flex items-center gap-3 bg-white rounded-lg py-2 px-4`}
      >
        <Switch
          checked={isAutoSaveOn}
          onCheckedChange={() => setAutoSaveOn(!isAutoSaveOn)}
        />
        <p className="text-nowrap">Autosave</p>
      </div>
    </>
  );
}
