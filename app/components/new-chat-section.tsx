
import {  buttonVariants } from "./ui/button";
import Link from 'next/link'
export default function NewChat() {

  return (
    <div className="w-full flex justify-end gap-4">
      <Link href="/new" className={buttonVariants({variant:"outline"})}>
          New Doc 
      </Link>
    </div>
  );
}
