import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { useParams } from "next/navigation";
import {FolderPlusIcon} from "@heroicons/react/24/solid";
export default function NewChat() {
  const params = useParams();
  return (
    <div className="w-full flex justify-center gap-4">
      <Link
        href={`/${params.id}/add`}
        className={`${buttonVariants({ variant: "primary-rfull" })} gap-2 w-full`}
      >
        <FolderPlusIcon className="w-4 h-4" />
        <span className="md:hidden xl:inline">Add files</span>
      </Link>
    </div>
  );
}
