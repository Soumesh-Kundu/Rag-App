import { buttonVariants } from "@/components/ui/button";
import { serverUser as server_User } from "@/lib/db/realm";
import { verify } from "jsonwebtoken";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import React from "react";

async function addInvitation({
  token,
  tokenId,
}: {
  token: string;
  tokenId: string;
}) {
  const serverUser = await server_User();
  const db = serverUser.mongoClient("mongodb-atlas").db("private-gpt");
  const data = verify(
    token,
    (process.env.JWT_SECRET as string) ?? "secret"
  ) as { userId: string; repoId: string };
  if (!data) {
    console.log("invalid token");
    return false;
  }
  const { userId, repoId } = data;
  const accessToken = await db
    .collection("tokens")
    .findOne({ _id: { $oid: tokenId } });

  if (
    !accessToken ||
    !(accessToken?.userId === userId) ||
    !(accessToken?.repoId === repoId)
  ) {
    console.log("invalid token");
    return false;
  }
  await db
    .collection("threads")
    .updateOne(
      { _id: { $oid: accessToken.repoId } },
      { $push: { shared_access: { userId: userId, role: accessToken.role } } }
    );
  await db.collection("tokens").deleteOne({ _id: { $oid: tokenId } });
  return true;
}
export default async function page({
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  if(searchParams?.token === undefined || searchParams?.tokenId === undefined){
    permanentRedirect("/login")
  }
  const success=await addInvitation({
    token: searchParams?.token as string,
    tokenId: searchParams?.tokenId as string,
  });
  return (
    <>
      {success ? (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-[calc(100%-16px)] sm:w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
          <CheckCircle2
            size={40}
            strokeWidth={1.9}
            className="text-ui-500"
          />
          <p className="text-gray-500 font-semibold">Access Granted</p>
          <div>
            <Link
              href="/login"
              className={buttonVariants({ variant: "default" })}
            >
              Go to Login
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-[calc(100%-16px)] sm:w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
          <X
            size={40}
            strokeWidth={2.3}
            className="text-ui-500"
          />
          <p className="text-gray-500 font-semibold">Invalid Request</p>
          <div>
            <Link
              href="/login"
              className={buttonVariants({ variant: "default" })}
            >
              Go to Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
