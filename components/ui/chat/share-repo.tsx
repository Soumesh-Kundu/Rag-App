import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { CheckCircle2, FolderOpen } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "../select";
import { Label } from "../label";
import Loader from "@/components/Loader";
import { useThreads } from "@/components/Wrapper";
import { useParams } from "next/navigation";
import { app } from "@/lib/db/realm";
import { sendInvite } from "@/app/_action";

type Props = {
  Role:"Admin"|"Editor"|"Commenter"|"Read-Only",
  children: React.ReactNode;
};
const RoleRanks={
  "Admin":0,
  "Editor":0,
  "Read-Only":1,
  "Commenter":2,
}
const SelectItems = [
  {
    name: "Editor",
    description: "Can edit history and files but cannot edit this Repo",
  },
  { name: "Read Only", description: "Cannot edits files but can chat" },
  { name: "Commenter", description: "Can comment on history responses " },
];
export default function ShareRepo({ Role,children }: Props) {
  const [data, setData] = useState({ email: "", description: "" });
  const [accessType, setAccessType] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [repoName,setRepoName]=useState("")
  const [isSent, setIsSent] = useState(false);
  const { threads } = useThreads();
  const params = useParams();
  useEffect(()=>{
    setAccessType(SelectItems[RoleRanks[Role]]?.name ?? "Editor");
  },[Role])
  useEffect(()=>{
    setRepoName(threads?.find(
      (item) => item.id === params.id
    )?.name as string)
  },[params,threads])
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  async function handleShareRepo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setLoading(true);
    try {
      await sendInvite({
        email: data.email,
        origin: window.location.origin,
        role:accessType.split(" ").join("-"),
        repoId: params.id as string,
        repoName
      })
      setIsSent(true);
      setLoading(false);
    } catch (error) {
      console.log(error)
    }
  }
  function reset() {
    setData({ email: "", description: "" });
    setAccessType(SelectItems[RoleRanks[Role]].name);
    setIsSent(false);
  }
  return (
    <Dialog
      onOpenChange={() => {
        reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={` ${isSent ? "w-1/4" : "w-1/2"}`}>
        {!isSent ? (
          <form
            onSubmit={handleShareRepo}
            className=" grid grid-cols-3 gap-5 w-full"
          >
            <div className="flex flex-col items-center justify-center py-20 px-10 rounded-lg bg-gray-200 gap-3">
              <div className="grid place-items-center p-4 bg-white rounded-md">
                <FolderOpen strokeWidth={1.2} size={40} />
              </div>
              <span>
                <strong>
                  {
                    repoName
                  }
                </strong>
              </span>
            </div>
            <div className="flex flex-col gap-2 col-span-2 justify-center">
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
                  onValueChange={(value) => setAccessType(value)}
                  value={accessType}
                >
                  <SelectTrigger className="flex-grow">
                    <strong>{accessType}</strong>
                  </SelectTrigger>
                  <SelectContent>
                    {SelectItems.slice(RoleRanks[Role], SelectItems.length).map((item) => (
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
                  disabled={false}
                  className="grid place-items-center"
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
        ) : (
          <div className="flex flex-col items-center gap-5 py-5">
            <CheckCircle2
              strokeWidth={1.5}
              size={40}
              className="text-blue-500"
            />
            <span className="font-semibold text-gray-500">Invite Sent</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
