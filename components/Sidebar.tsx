"use client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  FolderOpenIcon,
  PlusIcon,
  EllipsisVertical,
  Trash2,
  ChevronDownIcon,
  LogOut,
  Menu,
  PencilIcon,
  FolderClosed,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import ConfirmationBox from "./ui/confirmation-box";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import Loader from "./Loader";
import {  useRef, useState } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useThreads } from "./Wrapper";

import {
  createRepo,
  deleteRepo,
  getOwnRepos,
  renameRepo,
} from "@/app/_action/repos";
import { Role } from "@prisma/client";
import { Thread } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useToast } from "@/hooks/use-toast";

type SideBarPropos = {
  useRepos: () => {
    ownThreads: Thread[];
    sharedThreads: Thread[];
    setOwnThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
    setSharedThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
  };
  closeSideBar?: () => void;
};

export function SidebarComponent({ useRepos, closeSideBar }: SideBarPropos) {
  const addRepoRef = useRef<HTMLButtonElement>(null);
  const [repoData, setRepoData] = useState({ id: 0, name: "", isOpen: false });
  const [isLoading, setLoading] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [boxData, setBoxData] = useState({
    itemName: "",
    status: "closed",
    id: 0,
  });
  const {toast}=useToast()
  const { currentThread, setCurrentThread, clearUser } = useThreads();
  const { ownThreads, sharedThreads, setOwnThreads } = useRepos();

  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  function clearRepoData() {
    setRepoData({ id: 0, name: "", isOpen: false });
  }
  async function handlerRepo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(!repoData.name.trim()) return
    if (isLoading) return;
    setLoading(true);
    try {
      let res;
      if (!repoData.id) {
        res = await createRepo(repoData.name);
      } else {
        res = await renameRepo(repoData.id, repoData.name);
      }
      if (res.status) {
        const newThreads = await getOwnRepos();
        setOwnThreads(newThreads);
      }
      addRepoRef.current?.click();
    } catch (error) {
      console.log(error);
      toast({variant:"destructive",title:"Oops!!",description:"Please try again later"})
    }
    setLoading(false);
    clearRepoData();
  }
  async function handleDeleteRepo(id: number) {
    if(ownThreads.length===1){
      toast({variant:"destructive",description:"Last Repository cannot be deleted"})
      return
    } 
    try {
      const res = await deleteRepo(id);
      if (res.status) {
        if(currentThread?.id===id){
          const thread=ownThreads.find((thread)=>thread.id!==id) as Thread
          setCurrentThread(thread)
          router.push(`/${thread.nameSpace}/query`)
        }
        const newThreads = await getOwnRepos();
        setOwnThreads(newThreads);
      }
    } catch (error) {
      console.log(error);
      toast({variant:"destructive",title:"Oops!!",description:"Please try again later"})
    }
  }

  function openConfirmBox(itemName: string, id: number) {
    setBoxData({ itemName, id, status: "open" });
  }
  function closeConfirmBox() {
    setBoxData({ itemName: "", id: NaN, status: "closed" });
  }

  return (
    <TooltipProvider>
      <aside className="sidebar shadow-sm bg-white/40 text-sm 2xl:text-base pb-3  w-full h-screen scrollbar overflow-hidden flex flex-col">
        <nav className="flex flex-col gap-4  mb-5 scrollbar overflow-y-auto  flex-grow py-4 w-full scrollbar">
          <div className="flex flex-col gap-4 scrollbar">
            <div className="px-6">
              <h2 className="font-bold text-xl 2xl:text-2xl">Repositories</h2>
            </div>
            {ownThreads ? (
              <>
                {ownThreads.length > 0 ? (
                  <Accordion
                    type="single"
                    collapsible
                    value={currentThread?.nameSpace ?? ""}
                  >
                    {/* <ul className="flex flex-col gap-2 w-full whitespace-nowrap pl-2"> */}

                    {ownThreads.map((repo) => (
                      <AccordionItem key={repo.id} value={repo.nameSpace}>
                        <div
                          className={`flex items-center ml-4 mb-1  pl-3 px-1 py-1 rounded-l-full hover:text-secondary group hover:bg-ui-600 ${
                            currentThread?.id === repo.id &&
                            "bg-ui-600 text-secondary"
                          }`}
                        >
                          <AccordionTrigger
                            onClick={() => {
                              setCurrentThread(repo);
                              router.push(`/${repo.nameSpace}/query`);
                              if (closeSideBar) {
                                closeSideBar();
                              }
                            }}
                            className="flex-grow w-full"
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-grow items-center gap-3 ">
                                  {currentThread?.id===repo.id?<FolderOpenIcon className="h-6 w-6 " />:
                                  <FolderClosed className="h-6 w-6 " />}
                                  {repo.name.slice(0, 14)}
                                  {repo.name.length > 14 && " ..."}
                                </div>
                              </TooltipTrigger>
                              {repo.name.length > 14 && (
                                <TooltipContent side="bottom">
                                  {repo.name}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </AccordionTrigger>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className={`!bg-transparent focus:!border-none focus:!outline-none focus:!ring-0 p-2 w-9 h-9 text-primary hover:!bg-ui-700 group-hover:text-secondary ${
                                  currentThread?.id === repo.id &&
                                  "text-secondary"
                                }`}
                              >
                                <EllipsisVertical size={25} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setRepoData({
                                    id: repo.id,
                                    name: repo.name,
                                    isOpen: true,
                                  });
                                }}
                              >
                                <button className="cursor-pointer  flex items-center gap-2 font-semibold">
                                  <PencilIcon size={18} /> Edit
                                </button>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  openConfirmBox(repo.name, repo.id);
                                }}
                              >
                                <button className="cursor-pointer text-red-500 flex items-center gap-2 font-semibold hover:!text-red-500">
                                  <Trash2 size={18} /> Delete
                                </button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <AccordionContent className="flex  gap-4 pl-8">
                          <div className="flex flex-col gap-2 border-l-2 py-1  border-gray-300 pl-2 font-medium  w-full">
                            <button
                              onClick={() => {
                                router.push(`/${repo.nameSpace}/query`);
                                if (closeSideBar) {
                                  closeSideBar();
                                }
                              }}
                              className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-700 hover:text-secondary font-medium transition-all ${
                                pathname.includes(`${repo.nameSpace}/query`) &&
                                "bg-ui-700 text-secondary"
                              }`}
                            >
                              Query
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/${repo.nameSpace}/history`);
                                if (closeSideBar) {
                                  closeSideBar();
                                }
                              }}
                              className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-700 hover:text-secondary font-medium transition-all ${
                                pathname.includes(
                                  `${repo.nameSpace}/history`
                                ) && "bg-ui-700 text-secondary"
                              }`}
                            >
                              History
                            </button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <>
                    <span className="px-9 font-semibold text-gray-500 ">
                      Create a Repositry to start Chat
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                {[4, 2, 5].map((i) => (
                  <div key={i} className="mb-3 flex flex-col gap-2">
                    <Skeleton
                      className={` ml-3 h-4 rounded-full`}
                      style={{ width: `calc(100% - ${i}rem)` }}
                    />
                    <Skeleton
                      className={` h-2 ml-3 rounded-full`}
                      style={{ width: `calc(100% - ${i + 4}rem)` }}
                    />
                  </div>
                ))}
              </>
            )}
            {ownThreads && (
              <Dialog
                open={repoData.isOpen}
                onOpenChange={(e) => {
                  if (!e) {
                    setRepoData((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setRepoData({ id: 0, name: "", isOpen: true });
                    }}
                    className="flex gap-3 justify-start items-center py-2 px-4 mx-1 rounded-full cursor-pointer hover:!bg-black/10 !bg-transparent text-black hover:text-primary font-medium transition-all"
                  >
                    <PlusIcon className="h-6 w-6 " />
                    Add new
                  </Button>
                </DialogTrigger>
                <DialogContent className=" p-5 pt-8 max-w-sm w-[calc(100%-16px)] rounded-lg">
                  <DialogTitle className="hidden">Create Repo</DialogTitle>
                  <form onSubmit={handlerRepo} className="flex flex-col gap-4">
                    <Label className="text-lg font-semibold">
                      Repository Name:
                    </Label>
                    <Input
                      value={repoData.name}
                      name=""
                      autoFocus
                      onChange={(e) =>
                        setRepoData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      type="text"
                    />
                    <Button type="submit" className="!bg-ui-600">
                      {isLoading ? (
                        <Loader stroke={1.3} color="white" />
                      ) : 
                       ( !repoData.id ? "Create":"Update")
                      }
                    </Button>
                  </form>
                  <DialogClose ref={addRepoRef} className="hidden" />
                </DialogContent>
              </Dialog>
            )}
            <div className="px-6">
              <h2 className="font-bold text-xl 2xl:text-2xl">Shared</h2>
            </div>
            {sharedThreads ? (
              <>
                {sharedThreads.length > 0 ? (
                  <Accordion
                    type="single"
                    collapsible
                    value={currentThread?.nameSpace ?? ""}
                  >
                    {sharedThreads.map((repo) => (
                      <AccordionItem key={repo.id} value={repo.nameSpace}>
                        <div
                          className={`flex items-center ml-4 mb-1  pl-3 px-1 h-12 rounded-l-full hover:text-secondary group hover:bg-ui-600 ${
                            currentThread?.id === repo.id &&
                            "bg-ui-600 text-secondary"
                          }`}
                        >
                          <AccordionTrigger asChild>
                            <Tooltip>
                              <TooltipTrigger
                                onClick={() => {
                                  setCurrentThread(repo);
                                  if (closeSideBar) {
                                    closeSideBar();
                                  }
                                }}
                                asChild
                              >
                                <Link
                                  href={
                                    repo.role !== Role.commentor
                                      ? `/${repo.nameSpace}/query`
                                      : `/${repo.nameSpace}/history`
                                  }
                                  replace={pathname === "/"}
                                  className="flex flex-grow items-center gap-3 "
                                >
                                  <FolderOpenIcon className="h-6 w-6 " />
                                  {repo.name.slice(0, 14)}
                                  {repo.name.length > 14 && " ..."}
                                </Link>
                              </TooltipTrigger>
                              {repo.name.length > 14 && (
                                <TooltipContent side="bottom">
                                  {repo.name}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent className="flex  gap-4 pl-8 ">
                          <div className="flex flex-col gap-2 border-l-2 py-1 border-gray-300 pl-2 font-medium  w-full">
                            {repo.role !== Role.commentor && (
                              <Link
                                href={`/${repo.nameSpace}/query`}
                                replace={pathname === "/"}
                                className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-700 hover:text-secondary font-medium transition-all ${
                                  pathname.includes(
                                    `${repo.nameSpace}/query`
                                  ) && "bg-ui-700 text-secondary"
                                }`}
                                onClick={()=>{
                                  if (closeSideBar) {
                                    closeSideBar();
                                  }
                                }}
                              >
                                Query
                              </Link>
                            )}
                            <Link
                              href={`/${repo.nameSpace}/history`}
                              replace={pathname === "/"}
                              className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-700 hover:text-secondary font-medium transition-all ${
                                pathname.includes(
                                  `${repo.nameSpace}/history`
                                ) && "bg-ui-700 text-secondary"
                              }`}
                              onClick={()=>{
                                if (closeSideBar) {
                                  closeSideBar();
                                }
                              }}
                            >
                              History
                            </Link>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <span className="px-9 font-semibold text-gray-500 ">
                    No shared repositories
                  </span>
                )}
              </>
            ) : (
              <>
                {[6, 3, 7].map((i) => (
                  <div key={i} className="mb-3 ml-3 flex flex-col gap-2">
                    <Skeleton
                      className="ml-3 h-4 rounded-full"
                      style={{ width: `calc(100% - ${i}rem)` }}
                    />
                    <Skeleton
                      className="h-2 ml-3 rounded-full"
                      style={{ width: `calc(100% - ${i + 4}rem)` }}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </nav>
        <Popover
          onOpenChange={(e) => {
            setDropdownOpen(e);
          }}
        >
          <PopoverTrigger asChild>
            <div className=" bg-ui-500 rounded-lg flex items-center mx-2 cursor-pointer p-2">
              <div className="flex items-center gap-3 flex-grow">
                {session?.data ? (
                  <>
                    <div className="rounded-full overflow-hidden">
                      <Image
                        src={session.data?.user?.image || "/profile.png"}
                        alt="Uploaded image"
                        width={40}
                        height={40}
                      />
                    </div>
                    <span className="font-semibold text-white">
                      {session?.data?.user.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Skeleton className="!bg-slate-100 rounded-full w-10 h-10" />
                    <div className="flex flex-col gap-1 flex-grow">
                      <Skeleton className="!bg-slate-100 h-3 w-4/5" />
                    </div>
                  </>
                )}
              </div>
              <ChevronDownIcon
                strokeWidth={2.2}
                color="white"
                className={`${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                } duration-200`}
                size={28}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            sideOffset={10}
            className=" p-1 w-[calc(15rem-0.75rem)] "
          >
            <Button
              onClick={async () => {
                await signOut();
                clearUser();
                router.replace("/login");
              }}
              variant="ghost"
              className="!bg-ui-500/80 !text-white hover:!bg-ui-600/80 !outline-none !border-none !ring-0 flex items-center justify-between py-2 px-4  w-full"
            >
              <span className="font-semibold">Log Out</span>
              <LogOut size={22} />
            </Button>
          </PopoverContent>
        </Popover>
      </aside>
      <ConfirmationBox
        onConfirm={handleDeleteRepo}
        onCancel={closeConfirmBox}
        {...boxData}
      />
    </TooltipProvider>
  );
}

export default function Sidebar({
  ownRepos,
  sharedRepos,
}: {
  ownRepos: Thread[];
  sharedRepos: Thread[];
}) {
  const CloseSideBarRef = useRef<HTMLButtonElement | null>(null);
  const [ownThreads, setOwnThreads] = useState<Thread[]>(ownRepos);
  const [sharedThreads, setSharedThreads] = useState<Thread[]>(sharedRepos);
  function useRepos() {
    return { ownThreads, sharedThreads, setOwnThreads, setSharedThreads };
  }
  function closeSideBar() {
    CloseSideBarRef.current?.click();
  }

  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="duration-500 transition-all bg-ui-600  !w-10 !h-10 !p-0 object-contain fixed top-2 left-2  rounded-full  grid place-items-center">
              <Menu strokeWidth={1.9} color="white" size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60 ">
            <SheetTitle className="hidden">sidebar</SheetTitle>
            <SheetClose ref={CloseSideBarRef} className="hidden"></SheetClose>
            <SidebarComponent useRepos={useRepos} closeSideBar={closeSideBar} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden lg:block min-w-60 ">
        <SidebarComponent useRepos={useRepos} />
      </div>
    </>
  );
}
