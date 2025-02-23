import { permanentRedirect } from "next/navigation";
import {getSharedUsers, initialRepo } from "../../_action/repos";
import { getServerUser } from "@/lib/auth";
import SetInitComponent from "@/components/SetInitComponent";
export const dynamic = "auto";

export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await getServerUser();
  if (!session || !session.user) {
    permanentRedirect("/login");
  }
  const dyn_params = await params;
  const [initThread,sharedUsers ]=await Promise.all([initialRepo(dyn_params.id),getSharedUsers(dyn_params.id)])
  return (
    <>
      <SetInitComponent initThread={initThread} users={sharedUsers.res}/>
      {children}
    </>
  );
}
