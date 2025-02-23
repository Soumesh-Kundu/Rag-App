import React from "react";
import ShareRepo from "./share-repo";
import { Button, buttonVariants } from "../ui/button";
import { ShareIcon, TrashIcon, User2 } from "lucide-react";
import { useParams } from "next/navigation";
import NewChat from "@/components/new-chat-section";
import { Switch } from "../ui/switch";
import { Role } from "@prisma/client";
import ManageAccess from "@/components/chat/ManageAccess";
import Dotwave from "../Loaders/Dotwave";

type ActionProps = {
  currentUserRole: Role | undefined;
  isPending: boolean;
  isAutoSaveOn: boolean;
  setAutoSaveOn: (bool: boolean) => void;
  handleReset: () => void;
};
export default function ChatMessagesAction({
  currentUserRole,
  isPending,
  isAutoSaveOn,
  setAutoSaveOn,
  handleReset,
}: ActionProps) {
  const isAdminOrEditor =
    currentUserRole === Role.owner || currentUserRole === Role.editor;
  return (
    <>
      {isAdminOrEditor && (
        <ManageAccess>
            <User2 size={24} /> Manage
        </ManageAccess>
      )}
      {isAdminOrEditor && (
        <>
          <NewChat />
          <Button
            onClick={handleReset}
            variant="destructive-rfull"
            className={`flex items-center gap-2 justify-center  ${
              isPending && "!bg-red-500"
            }`}
          >
            {isPending ? (
              <span className="px-2.5">
                <Dotwave size={40} speed={1.6} color="white"></Dotwave>
              </span>
            ) : (
              <>
                <TrashIcon className="w-4 h-4" />
                Reset
              </>
            )}
          </Button>
        </>
      )}
      <ShareRepo Role={currentUserRole}>
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
