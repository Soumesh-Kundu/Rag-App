import Header from "@/app/components/header";
import ChatSection from "./components/chat-section";
import { existsSync } from "fs";
import FileUpload from "./components/FileUpload";
import { revalidatePath } from "next/cache";
import Wrapper from "./components/Wrapper";
async function dataExists() {
  return existsSync(process.cwd() + "/cache");
}
async function revalidateRoot() {
  "use server";
  revalidatePath("/");
}
export default async function Home() {
  const data = await dataExists();
  return (
    <main className="gap-10 grid place-items-center background-gradient min-h-screen w-full">
      <Wrapper>
        {/* <Header /> */}
        {data ? (
          <ChatSection revalidationRoot={revalidateRoot} />
        ) : (
          <FileUpload revalidateRoot={revalidateRoot} />
        )}
      </Wrapper>
    </main>
  );
}
