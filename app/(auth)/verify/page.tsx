import { verifyUser } from "@/app/_action/auth";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import React from "react";

export default async function page(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  if (
    searchParams?.token === undefined ||
    searchParams?.tokenId === undefined
  ) {
    permanentRedirect("/login");
  }

  const res = await verifyUser(
    searchParams.tokenId as string,
    searchParams.token as string
  );
  return (
    <>
      {!res.verified ? (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-10 items-center">
          <X size={40} strokeWidth={2.3} className="text-ui-500" />
          <p className="text-gray-500 font-semibold">{res.message}</p>
        </div>
      ) : (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-[calc(100%-16px)] sm:w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
          <CheckCircle2 size={40} strokeWidth={1.9} className="text-ui-500" />
          <p className="text-gray-500 font-semibold">
            Confirmation Successful.
          </p>
          <Link
            href="/login"
            replace={true}
            className={
              buttonVariants({ variant: "default" }) + " !bg-ui-500 text-white"
            }
          >
            Login
          </Link>
        </div>
      )}
    </>
  );
}
