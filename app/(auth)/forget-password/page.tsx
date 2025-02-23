"use client";
import { forgetPassword } from "@/app/_action/auth";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { set, z } from "zod";
const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .min(0),
});

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMailSent, setIsMailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function handleForgetPassword(values: z.infer<typeof formSchema>) {
    if (isLoading || isMailSent) return;
    try {
      setIsLoading(true);
      const { success, message } = await forgetPassword(values.email);
      switch (success) {
        case 404:
          toast({
            variant: "destructive",
            title: "User doesn't exist",
          });
        break;
        case 200:
          setIsMailSent(true);
        break
        case 500:
          throw new Error(message);
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops!!",
        description: "Something went wrong",
      });
    }
    setIsLoading(false);
  }
  return (
    <>
        <main className="flex flex-col gap-8 px-6 py-8 w-full items-center justify-center h-screen">
      {!isMailSent ? (
          <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow p-4 sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md">
            <h1 className="md:text-3xl text-2xl font-bold leading-tight tracking-wide text-gray-900 dark:text-white mb-4">
              Verify Yourself
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleForgetPassword)}
                className="flex flex-col "
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Alex@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="!bg-ui-600 mt-4 !text-white">
                  {isLoading ? (
                    <Loader color="white" stroke={1.8} size={20} />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>
            </Form>
            <p className="md:text-sm font-medium my-3 text-center   text-gray-500">
              Remember ?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-500"
              >
                Login
              </Link>
            </p>
          </div>
      ) : (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
          <CheckCircle2 size={40} strokeWidth={1.9} className="text-ui-500" />
          <p className="text-gray-500 font-semibold">
            Reset Password mail is sent to you
          </p>
        </div>
      )}
      </main>
    </>
  );
}
