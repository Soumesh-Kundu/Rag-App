"use client";
import Link from "next/link";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { FormEvent, useState } from "react";
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
import { CheckCircle2 } from "lucide-react";
import { googlelogin, registerEmailPassword, serverUser } from "@/lib/db/realm";
import { addUser } from "@/app/_action";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .min(0),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router=useRouter()
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
  async function onSignupSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const user = await registerEmailPassword(values);
      if (!user) {
        console.log("error");
      }
      await addUser(values.email,values.name)
      setIsLoggedIn(true);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }
  return (
    <>
      {!isLoggedIn ? (
        <div className="flex flex-col gap-8 px-6 py-8 w-full items-center justify-center">
          <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg p-4 sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md">
            <h1 className="md:text-3xl text-2xl font-extrabold leading-tight tracking-wide text-gray-900 dark:text-white mb-4">
              Get Started
            </h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSignupSubmit)}
                className="flex flex-col "
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    <FormItem className=" ">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="*******"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-sm mb-2 mt-1 font-light text-gray-500 dark:text-gray-400">
                  Already have an account ?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                  >
                    Log In
                  </Link>
                </p>
                <Button type="submit">
                  {isLoading ? <Loader /> : "Sign in"}
                </Button>
              </form>
            </Form>
            <div className="flex w-full items-center my-3">
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
      ) : (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
          <CheckCircle2
            size={40}
            strokeWidth={1.9}
            className="text-ui-500"
          />
          <p className="text-gray-500 font-semibold">
            A Verfication Email has sent to you
          </p>
        </div>
      )}
    </>
  );
}
