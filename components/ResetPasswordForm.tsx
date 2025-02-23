"use client";
import { useState } from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button, buttonVariants } from "./ui/button";
import Loader from "./Loader";
import { CheckCircle2, EyeIcon, EyeOffIcon } from "lucide-react";
import { resetPassword } from "@/app/_action/auth";
import Link from "next/link";
const formSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm({userid}:{userid:number}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReseted, setIsReseted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  async function handleResetSumbit(values: z.infer<typeof formSchema>) {
    if (isLoading || isReseted) return;
    setIsLoading(true);
    try {
      const {success,message}=await resetPassword(userid,values.password);
      if(success!==200){
          throw new Error(message)
      }
      setIsReseted(true);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  return (
    <>
      {!isReseted ? (
        <div className="flex flex-col gap-8 px-6 py-8 w-full items-center justify-center">
          <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg p-4 sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md">
            <h1 className="md:text-3xl text-2xl font-extrabold leading-tight tracking-wide text-gray-900 dark:text-white mb-4">
              Reset Password
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleResetSumbit)}
                className="flex flex-col "
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormLabel>New Password</FormLabel>
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
                            {
                                showPassword ? <EyeOffIcon /> : <EyeIcon />
                            }
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormLabel>Confirm Password</FormLabel>
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
                <Button type="submit" className="!bg-ui-600 my-3 !text-white">
                  {isLoading ? <Loader color="white" /> : "Change Password"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      ) : (
        <div className="bg-white  dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg  sm:p-6 flex flex-col w-[calc(100%-16px)] sm:w-full sm:max-w-sm 2xl:max-w-md !p-10 gap-5 items-center">
            <CheckCircle2 size={40} strokeWidth={1.9} className="text-ui-500" />
            <p className="text-gray-500 font-semibold">Password Changed</p>
            <Link
            href="/login"
            replace={true}
            className={buttonVariants({ variant: "default" })+' !bg-ui-500 text-secondary'}
          >
            Go to Login
          </Link>
        </div>
      )}
    </>
  );
}
