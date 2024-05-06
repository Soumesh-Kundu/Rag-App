import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Button } from "../button";
import { Input } from "../input";

type Props = {
  children: React.ReactNode;
};

export default function ShareRepo({ children }: Props) {
  const [email, setEmail] = useState("");
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
      setEmail(e.target.value);
  }
  function handleShareRepo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //   shareRepo(email);
  }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleShareRepo} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="invite-email" className="text-lg font-medium">
              Email
            </label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div>
            <Button type="submit" disabled={false}>
              Send invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
