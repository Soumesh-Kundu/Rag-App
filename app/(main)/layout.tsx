import Sidebar from "@/components/Sidebar";
import Wrapper from "@/components/Wrapper";
import { permanentRedirect } from "next/navigation";
import { getOwnRepos, getSharedRepos } from "../_action/repos";
import { getServerUser } from "@/lib/auth";
import { Awaitable } from "next-auth";
export const dynamic = "auto";

export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Awaitable<{ id: string }>;
}) {
  const session = await getServerUser();
  if (!session || !session.user) {
    permanentRedirect("/login");
  }
  const [ownRepos, sharedRepos] = await Promise.all([
    getOwnRepos(),
    getSharedRepos(),
  ]);
  return (
      <Wrapper>
        <div className=" flex  w-full h-screen overflow-hidden  scrollbar">
          <Sidebar ownRepos={ownRepos} sharedRepos={sharedRepos} />
          <div className="flex items-center justify-center w-full h-full flex-grow">
            {children}
          </div>
        </div>
      </Wrapper>
  );
}
