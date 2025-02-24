import { verifyResetPToken } from "@/app/_action/auth";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { X } from "lucide-react";

export default async function page(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  if (
    searchParams?.token === undefined ||
    searchParams?.tokenId === undefined
  ) {
    // permanentRedirect("/login")
  }
  const { success, userid, message } = await verifyResetPToken(
    searchParams?.tokenId as string,
    searchParams?.token as string
  );
  switch (success) {
    case 200:
      return (
        <main className="grid place-items-center h-[100dvh] w-screen ">
          <ResetPasswordForm userid={userid as number} />
        </main>
      );
    case 401:
    case 403:
      return (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-10 items-center">
          <X size={40} strokeWidth={2.3} className="text-ui-500" />
          <p className="text-gray-500 font-semibold">{message}</p>
        </div>
      );
    default:
      return (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-10 items-center">
          <X size={40} strokeWidth={2.3} className="text-ui-500" />
          <p className="text-gray-500 font-semibold">{message}</p>
        </div>
      );
  }
}
