import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CheckCircle2, FolderOpen } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectContent } from "../ui/select";
import { Label } from "../ui/label";
import Loader from "@/components/Loader";
import { useThreads } from "@/components/Wrapper";
import { useParams } from "next/navigation";
import { Role } from "@prisma/client";
import { shareRepo } from "@/app/_action/repos";
import { useToast } from "@/hooks/use-toast";

type Props = {
  Role: Role | undefined;
  children: React.ReactNode;
};
const RoleRanksMap = new Map<Role, number>([
  [Role.owner, 0],
  [Role.editor, 1],
  [Role.viewer, 2],
  [Role.commentor, 3],
]);
const RoleToShare = [Role.editor, Role.viewer, Role.commentor];
const SelectItems = [
  {
    name: "Editor",
    description: "Manage lower access, Edit files, Can chat",
    value: Role.editor,
  },
  {
    name: "Viewer",
    description: "Cannot edits files but can chat",
    value: Role.viewer,
  },
  {
    name: "Commenter",
    description: "Can comment on history responses ",
    value: Role.commentor,
  },
];
export default function ShareRepo({ Role:role, children }: Props) {
  const { currentThread } = useThreads();
  const [data, setData] = useState({ email: "", description: "" });
  const [shareRole, setShareRole] = useState<Role>(
    RoleToShare[RoleRanksMap.get(role as Role) as number]
  );
  const [accessType, setAccessType] = useState(
    SelectItems[RoleRanksMap.get(role as Role) as number]?.name
  );
  const [isLoading, setLoading] = useState(false);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const params = useParams();
  const { toast } = useToast();
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  async function handleShareRepo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setLoading(true);
    try {
      const { status,error } = await shareRepo(
        params.id as string,
        data.email,
        shareRole,
        data.description
      );
      switch (status) {
        case 401:
          toast({
            variant: "destructive",
            title: "Not found",
            description: "Repo not found for the user",
          });
        break;
        case 404:
          toast({
            variant: "destructive",
            title: "User not found",
            description: "User doest not exist, please tell them to join the platform",
          });
        break;
        case 403:
          toast({
            variant:'destructive',
            title:error,
          })
        break;
        case 200:
            toast({
              variant: "success",
              title: "Sent",
              description: "The invite has been sent to the user",
            });
            dialogCloseRef.current?.click();  
        break
        default:
          toast({
            variant: "destructive",
            title: "Server Error",
            description: "Something Went Wrong",
          });
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }
  function reset() {
    setData({ email: "", description: "" });
    setShareRole(RoleToShare[RoleRanksMap.get(role as Role) as number]);
    setAccessType(SelectItems[RoleRanksMap.get(role as Role) as number]?.name);
  }
  return (
    <Dialog
      onOpenChange={() => {
        reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:w-1/2 sm:flex sm:items-center sm:justify-center">
        <DialogTitle className="hidden">Share Repo</DialogTitle> 
          <form
            onSubmit={handleShareRepo}
            className=" grid grid-cols-1 sm:grid-cols-3 gap-5 w-full"
          >
            <div className="flex flex-col items-center justify-center py-6 px-5 mt-5 sm:mt-0  sm:py-20  sm:px-10 rounded-lg bg-gray-200 gap-3">
              <div className="grid place-items-center p-4 bg-white rounded-md">
                <FolderOpen strokeWidth={1.2} size={40} />
              </div>
              <span>
                <strong>{currentThread?.name}</strong>
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 justify-center">
              <Label htmlFor="invite-email" className="pb-3">
                <span className=" font-semibold border-b-2 pb-1 border-gray-500 ">
                  Email Invite
                </span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                name="email"
                value={data.email}
                onChange={handleInputChange}
                placeholder="Invite by Email..."
                required
              />
              <Input
                id="invite-email"
                type="text"
                name="description"
                value={data.description}
                onChange={handleInputChange}
                placeholder="Add a message...(recommanded)"
              />
              <div className="flex items-center gap-3 ">
                <Select
                  onValueChange={(value) =>{setShareRole(SelectItems.find((param)=>param.name===value)?.value as Role); setAccessType(value)}}
                  value={accessType}
                  defaultValue={accessType}
                >
                  <SelectTrigger className="flex-grow">
                    <strong>{accessType}</strong>
                  </SelectTrigger>
                  <SelectContent>
                    {SelectItems.slice(
                      RoleRanksMap.get(role as Role),
                      SelectItems.length
                    ).map((item) => (
                      <SelectItem
                        key={item.name}
                        value={item.name}
                        className="w-full cursor-pointer bg-gray-100 mt-1.5"
                      >
                        <div className="flex flex-col gap-0.5  rounded-md w-full px-2">
                          <span className="font-semibold text-base">
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="grid place-items-center !bg-ui-700"
                >
                  {isLoading ? (
                    <span className="px-[25px]">
                      <Loader stroke={1.6} size={24} color="white" />
                    </span>
                  ) : (
                    "Send invite"
                  )}
                </Button>
              </div>
            </div>
          </form>
        <DialogClose ref={dialogCloseRef}></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
