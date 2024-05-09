"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  FolderOpenIcon,
  PlusIcon,
  EllipsisVertical,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import Loader from "./Loader";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import ConfirmationBox from "./ui/confirmation-box";
import { useThreads } from "./Wrapper";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

const repos = [
  { id: 564641, name: "Repo 1", description: "Description of Repo 1" },
  { id: 445642, name: "Repo 2", description: "Description of Repo 2" },
  { id: 312133, name: "Repo 3", description: "Description of Repo 3" },
];

const inboxes = [
  { id: "gmail", name: "Gmail", imgSrc: "/google.png" },
  { id: "hotmail", name: "Outlook", imgSrc: "/outlook.webp" },
  { id: "zoho", name: "Zoho", imgSrc: "/zoho-mail.png" },
];

export default function Sidebar({
  threads,
}: {
  threads: { id: string; heading: string; createdAt: string }[];
}) {
  const addRepoRef = useRef<HTMLButtonElement>(null);
  const [addRepoName, setAddRepoName] = useState("");
  const [currentTab, setCurrentTab] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [boxData, setBoxData] = useState({
    itemName: "",
    status: "closed",
    id: "",
  });
  const { setRepos } = useThreads();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    setRepos([
      ...threads.map((repo) => ({ id: repo.id, name: repo.heading })),
      ...inboxes,
    ]);
  }, []);
  async function createRepo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/threads/create", {
        method: "POST",
        body: JSON.stringify({ heading: addRepoName.trim() }),
      });
      if (res.ok) {
        router.refresh();
      }
      addRepoRef?.current?.click();
    } catch (error) {}
    setLoading(false);
    setAddRepoName("");
  }
  async function deleteRepo(id: string) {
    try {
      const res = await fetch(`/api/threads/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (pathname.includes(id)) {
          router.push("/");
        }
        router.refresh();
      }
      return { success: true };
    } catch (error) {
      console.log(id);
      return { success: false };
    }
  }

  function openConfirmBox(itemName: string, id: string) {
    setBoxData({ itemName, id, status: "open" });
  }
  function closeConfirmBox() {
    setBoxData({ itemName: "", id: "", status: "closed" });
  }
  return (
    <TooltipProvider>
      <aside className="sidebar shadow-sm text-sm 2xl:text-base  min-w-60 h-screen  scrollbar overflow-y-auto">
        <nav className="flex flex-col gap-4 bg-white/40 h-full py-4 w-full">
          <div className="flex flex-col gap-4">
            <div className="px-6">
              <h2 className="font-bold text-xl 2xl:text-2xl">Repositories</h2>
            </div>
            <ul className="flex flex-col gap-2 w-full whitespace-nowrap pl-2">
              {threads.map((repo) => (
                <Collapsible key={repo.id} open={currentTab === repo.id}>
                  <li
                    key={repo.id}
                    className={`flex gap-3 items-center justify-between py-1 pl-4 pr-2 rounded-l-full cursor-pointer hover:bg-violet-600 group hover:text-secondary font-medium transition-all ${
                      pathname.includes(repo.id) &&
                      "bg-violet-600 text-secondary"
                    }`}
                  >
                    <CollapsibleTrigger
                      onClick={() => setCurrentTab(repo.id)}
                      asChild
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/${repo.id}/query`}
                            replace={pathname === "/"}
                            className="flex flex-grow items-center gap-3 "
                          >
                            <FolderOpenIcon className="h-6 w-6 " />
                            {repo.heading.slice(0, 14)}
                            {repo.heading.length > 14 && " ..."}
                          </Link>
                        </TooltipTrigger>
                        {repo.heading.length > 14 && (
                          <TooltipContent side="bottom">{repo.heading}</TooltipContent>
                        )}
                      </Tooltip>
                    </CollapsibleTrigger>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className={`!bg-transparent focus:!border-none focus:!outline-none focus:!ring-0 p-2 w-9 h-9 text-primary hover:!bg-violet-700 group-hover:text-secondary ${
                            pathname.includes(repo.id) && "text-secondary"
                          }`}
                        >
                          <EllipsisVertical size={25} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            openConfirmBox(repo.heading, repo.id);
                          }}
                        >
                          <button className="cursor-pointer text-red-500 flex items-center gap-2 font-semibold hover:!text-red-500">
                            <Trash2 size={18} /> Delete
                          </button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                  <CollapsibleContent className="flex  gap-4 pl-8 ">
                    <div className="flex flex-col gap-2 border-l-2 py-1 border-gray-300 pl-2 font-medium  w-full">
                      <Link
                        href={`/${repo.id}/query`}
                        replace={pathname === "/"}
                        className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-violet-800 hover:text-secondary font-medium transition-all ${
                          pathname.includes(`${repo.id}/query`) &&
                          "bg-violet-800 text-secondary"
                        }`}
                      >
                        Query
                      </Link>
                      <Link
                        href={`/${repo.id}/history`}
                        replace={pathname === "/"}
                        className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-violet-800 hover:text-secondary font-medium transition-all ${
                          pathname.includes(`${repo.id}/history`) &&
                          "bg-violet-800 text-secondary"
                        }`}
                      >
                        History
                      </Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex gap-3 justify-start items-center py-2 px-4 mr-2 rounded-full cursor-pointer hover:!bg-black/10 !bg-transparent text-black hover:text-primary font-medium transition-all">
                      <PlusIcon className="h-6 w-6 " />
                      Add new
                    </Button>
                  </DialogTrigger>
                  <DialogContent className=" p-5 pt-8 max-w-sm">
                    <form onSubmit={createRepo} className="flex flex-col gap-4">
                      <Label className="text-lg font-semibold">
                        Repository Name:
                      </Label>
                      <Input
                        value={addRepoName}
                        onChange={(e) => setAddRepoName(e.target.value)}
                        type="text"
                      />
                      <Button type="submit">
                        {isLoading ? (
                          <Loader stroke={1.3} color="white" />
                        ) : (
                          "create"
                        )}
                      </Button>
                    </form>
                    <DialogClose ref={addRepoRef} className="hidden" />
                  </DialogContent>
                </Dialog>
              }
              {/* Add more links as needed */}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <div className="px-6">
              <h2 className="font-bold text-xl 2xl:text-2xl">Inbox</h2>
            </div>
            <ul className="flex flex-col gap-2 w-full whitespace-nowrap pl-2">
              {inboxes.map((inbox) => (
                <Collapsible key={inbox.id} open={currentTab === inbox.id}>
                  <li
                    key={inbox.id}
                    className={`flex gap-3 items-center py-1 px-4 rounded-l-full cursor-pointer hover:bg-violet-600 group hover:text-secondary font-medium transition-all ${
                      pathname.includes(inbox.id) &&
                      "bg-violet-600 text-secondary"
                    }`}
                  >
                    {" "}
                    <CollapsibleTrigger
                      onClick={() => setCurrentTab(inbox.id)}
                      asChild
                    >
                      <Link
                        href={`/${inbox.id}/query`}
                        replace={pathname === "/"}
                        className="flex flex-grow items-center gap-3 p-2"
                      >
                        <Image
                          src={inbox.imgSrc}
                          alt="Uploaded image"
                          width={20}
                          height={20}
                        />
                        {inbox.name}
                      </Link>
                    </CollapsibleTrigger>
                  </li>
                  <CollapsibleContent className="flex  gap-4 pl-8 ">
                    <div className="flex flex-col gap-2 border-l-2 py-1 border-gray-300 pl-2 font-medium  w-full">
                      <Link
                        href={`/${inbox.id}/query`}
                        replace={pathname === "/"}
                        className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-violet-800 hover:text-secondary font-medium transition-all ${
                          pathname.includes(`${inbox.id}/query`) &&
                          "bg-violet-800 text-secondary"
                        }`}
                      >
                        Query
                      </Link>
                      <Link
                        href={`/${inbox.id}/history`}
                        replace={pathname === "/"}
                        className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-violet-800 hover:text-secondary font-medium transition-all ${
                          pathname.includes(`${inbox.id}/history`) &&
                          "bg-violet-800 text-secondary"
                        }`}
                      >
                        History
                      </Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              <li className="flex gap-3 items-center py-2 px-4 mr-2 rounded-full cursor-pointer hover:bg-black/10  hover:text-primary font-medium transition-all">
                <PlusIcon className="h-6 w-6 " />
                Add new
              </li>
              {/* Add more links as needed */}
            </ul>
          </div>
          <ConfirmationBox
            onConfirm={deleteRepo}
            onCancel={closeConfirmBox}
            {...boxData}
          />
        </nav>
      </aside>
    </TooltipProvider>
  );
}
