import Header from "@/app/components/header";
import ChatSection from "./components/chat-section";
import { existsSync } from "fs";
import FileUpload from "./components/FileUpload";
import { revalidatePath } from "next/cache";
import Wrapper from "./components/Wrapper";
async function dataExists() {
  return existsSync(process.cwd() + "/cache");
}
export default async function Home() {
  const data = await dataExists();
  return (
    <main className="w-full grid place-items-center">
      <Wrapper>
        {/* <Header /> */}
        <ChatSection />
      </Wrapper>
    </main>
  );
}
