"use strict";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Role } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { AccessUsers, SharedUser } from "@/lib/types";
import { useThreads } from "../Wrapper";
import { Button, buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import { User2, UserRoundX, X } from "lucide-react";
import { set } from "zod";
import {
  deleteUserFromRepo,
  getSharedUsers,
  updateUserRoles,
} from "@/app/_action/repos";
import { useToast } from "@/hooks/use-toast";
import Ring from "../Loaders/Ring";

const RoleMap: { [key: string]: Role } = {
  Editor: Role.editor,
  Viewer: Role.viewer,
  Commentor: Role.commentor,
};
const reverseRoleMap = new Map<Role, string>([
  [Role.editor, "Editor"],
  [Role.viewer, "Viewer"],
  [Role.commentor, "Commentor"],
]);

// const users: AccessUsers = {
//   2: {
//     id: 2,
//     name: "Jane Doe",
//     role: Role.editor,
//   },
//   3: {
//     id: 3,
//     name: "John Smith",
//     role: Role.viewer,
//   },
//   4: {
//     id: 4,
//     name: "Jane Smith",
//     role: Role.commentor,
//   },
// };
function deepCopy(data: object) {
  return JSON.parse(JSON.stringify(data));
}

export default function ManageAccess({
  children,
}: {
  children: React.ReactNode;
}) {
  const [changedRole, setChangedRole] = useState<Set<number>>(new Set());
  const { sharedUsers: users, currentThread, setSharedUsers } = useThreads();
  const [shareUsers, setShareUsers] = useState<AccessUsers>(deepCopy(users));
  const [isLoading, setLoading] = useState<boolean>(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setShareUsers(deepCopy(users));
  }, [users]);
  function handleRoleChange(id: number, role: Role) {
    setChangedRole((prev) => {
      const newSet = new Set(prev);
      if (role === users[id].role) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setShareUsers((prev) => {
      prev[id].role = role;
      return { ...prev };
    });
  }
  async function updateRoles() {
    if (isLoading) return;
    const updatingUsers = Object.values(shareUsers)
      .filter((user) => changedRole.has(user.id))
      .map((user) => ({ id: user.id, role: user.role }));
    try {
      if (updatingUsers.length > 0) {
        setLoading(true);
        const { status, error } = await updateUserRoles(
          updatingUsers,
          currentThread?.id as number
        );
        if (status === 200) {
          toast({
            variant: "success",
            title: "Access Changed",
            description: "User access have been updated",
          });
          getSharedUsers(currentThread?.nameSpace as string).then((users) => {
            setSharedUsers(users.res);
          });
        } else {
          throw new Error(error);
        }
      }
    } catch (error) {
      setShareUsers(deepCopy(users));
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops!!",
        description: "Something went Wrong!",
      });
    }
    setLoading(false);
    closeButtonRef.current?.click();
  }
  async function handleOnDeleteYes(id: number) {
    try {
      const res = await deleteUserFromRepo(currentThread?.id as number, id);
      if (res.status !== 200) {
        throw new Error(res.error);
      }
      toast({
        variant: "success",
        title: "User Removed",
        description: "User has been removed from the repository",
      });
      setShareUsers((prev) => {
        delete prev[id];
        return { ...prev };
      });
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops!!",
        description: "Something went Wrong!",
      });
    }
  }
  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "ui-rfull" })}>
        {children}
      </DialogTrigger>
      <DialogContent defaultClose={false}>
        <DialogTitle className="flex  items-center justify-between text-xl font-semibold">
          Manage Access{" "}
          <DialogClose
            ref={closeButtonRef}
            className="text-gray-500 hover:text-black duration"
          >
            <X size={24} />
          </DialogClose>
        </DialogTitle>
        <Separator />
        {Object.keys(shareUsers).length > 0 ? (
          <div className="flex flex-col gap-2">
            {Object.values(shareUsers).map((user, index) => (
              <div key={user.id + "" + index} className="flex  items-center ">
                <div className="h-8 w-8 flex items-center justify-center border-2 rounded-lg mr-4">
                  <User2 size={16} />
                </div>
                <div className="flex-grow">{user.name}</div>
                <Select
                  value={reverseRoleMap.get(user.role)}
                  defaultValue={reverseRoleMap.get(user.role)}
                  onValueChange={(role) =>
                    handleRoleChange(user.id, RoleMap[role])
                  }
                >
                  <SelectTrigger className="w-24 sm:w-28 md:w-36">
                    <span>{reverseRoleMap.get(user.role)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Commentor">Commenter</SelectItem>
                  </SelectContent>
                </Select>
                <ConfirmationBox
                  id={user.id}
                  handleOnDelete={handleOnDeleteYes}
                >
                  <Button
                    disabled={isLoading}
                    variant="destructive-rfull"
                    className="!rounded-md ml-2 h-10 w-10 p-0 grid place-items-center !border-red-500 border"
                  >
                    <UserRoundX size={20} className="text-xl" />
                  </Button>
                </ConfirmationBox>
              </div>
            ))}
            <Button
              disabled={changedRole.size === 0}
              onClick={updateRoles}
              className="!rounded-md w-24 self-end mt-3 !bg-ui-500 !text-secondary"
            >
              {isLoading ? (
                <Ring size={18} color="white" stroke={1.2}></Ring>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 py-5 items-center justify-center text-gray-600">
            <p>{currentThread?.role===Role.owner ? "Repository is not shared with anyone":"Repository currently doesn't have lower access"}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmationBox({
  handleOnDelete,
  children,
  id,
}: {
  handleOnDelete: (id: number) => Promise<void>;
  children: React.ReactNode;
  id: number;
}) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  async function handleOnYes() {
    setLoading(true);
    await handleOnDelete(id);
    closeButtonRef.current?.click();
    setLoading(false);
  }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        defaultClose={false}
        className="max-w-sm w-[calc(100%-16px)] rounded-lg"
      >
        <DialogTitle className="flex items-center justify-between text-lg font-semibold">
          Remove User
          <DialogClose
            ref={closeButtonRef}
            className="text-gray-500 hover:text-black duration"
          >
            <X size={24} />
          </DialogClose>
        </DialogTitle>
        <Separator />
        <div className="flex flex-col gap-5 items-center ">
          <p className="text-center">
            Are you sure you want to remove this user?
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              disabled={isLoading}
              variant="destructive-rfull"
              className={
                `!rounded-md  grid place-items-center !border-red-500 border ` +
                (isLoading && "!bg-red-500 !text-secondary")
              }
              onClick={handleOnYes}
            >
              {isLoading ? (
                <Ring size={18} color="white" stroke={1.2}></Ring>
              ) : (
                "Remove"
              )}
            </Button>
            <DialogClose
              disabled={isLoading}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
