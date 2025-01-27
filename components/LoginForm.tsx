"use client";
import Link from "next/link";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { FormEvent, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { app, currentUser, googlelogin, loginEmailPassword } from "@/lib/db/realm";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .min(0),
  password: z.string(),
});

export default function LoginForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function googleLogin() {
    try {
      const user=await googlelogin()
      if(!user){
        console.log("google auth error")
        return
      }
      await Promise.all([
        user?.refreshProfile(),
        user?.refreshAccessToken(),
        user?.refreshCustomData(),
      ]);
      router.replace("/");
    } catch (error) {
      console.log(error)
    }
  }
  async function onLoginSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const user = await loginEmailPassword(values.email, values.password);
      if (!user) {
        console.log("error");
      } else {
        console.log(user);
        await Promise.all([
          user?.refreshProfile(),
          user?.refreshAccessToken(),
          user?.refreshCustomData(),
        ]);
        router.replace("/");
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }
  return (
    <div className="flex flex-col gap-8 px-6 py-8 w-full items-center justify-center">
      <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow p-4 sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md">
        <h1 className="md:text-3xl text-2xl font-extrabold leading-tight tracking-wide text-gray-900 dark:text-white mb-8">
          Welcome back
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onLoginSubmit)}
            className="flex flex-col "
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-3 mt-1.5">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*******" type="password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <p className="text-sm mb-3 font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet ?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Sign up
              </Link>
            </p>
            <Button type="submit">
              {isLoading ? (
                <Loader color="white" stroke={1.6} size={20} />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
        <div className="flex w-full items-center my-4">
          <p className="border-t w-full"></p>
          <p className="px-4">or</p>
          <p className="border-t w-full"></p>
        </div>
        <div className="grid grid-cols-3 gap-2  ">
          <Button variant="outline" onClick={googleLogin} type="button">
            <img src="/google.png" alt="Google Logo" width="24" />
          </Button>
          <Button
            variant="outline"
            type="button"
            className="!bg-blue-500 hover:!bg-blue-600"
          >
            <img src="/facebook.png" alt="Google Logo" width="30" />
          </Button>
          <Button type="button">
            <img src="/github.png" alt="Google Logo" width="30" />
          </Button>
        </div>
      </div>
    </div>
  );
}
