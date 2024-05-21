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
  ChevronDownIcon,
  DoorOpen,
  LogOut,
  Menu,
} from "lucide-react";
// import {ObjectId} from 'bson'
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { app } from "@/lib/db/realm";
import { deleteNameSpace, removeCookie } from "@/app/_action";
import { Skeleton } from "./ui/skeleton";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";
const inboxes = [
  { id: "gmail", name: "Gmail", imgSrc: "/google.png" },
  { id: "hotmail", name: "Outlook", imgSrc: "/outlook.webp" },
  { id: "zoho", name: "Zoho", imgSrc: "/zoho-mail.png" },
];

type RepoType = {
  _id: string;
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  shared_access: {
    user_id: string;
    role: "Editor" | "Commenter" | "Read-Only";
  };
};
type SideBarPropos = {
  ownRepos: {
    repos: RepoType[];
    isLoaded: boolean;
  };
  getOwnThreads: () => Promise<void>;
  currentTab: string;
  setCurrentTab: (id: string) => void;
  sharedRepos: {
    repos: RepoType[];
    isLoaded: boolean;
  };
  getSharedThreads: () => Promise<void>;
  userData: {
    name: string;
    picture: string;
  };
  closeSideBar?: () => void;
};

export function SidebarComponent({
  ownRepos,
  getOwnThreads,
  currentTab,
  setCurrentTab,
  sharedRepos,
  userData,
  closeSideBar,
}: SideBarPropos) {
  const addRepoRef = useRef<HTMLButtonElement>(null);
  const [addRepoName, setAddRepoName] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const [boxData, setBoxData] = useState({
    itemName: "",
    status: "closed",
    id: "",
  });

  const router = useRouter();
  const pathname = usePathname();

  async function createRepo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setLoading(true);
    const mongo = app?.currentUser
      ?.mongoClient("mongodb-atlas")
      .db("private-gpt");
    try {
      await mongo?.collection("threads").insertOne({
        name: addRepoName,
        userId: app.currentUser?.id,
        createdAt: new Date().toISOString(),
        shared_access: [],
      });
      await getOwnThreads();
      addRepoRef?.current?.click();
    } catch (error) {}
    setLoading(false);
    setAddRepoName("");
  }
  async function deleteRepo(id: string) {
    const mongo = app?.currentUser
      ?.mongoClient("mongodb-atlas")
      .db("private-gpt");
    try {
      const threadPromise = mongo?.collection("threads").deleteOne({
        $and: [
          { _id: { $oid: id } },
          { userId: app?.currentUser?.id as string },
        ],
      });
      await Promise.all([threadPromise, deleteNameSpace(id)]);
      if (pathname.includes(id)) {
        router.push("/");
      }
      await getOwnThreads();
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
      <aside className="sidebar shadow-sm bg-white/40 text-sm 2xl:text-base pb-3  w-full h-screen scrollbar overflow-hidden flex flex-col">
        <nav className="flex flex-col gap-4  mb-5 scrollbar overflow-y-auto  flex-grow py-4 w-full">
          <div className="flex flex-col gap-4">
            <div className="px-6">
              <h2 className="font-bold text-xl 2xl:text-2xl">Repositories</h2>
            </div>
            {ownRepos.isLoaded ? (
              <>
                {ownRepos.repos.length > 0 ? (
                  <ul className="flex flex-col gap-2 w-full whitespace-nowrap pl-2">
                    {ownRepos?.repos.map((repo) => (
                      <Collapsible key={repo.id} open={currentTab === repo.id}>
                        <li
                          key={repo.id}
                          className={`flex gap-3 items-center justify-between py-1 pl-4 pr-2 rounded-l-full cursor-pointer hover:bg-ui-600 group hover:text-secondary font-medium transition-all ${
                            pathname.includes(repo.id) &&
                            "bg-ui-600 text-secondary"
                          }`}
                        >
                          <CollapsibleTrigger asChild>
                            <Tooltip>
                              <TooltipTrigger
                                onClick={() => {
                                  setCurrentTab(repo.id);
                                  if (closeSideBar) {
                                    closeSideBar();
                                  }
                                }}
                                asChild
                              >
                                <Link
                                  href={`/${repo.id}/query`}
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
                          </CollapsibleTrigger>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className={`!bg-transparent focus:!border-none focus:!outline-none focus:!ring-0 p-2 w-9 h-9 text-primary hover:!bg-ui-700 group-hover:text-secondary ${
                                  pathname.includes(repo.id) && "text-secondary"
                                }`}
                              >
                                <EllipsisVertical size={25} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
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
                        </li>
                        <CollapsibleContent className="flex  gap-4 pl-8 ">
                          <div className="flex flex-col gap-2 border-l-2 py-1 border-gray-300 pl-2 font-medium  w-full">
                            <Link
                              href={`/${repo.id}/query`}
                              replace={pathname === "/"}
                              className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-800 hover:text-secondary font-medium transition-all ${
                                pathname.includes(`${repo.id}/query`) &&
                                "bg-ui-800 text-secondary"
                              }`}
                            >
                              Query
                            </Link>
                            <Link
                              href={`/${repo.id}/history`}
                              replace={pathname === "/"}
                              className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-800 hover:text-secondary font-medium transition-all ${
                                pathname.includes(`${repo.id}/history`) &&
                                "bg-ui-800 text-secondary"
                              }`}
                            >
                              History
                            </Link>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </ul>
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
            {ownRepos.isLoaded && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex gap-3 justify-start items-center py-2 px-4 mr-2 rounded-full cursor-pointer hover:!bg-black/10 !bg-transparent text-black hover:text-primary font-medium transition-all">
                    <PlusIcon className="h-6 w-6 " />
                    Add new
                  </Button>
                </DialogTrigger>
                <DialogContent className=" p-5 pt-8 max-w-sm w-[calc(100%-16px)] rounded-lg">
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
            )}
            <div className="px-6">
              <h2 className="font-bold text-xl 2xl:text-2xl">Shared</h2>
            </div>
            {sharedRepos.isLoaded ? (
              <>
                {sharedRepos?.repos.length > 0 ? (
                  <ul className="flex flex-col gap-2 w-full whitespace-nowrap pl-2">
                    {sharedRepos?.repos.map((repo) => (
                      <Collapsible key={repo.id} open={currentTab === repo.id}>
                        <li
                          key={repo.id}
                          className={`flex gap-3 items-center justify-between py-3 pl-4 pr-2 rounded-l-full cursor-pointer hover:bg-ui-600 group hover:text-secondary font-medium transition-all ${
                            pathname.includes(repo.id) &&
                            "bg-ui-600 text-secondary"
                          }`}
                        >
                          <CollapsibleTrigger asChild>
                            <Tooltip>
                              <TooltipTrigger
                                onClick={() => {
                                  setCurrentTab(repo.id);
                                  if (closeSideBar) {
                                    closeSideBar();
                                  }
                                }}
                                asChild
                              >
                                <Link
                                  href={
                                    repo.shared_access.role !== "Commenter"
                                      ? `/${repo.id}/query`
                                      : `/${repo.id}/history`
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
                          </CollapsibleTrigger>
                        </li>
                        <CollapsibleContent className="flex  gap-4 pl-8 ">
                          <div className="flex flex-col gap-2 border-l-2 py-1 border-gray-300 pl-2 font-medium  w-full">
                            {repo.shared_access?.role !== "Commenter" && (
                              <Link
                                href={`/${repo.id}/query`}
                                replace={pathname === "/"}
                                className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-800 hover:text-secondary font-medium transition-all ${
                                  pathname.includes(`${repo.id}/query`) &&
                                  "bg-ui-800 text-secondary"
                                }`}
                              >
                                Query
                              </Link>
                            )}
                            <Link
                              href={`/${repo.id}/history`}
                              replace={pathname === "/"}
                              className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-800 hover:text-secondary font-medium transition-all ${
                                pathname.includes(`${repo.id}/history`) &&
                                "bg-ui-800 text-secondary"
                              }`}
                            >
                              History
                            </Link>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </ul>
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
          <div className="flex flex-col gap-4">
            <div className="px-6">
              <h2 className="font-bold text-xl 2xl:text-2xl">Inbox</h2>
            </div>
            <ul className="flex flex-col gap-2 w-full whitespace-nowrap pl-2">
              {inboxes.map((inbox) => (
                <Collapsible key={inbox.id} open={currentTab === inbox.id}>
                  <li
                    key={inbox.id}
                    className={`flex gap-3 items-center py-1 px-4 rounded-l-full cursor-pointer hover:bg-ui-600 group hover:text-secondary font-medium transition-all ${
                      pathname.includes(inbox.id) && "bg-ui-600 text-secondary"
                    }`}
                  >
                    {" "}
                    <CollapsibleTrigger
                      onClick={() => {
                        setCurrentTab(inbox.id);
                        if (closeSideBar) {
                          closeSideBar();
                        }
                      }}
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
                        className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-800 hover:text-secondary font-medium transition-all ${
                          pathname.includes(`${inbox.id}/query`) &&
                          "bg-ui-800 text-secondary"
                        }`}
                      >
                        Query
                      </Link>
                      <Link
                        href={`/${inbox.id}/history`}
                        replace={pathname === "/"}
                        className={`flex gap-3 items-center py-2 px-4 rounded-l-full cursor-pointer hover:bg-ui-800 hover:text-secondary font-medium transition-all ${
                          pathname.includes(`${inbox.id}/history`) &&
                          "bg-ui-800 text-secondary"
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
        </nav>
        <Popover
          onOpenChange={(e) => {
            setDropdownOpen(e);
          }}
        >
          <PopoverTrigger asChild>
            <div className=" bg-ui-500 rounded-lg flex items-center mx-2 cursor-pointer p-2">
              <div className="flex items-center gap-3 flex-grow">
                {userData.name.length > 0 ? (
                  <>
                    <div className="rounded-full overflow-hidden">
                      <Image
                        src={
                          userData?.picture?.length !== 0
                            ? userData.picture
                            : "/profile.png"
                        }
                        alt="Uploaded image"
                        width={40}
                        height={40}
                      />
                    </div>
                    <span className="font-semibold text-white">
                      {userData.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Skeleton className="!bg-slate-100 rounded-full w-10 h-10" />
                    <div className="flex flex-col gap-1 flex-grow">
                      <img width={1} height={1} />
                      <Skeleton className="!bg-slate-100 h-3 w-4/5" />
                      <Skeleton className="!bg-slate-100 h-2 w-3/5" />
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
                await removeCookie();
                await app?.currentUser?.logOut();
                router.replace("/login");
              }}
              variant="ghost"
              className="!bg-ui-700/60 !text-white hover:!bg-ui-600/60 !outline-none !border-none !ring-0 flex items-center justify-between py-2 px-4  w-full"
            >
              <span className="font-semibold">Log Out</span>
              <LogOut size={22} />
            </Button>
          </PopoverContent>
        </Popover>
      </aside>
      <ConfirmationBox
        onConfirm={deleteRepo}
        onCancel={closeConfirmBox}
        {...boxData}
      />
    </TooltipProvider>
  );
}

export default function Sidebar() {
  const [currentTab, setCurrentTab] = useState("");
  const router = useRouter();
  const CloseSideBarRef = useRef<HTMLButtonElement | null>(null);
  const [userData, setUsername] = useState({ name: "", picture: "" });
  const [ownRepos, setOwnRepos] = useState<{
    repos: RepoType[];
    isLoaded: boolean;
  }>({ repos: [], isLoaded: false });
  const [sharedRepos, setSharedRepos] = useState<{
    repos: RepoType[];
    isLoaded: boolean;
  }>({ repos: [], isLoaded: false });
  const { setRepos } = useThreads();

  useEffect(() => {
    setUsername({
      name: app.currentUser?.customData.name as string,
      picture: app.currentUser?.customData.picture as string,
    });
    getOwnThreads();
    getSharedThreads();
    console.log("mounted");
    console.log("unmounted");
  }, []);

  useEffect(() => {
    setRepos([
      ...ownRepos.repos,
      ...sharedRepos.repos,
      ...inboxes.map((inbox) => ({ id: inbox.id, name: inbox.name })),
    ]);
  }, [ownRepos, sharedRepos]);
  useEffect(() => {
    if (ownRepos.isLoaded && ownRepos.repos.length > 0) {
      const id = ownRepos.repos[0].id;
      setCurrentTab(id);
      router.push(`/${id}/query`);
    }
    if (sharedRepos.isLoaded && sharedRepos.repos.length > 0) {
      const id = sharedRepos.repos[0].id;
      setCurrentTab(id);
      if (sharedRepos.repos[0]?.shared_access.role === "Commenter") {
        router.push(`/${id}/history`);
      } else {
        router.push(`/${id}/query`);
      }
    }
  }, [ownRepos.isLoaded, sharedRepos.isLoaded]);

  function closeSideBar() {
    CloseSideBarRef.current?.click();
  }

  async function getOwnThreads() {
    const mongo = app?.currentUser
      ?.mongoClient("mongodb-atlas")
      .db("private-gpt");
    const repos = (await mongo?.collection("threads").find(
      { userId: app.currentUser?.id },
      {
        projection: {
          id: { $toString: "$_id" },
          name: 1,
          createdAt: 1,
          userId: 1,
        },
      }
    )) as RepoType[];
    setOwnRepos({ repos, isLoaded: true });
  }
  async function getSharedThreads() {
    const mongo = app?.currentUser
      ?.mongoClient("mongodb-atlas")
      .db("private-gpt");
    const repos = (await mongo?.collection("threads").aggregate([
      {
        $match: {
          shared_access: { $elemMatch: { userId: app?.currentUser?.id } },
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          name: 1,
          createdAt: 1,
          userId: 1,
          shared_access: {
            $filter: {
              input: "$shared_access",
              as: "access",
              cond: { $eq: ["$$access.userId", app?.currentUser?.id] },
            },
          },
        },
      },
      { $unwind: "$shared_access" },
    ])) as RepoType[];
    setSharedRepos({ repos, isLoaded: true });
  }
  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="duration-500 transition-all   !w-10 !h-10 !p-0 object-contain fixed top-2 left-2  rounded-full  grid place-items-center">
              <Menu strokeWidth={1.9} color="white" size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60 ">
            <SheetClose ref={CloseSideBarRef} className="hidden"></SheetClose>
            <SidebarComponent
              getOwnThreads={getOwnThreads}
              getSharedThreads={getSharedThreads}
              ownRepos={ownRepos}
              sharedRepos={sharedRepos}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              userData={userData}
              closeSideBar={closeSideBar}
            />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden lg:block min-w-60 ">
        <SidebarComponent
          getOwnThreads={getOwnThreads}
          getSharedThreads={getSharedThreads}
          ownRepos={ownRepos}
          sharedRepos={sharedRepos}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          userData={userData}
        />
      </div>
    </>
  );
}
