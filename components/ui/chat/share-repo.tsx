import React, { useState } from "react";
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

type Props = {
  children: React.ReactNode;
};
const SelctItems = [
  { name: "Creator", description: "Can fully Configure and edit the repo" },
  {
    name: "Editor",
    description: "Can edit history and files but cannot edit this Repo",
  },
  { name: "Commenter", description: "Can comment on history responses" },
  { name: "Read Only", description: "Cannot edit or comment" },
];
export default function ShareRepo({ children }: Props) {
  const [data, setData] = useState({ email: "", description: "" });
  const [accessType, setAccessType] = useState("Creator");
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { threads } = useThreads();
  const params = useParams();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  function handleShareRepo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setLoading(true);
    setTimeout(() => {
      setIsSent(true);
      setLoading(false);
    }, 2000);
  }
  function reset() {
    setData({ email: "", description: "" });
    setAccessType("Creator");
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
                    threads?.find(
                      (item) => item.id === params.id
                    )?.name as React.ReactNode
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
                    {SelctItems.map((item) => (
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
