import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { verifyRepoShare } from "../../_action/repos";
import { getServerUser } from "@/lib/auth";

export default async function page(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerUser();
  const isLogedIn = session !== null;
  const searchParams = await props.searchParams;
  if (
    searchParams?.token === undefined ||
    searchParams?.tokenId === undefined
  ) {
    permanentRedirect("/login");
  }
  const { status, error } = await verifyRepoShare(
    searchParams?.tokenId as string,
    searchParams?.token as string
  );
  const success = status === 200;
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-[calc(100%-16px)] sm:w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
        {success ? (
          <>
            <CheckCircle2 size={40} strokeWidth={1.9} className="text-ui-500" />
            <p className="text-gray-500 font-semibold">Access Granted</p>
          </>
        ) : (
          <>
            <X size={40} strokeWidth={2.3} className="text-ui-500" />
            <p className="text-gray-500 font-semibold">{error}</p>
          </>
        )}
        <div>
          <Link
            href={isLogedIn ? "/" : "/login"}
            className={buttonVariants({ variant: "default" })+' !bg-ui-500 text-secondary'}
          >
            Go to {isLogedIn ? "Home" : "Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
