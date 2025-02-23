"use client";
import Link from "next/link";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { useState } from "react";
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
import { CheckCircle2, EyeIcon, EyeOffIcon } from "lucide-react";
import { registerUser } from "@/app/_action/auth";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
  const [showPassword,setShowPassword] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  async function googleLogin() {
    await signIn("google", { redirect: true, callbackUrl: "/" });
  }
  async function onSignupSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { success, message } = await registerUser(values);
      if (success === 409) {
        toast({
          variant: "destructive",
          title: message,
        });
      }
      if (success === 200) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Some error occured!",
        description: "Please try again later",
      });
      setIsLoggedIn(false);
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
                        <div className="relative">
                          <Input
                            placeholder="*******"
                            type={showPassword ? "text" : "password"}
                            className="!pr-10"
                            {...field}
                          />
                          <button
                            className="absolute duration-200 text-ui-600 right-2 top-2"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
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
                <Button type="submit" className="!bg-ui-600 !text-white">
                  {isLoading ? <Loader color="white" /> : "Sign Up"}
                </Button>
              </form>
            </Form>
            <div className="flex w-full items-center my-3">
              <p className="border-t w-full"></p>
              <p className="px-4">or</p>
              <p className="border-t w-full"></p>
            </div>
            <div className="grid grid-cols-3 gap-2  ">
              <Button
                variant="secondary"
                className="col-span-3 border-gray-300 border !rounded-md"
                onClick={googleLogin}
                type="button"
              >
                <Image src="/google.png" alt="Google Logo" width={24} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
          <CheckCircle2 size={40} strokeWidth={1.9} className="text-ui-500" />
          <p className="text-gray-500 font-semibold">
            A Verfication Email has sent to you
          </p>
        </div>
      )}
    </>
  );
}
