import LoginForm from "@/components/LoginForm";
import { getServerUser } from "@/lib/auth";
import Image from "next/image";
import { permanentRedirect } from "next/navigation";
export const dynamic = "auto";
// insertData()
export default async function page() {
  const session = await getServerUser();
  if (session !== null) {
    permanentRedirect("/");
  }
  return (
    <main className="flex flex-col items-center h-screen w-screen ">
      <div className="flex items-center justif-center gap-1 -translate-x-5 mt-24 lg:mt-0">
          <Image src="/chatbot_rbg.png" alt="chatbot_image" width={100} height={100}/>
        <h2 className="text-3xl font-semibold">Doc<span className="text-ui-600">GPT</span></h2>
      </div>
      <LoginForm />
    </main>
  );
}
