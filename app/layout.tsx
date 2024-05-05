import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Wrapper from "@/components/Wrapper";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rag app",
  description: "Generated by create-llama",
};
async function getThreads(){
  try {
    const res=await fetch('http://localhost:3000/api/threads/get',{
      cache:'no-cache'
    })
    const data=await res.json()
    return data
  } catch (error) {
    console.log(error)
    return []
  }
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {threads}=await getThreads() as {threads:{id:string,heading:string}[]};
  return (
    <html lang="en">
      <body
        className={`gap-5 flex background-gradient items-start min-h-screen w-full scrollbar ${inter.className}`}
      >
        <Sidebar threads={threads}/>
        <Wrapper>
          {children}
        </Wrapper>
      </body>
    </html>
  );
}
