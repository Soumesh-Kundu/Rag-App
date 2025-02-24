import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocGPT",
  description: "Ai Platform for help with docuemnts",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={` flex background-gradient items-start overflow-hidden min-h-[100dvh] w-full scrollbar ${inter.className}`}
      >
          <Toaster />
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
