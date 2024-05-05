
import Link from "next/link";
import {   buttonVariants } from "./ui/button";
import { useParams } from "next/navigation";
export default function NewChat() {
  const params=useParams()
  console.log(params)
  return (
    <div className="w-full flex justify-end gap-4">
      <Link href={`/${params.id}/add`} className={buttonVariants({variant:"outline"})}>
          Add Doc
      </Link>
    </div>
  );
}
